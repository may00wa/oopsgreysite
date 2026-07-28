/*
 * Starts a ₦25,000 Flutterwave Standard Checkout transaction.
 *
 * TEST MODE: set FLW_SECRET_KEY in Netlify to your Flutterwave TEST secret key.
 * LIVE MODE: replace it with the LIVE secret key only after Flutterwave approves
 * the business account.
 *
 * The secret key stays server-side in Netlify; it is never sent to the browser.
 */

const AMOUNT_NGN = 25000;

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

  // Keep demo mode available when no Flutterwave key is configured, but never
  // silently fake a successful payment once a key has been configured.
  if (!secretKey) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'demo',
        reference: 'DEMO-' + Math.random().toString(36).slice(2, 8).toUpperCase()
      })
    };
  }

  if (!body.email || !body.slot) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Email and selected slot are required.' })
    };
  }

  const origin = getOrigin(event);
  const txRef = `OOPS-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const paymentOptions = {
    card: 'card',
    transfer: 'banktransfer',
    ussd: 'ussd'
  };

  try {
    const res = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: AMOUNT_NGN,
        currency: 'NGN',
        redirect_url: `${origin}/?flw_return=1`,
        payment_options: paymentOptions[body.method] || 'card, banktransfer, ussd',
        customer: {
          email: body.email,
          name: body.name || '',
          phone_number: body.phone || ''
        },
        meta: {
          slot: body.slot,
          name: body.name || '',
          email: body.email,
          phone: body.phone || '',
          business: body.business || '',
          link: body.link || '',
          sells: body.sells || '',
          age: body.age || '',
          reason: body.reason || '',
          settled: body.settled || ''
        },
        customizations: {
          title: 'Oops! Consultation',
          description: 'One honest conversation, 30 minutes before you spend another naira.',
          logo: `${origin}/assets/logo-white.png`
        }
      })
    });

    const json = await res.json();

    if (!res.ok || json.status !== 'success' || !json.data?.link) {
      throw new Error(json.message || 'Flutterwave rejected the request.');
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'flutterwave',
        reference: txRef,
        authorizationUrl: json.data.link
      })
    };
  } catch (err) {
    console.error('Flutterwave initialization failed:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Could not start payment.', detail: err.message })
    };
  }
};

function getOrigin(event) {
  const headers = event.headers || {};
  const host = headers.host || headers.Host || 'localhost:8888';
  const proto = headers['x-forwarded-proto'] || headers['X-Forwarded-Proto'] || 'https';
  return `${proto}://${host}`;
}
