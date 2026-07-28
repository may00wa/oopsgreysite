/*
 * Creates a Flutterwave Standard Checkout payment.
 * The browser is redirected to the exact hosted link returned by Flutterwave.
 */

const AMOUNT = 25000;
const SITE_URL = 'https://oops-site.netlify.app';

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  if (!process.env.FLW_SECRET_KEY) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Flutterwave is not configured on this site yet.' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body.' }) };
  }

  if (!body.email || !body.name || !body.slot) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing booking details.' }) };
  }

  const txRef = `OOPS-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const payload = {
    tx_ref: txRef,
    amount: AMOUNT,
    currency: 'NGN',
    redirect_url: `${SITE_URL}/?payment=return`,
    customer: {
      email: body.email,
      name: body.name,
      phonenumber: body.phone || body.phoneNumber || undefined
    },
    customizations: {
      title: 'Oops! Consultation',
      description: '30-minute brand consultation'
    },
    payment_options: 'card, ussd, banktransfer',
    meta: {
      slot: body.slot,
      name: body.name,
      email: body.email,
      phone: body.phone || body.phoneNumber || '',
      business: body.business || '',
      link: body.link || '',
      sells: body.sells || '',
      age: body.age || '',
      reason: body.reason || '',
      settled: body.settled || ''
    }
  };

  // Remove undefined values before sending JSON.
  if (!payload.customer.phonenumber) delete payload.customer.phonenumber;

  try {
    const res = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json();

    if (!res.ok || json.status !== 'success' || !json.data || !json.data.link) {
      console.error('Flutterwave initialization failed:', JSON.stringify(json));
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: json.message || 'Flutterwave could not create the checkout.' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'test-or-live',
        reference: txRef,
        authorizationUrl: json.data.link
      })
    };
  } catch (err) {
    console.error('Flutterwave request failed:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Could not start payment.' })
    };
  }
};
