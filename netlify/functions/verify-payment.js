/* Verifies a Flutterwave transaction server-side before the UI treats it as paid. */
exports.handler = async function (event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const params = event.queryStringParameters || {};
  const transactionId = params.transaction_id;
  const txRef = params.tx_ref;

  if (!transactionId || !txRef || !process.env.FLW_SECRET_KEY) {
    return { statusCode: 400, body: JSON.stringify({ verified: false }) };
  }

  try {
    const res = await fetch(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`, {
      headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` }
    });
    const json = await res.json();
    const data = json.data || {};

    const verified =
      res.ok &&
      json.status === 'success' &&
      data.status === 'successful' &&
      data.tx_ref === txRef &&
      Number(data.amount) === 25000 &&
      data.currency === 'NGN';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verified,
        reference: data.tx_ref || txRef,
        status: data.status || null
      })
    };
  } catch (err) {
    console.error('Flutterwave verification failed:', err);
    return { statusCode: 500, body: JSON.stringify({ verified: false }) };
  }
};
