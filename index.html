/* ==========================================================================
   create-hold.js
   Puts a ten minute hold on a slot the moment someone picks it, so two
   people can never both pay for the same half hour.

   DEMO MODE (default): confirms the hold without a real database, and
   the ten minute countdown runs client side in script.js.

   REAL MODE (once SUPABASE_URL and SUPABASE_SERVICE_KEY are set):
   Writes a row to a "holds" table with an expiry timestamp. Any slot
   with a live, unexpired hold is treated as unavailable by
   get-availability.js above.
   ========================================================================== */

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

  const { slotId } = body;
  if (!slotId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'slotId is required.' }) };
  }

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const hasSupabase = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY;

  if (!hasSupabase) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'demo', slotId, expiresAt })
    };
  }

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    // Do not overwrite another person's active hold.
    const now = new Date().toISOString();
    const { data: activeHold, error: holdReadError } = await supabase
      .from('holds')
      .select('slot_id, expires_at')
      .eq('slot_id', slotId)
      .gt('expires_at', now)
      .maybeSingle();

    if (holdReadError) throw holdReadError;
    if (activeHold) {
      return {
        statusCode: 409,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'That slot is currently being held by another customer.' })
      };
    }

    const { data: booked, error: bookingReadError } = await supabase
      .from('bookings')
      .select('reference')
      .filter('slot->>id', 'eq', slotId)
      .limit(1);

    if (bookingReadError) throw bookingReadError;
    if (booked && booked.length) {
      return {
        statusCode: 409,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'That slot has already been booked.' })
      };
    }

    const { error } = await supabase
      .from('holds')
      .upsert({ slot_id: slotId, expires_at: expiresAt }, { onConflict: 'slot_id' });

    if (error) throw error;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'live', slotId, expiresAt })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not hold this slot.', detail: err.message })
    };
  }
};
