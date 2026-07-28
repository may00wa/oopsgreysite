// =========================================================
// CONFIG — reviews board only.
//
// Booking, payment, and slot-holding now run through Netlify
// Functions (see the /netlify/functions folder) and are turned
// on by adding keys in Netlify's dashboard — see README, Boxes
// 2-4. Nothing in this file affects booking.
// =========================================================

// ---- AIRTABLE (stores + displays live reviews — no code, just a free account) ----
// Get these after creating your base — see README, Box 6.
export const AIRTABLE_CONFIG = {
  baseId: "REPLACE_ME",       // starts with "app..."
  tableName: "Reviews",        // must match your Airtable table name exactly
  apiKey: "REPLACE_ME"         // your Airtable Personal Access Token (starts with "pat...")
};
