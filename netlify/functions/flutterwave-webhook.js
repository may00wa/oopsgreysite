// Flutterwave webhook. This is a server-to-server notification endpoint.
// It verifies the webhook signature and then independently verifies the
// transaction with Flutterwave before recording a booking.

const crypto = require('crypto');

const EXPECTED_AMOUNT = 25000;
const EXPECTED_CURRENCY = 'NGN';

function validSignature(event) {
  const secretHash = process.env.FLW_SECRET_HASH;
  if (!secretHash) return false;

  const headers = event.headers || {};
  const signature = headers['flutterwave-signature'] || headers['Flutterwave-Signature'];
  if (signature) {
    const digest = crypto.createHmac('sha256', secretHash).update(event.body || '').digest('base64');
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  }

  // Backward-compatible support for Flutterwave's v3 verif-hash header.
  const legacy = headers['verif-hash'] || headers['Verif-Hash'];
  return !!legacy && legacy === secretHash;
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  if (!validSignature(event)) {
    return { statusCode: 401, body: 'Invalid webhook signature.' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON.' };
  }

  const data = payload.data || {};
  const transactionId = data.id;
  const eventType = payload.type || payload.event;

  if (!transactionId || (eventType && !['charge.completed', 'charge.success'].includes(eventType))) {
    return { statusCode: 200, body: 'Event ignored.' };
  }

  const secretKey = process.env.FLW_SECRET_KEY;
  if (!secretKey) {
    console.error('FLW_SECRET_KEY is missing.');
    return { statusCode: 500, body: 'Payment configuration missing.' };
  }

  try {
    const verifyRes = await fetch(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`, {
      headers: { Authorization: `Bearer ${secretKey}` }
    });
    const verifyJson = await verifyRes.json();
    const verified = verifyJson.data || {};

    const validPayment = verifyJson.status === 'success'
      && verified.status === 'successful'
      && Number(verified.amount) === EXPECTED_AMOUNT
      && verified.currency === EXPECTED_CURRENCY;

    if (!validPayment) {
      console.warn('Flutterwave webhook payment failed verification.');
      return { statusCode: 200, body: 'Payment not confirmed.' };
    }

    const reference = verified.tx_ref || data.tx_ref;
    const meta = verified.meta || data.meta || {};

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

      const { data: existing } = await supabase
        .from('bookings')
        .select('reference')
        .eq('reference', reference)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase.from('bookings').insert({
          reference,
          slot: meta.slot || null,
          name: meta.name || verified.customer?.name || '',
          email: meta.email || verified.customer?.email || '',
          business: meta.business || '',
          link: meta.link || '',
          sells: meta.sells || '',
          age: meta.age || '',
          reason: meta.reason || '',
          settled: meta.settled || '',
          confirmed_by_oops: false
        });
        if (error) throw error;
      }
    }

    if (process.env.RESEND_API_KEY) {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const notifyEmail = process.env.NOTIFY_EMAIL || 'consult@oopsbranding.com';
      const slotLabel = meta.slot ? `${meta.slot.date} · ${meta.slot.time} WAT` : 'your slot';
      const customerEmail = meta.email || verified.customer?.email;

      if (customerEmail) {
        await resend.emails.send({
          from: 'Oops! <consult@oopsbranding.com>',
          to: customerEmail,
          subject: `Locked in: ${slotLabel}`,
          text: `Your call is booked for ${slotLabel}.\n\nOops will email you within 24 hours to confirm.\n\nReference: ${reference}`,
          attachments: [{
            filename: 'oops-consultation.ics',
            content: Buffer.from(buildIcs(meta.slot, reference)).toString('base64')
          }]
        });
      }

      await resend.emails.send({
        from: 'Oops! Bookings <consult@oopsbranding.com>',
        to: notifyEmail,
        subject: `New booking, ${slotLabel}, Ref ${reference}`,
        text: [
          `NEW BOOKING, ${slotLabel}, Ref ${reference}`,
          '',
          `${meta.business || ''}   ${meta.link || ''}`,
          `${meta.name || ''}  ·  ${customerEmail || ''}`,
          '',
          `Sells: ${meta.sells || ''}`,
          `Been running: ${meta.age || ''}`,
          `Booked because: ${meta.reason || ''}`,
          `Wants settled: ${meta.settled || ''}`,
          '',
          'Payment: confirmed, ₦25,000'
        ].join('\n')
      });
    }

    return { statusCode: 200, body: 'ok' };
  } catch (err) {
    console.error('Webhook processing failed:', err);
    return { statusCode: 500, body: 'Webhook processing failed.' };
  }
};

function buildIcs(slot, reference) {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `UID:${reference}@oopsbranding.com`,
    `DTSTAMP:${now}`,
    'SUMMARY:Oops! consultation',
    `DESCRIPTION:Reference ${reference}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}
