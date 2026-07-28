// Starts the Oops! ₦25,000 Flutterwave Standard checkout.
// The secret key stays server-side in Netlify environment variables.

const AMOUNT = 25000;
const CURRENCY = 'NGN';

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body.' }) };
  }

  const secretKey = process.env.FLW_SECRET_KEY;
  if (!secretKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Flutterwave is not configured yet.' })
    };
  }

  if (!body.email || !body.name || !body.slot) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing booking details.' })
    };
  }

  const txRef = `OOPS-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const redirectUrl = `${process.env.SITE_URL || 'https://oops-site.netlify.app'}/?payment=return`;

  const paymentOptions = {
    card: 'card',
    transfer: 'banktransfer',
    ussd: 'ussd'
  };

  const payload = {
    tx_ref: txRef,
    amount: AMOUNT,
    currency: CURRENCY,
    redirect_url: redirectUrl,
    payment_options: paymentOptions[body.method] || 'card, banktransfer, ussd',
    customer: {
      email: body.email,
      name: body.name,
      phonenumber: body.phone || body.phone_number || undefined
    },
    customizations: {
      title: 'Oops! Consultation',
      description: 'One honest conversation, 30 minutes before you spend another naira.'
    },
    meta: {
      slot: body.slot,
      name: body.name,
      email: body.email,
      phone: body.phone || body.phone_number || '',
      business: body.business || '',
      link: body.link || '',
      sells: body.sells || '',
      age: body.age || '',
      reason: body.reason || '',
      settled: body.settled || ''
    }
  };

  try {
    const res = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!res.ok || json.status !== 'success' || !json.data?.link) {
      throw new Error(json.message || 'Flutterwave rejected the payment request.');
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference: txRef,
        authorizationUrl: json.data.link
      })
    };
  } catch (err) {
    console.error('Flutterwave initialization failed:', err);
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Could not start payment.' })
    };
  }
};
