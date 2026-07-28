/*
 * Flutterwave v3 webhook.
 * The Secret Hash configured in Flutterwave must match FLW_SECRET_HASH in Netlify.
 */
const crypto = require('crypto');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const configuredHash = process.env.FLW_SECRET_HASH;
  const incomingHash = event.headers['verif-hash'] || event.headers['Verif-Hash'];

  if (!configuredHash || !incomingHash || incomingHash !== configuredHash) {
    return { statusCode: 401, body: 'Invalid webhook signature.' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON.' };
  }

  // Flutterwave may send several event shapes. Only process successful charges.
  if (payload.event !== 'charge.completed' && payload.event !== 'charge.success') {
    return { statusCode: 200, body: 'Event ignored.' };
  }

  const data = payload.data || {};
  if (data.status !== 'successful' || Number(data.amount) < 25000 || data.currency !== 'NGN') {
    return { statusCode: 200, body: 'Payment not eligible for booking.' };
  }

  // Verify the transaction independently before recording it.
  if (!process.env.FLW_SECRET_KEY || !data.id || !data.tx_ref) {
    return { statusCode: 400, body: 'Missing transaction details.' };
  }

  try {
    const verifyRes = await fetch(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(data.id)}/verify`, {
      headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` }
    });
    const verifyJson = await verifyRes.json();
    const verified =
      verifyRes.ok &&
      verifyJson.status === 'success' &&
      verifyJson.data &&
      verifyJson.data.status === 'successful' &&
      verifyJson.data.tx_ref === data.tx_ref &&
      Number(verifyJson.data.amount) >= 25000 &&
      verifyJson.data.currency === 'NGN';

    if (!verified) return { statusCode: 400, body: 'Payment verification failed.' };
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    return { statusCode: 500, body: 'Verification error.' };
  }

  const meta = data.meta || {};
  const hasSupabase = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY;

  if (hasSupabase) {
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
      const { error } = await supabase.from('bookings').insert({
        reference: data.tx_ref,
        slot: meta.slot,
        name: meta.name,
        email: data.customer?.email || meta.email,
        business: meta.business,
        link: meta.link,
        sells: meta.sells,
        age: meta.age,
        reason: meta.reason,
        settled: meta.settled,
        confirmed_by_oops: false
      });
      if (error) console.error('Supabase write failed:', error.message);
    } catch (err) {
      console.error('Supabase write failed:', err.message);
    }
  }

  return { statusCode: 200, body: 'ok' };
};
