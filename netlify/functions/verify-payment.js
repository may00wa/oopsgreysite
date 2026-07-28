// Verifies the Flutterwave transaction after the customer returns from checkout.

const EXPECTED_AMOUNT = 25000;
const EXPECTED_CURRENCY = 'NGN';

exports.handler = async function (event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const params = event.queryStringParameters || {};
  const transactionId = params.transaction_id;
  const txRef = params.tx_ref;

  if (!transactionId || !txRef) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing transaction details.' }) };
  }

  const secretKey = process.env.FLW_SECRET_KEY;
  if (!secretKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Flutterwave is not configured.' }) };
  }

  try {
    const res = await fetch(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`, {
      headers: { Authorization: `Bearer ${secretKey}` }
    });
    const json = await res.json();
    const data = json.data || {};

    const valid = json.status === 'success'
      && data.status === 'successful'
      && Number(data.amount) === EXPECTED_AMOUNT
      && data.currency === EXPECTED_CURRENCY
      && data.tx_ref === txRef;

    if (!valid) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Payment could not be verified.' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        reference: data.tx_ref,
        customer: data.customer || {},
        metadata: data.meta || {}
      })
    };
  } catch (err) {
    console.error('Flutterwave verification failed:', err);
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Could not verify payment.' })
    };
  }
};
