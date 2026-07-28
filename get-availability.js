/*
 * Server-side Flutterwave transaction verification.
 * The browser supplies the transaction ID/reference returned by Flutterwave;
 * this function uses the secret key to verify the payment before the UI calls
 * it successful.
 */

const EXPECTED_AMOUNT = 25000;
const EXPECTED_CURRENCY = 'NGN';

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const secretKey = process.env.FLW_SECRET_KEY;
  if (!secretKey) {
    return { statusCode: 503, body: JSON.stringify({ error: 'Flutterwave is not configured yet.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body.' }) };
  }

  const transactionId = body.transactionId;
  const txRef = body.txRef;

  if (!transactionId && !txRef) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Transaction ID or reference is required.' }) };
  }

  try {
    let url;
    if (transactionId) {
      url = `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`;
    } else {
      url = `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`;
    }

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    });
    const json = await res.json();
    const data = json.data;

    const valid = res.ok &&
      json.status === 'success' &&
      data &&
      data.status === 'successful' &&
      data.currency === EXPECTED_CURRENCY &&
      Number(data.amount) >= EXPECTED_AMOUNT &&
      (!txRef || data.tx_ref === txRef);

    if (!valid) {
      return {
        statusCode: 402,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Payment could not be verified.', status: data?.status || 'unknown' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verified: true,
        reference: data.tx_ref,
        transactionId: data.id,
        amount: data.amount,
        currency: data.currency,
        customer: data.customer || null
      })
    };
  } catch (err) {
    console.error('Flutterwave verification failed:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Could not verify payment.', detail: err.message })
    };
  }
};
