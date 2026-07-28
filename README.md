# Getting Oops! live

The whole site already works the moment you deploy it. Slots, the
questionnaire, the payment screen, the confirmation, the reviews —
all of it is clickable right now, in demo mode. What's below turns it
from "working demo" into "actually taking real bookings and real
money." Six boxes. Do them in order, or skip around — nothing breaks
either way (see the note at the very end).

Nothing here needs you to touch code. You are only ever pasting
things into labeled boxes on a website.

---

## Box 1: Deploy the site

1. Go to [app.netlify.com](https://app.netlify.com) → sign up.
2. Drag your whole project folder onto the dashboard's drop zone.
3. Netlify gives you a live web address immediately (like
   `oops-branding.netlify.app`) — the site is already live and
   clickable at this point, fully in demo mode.

---

## Box 2: Give the site your real address (optional)

1. In Netlify, open your site → **Domain settings**.
2. Click **Add a custom domain**, type in oopsbranding.com (or
   whichever you own).
3. Netlify shows you two lines of text.
4. Go to wherever you bought your domain (GoDaddy, Namecheap, etc.),
   find **DNS settings**, and paste those two lines in.
5. Wait a few hours. Your domain now points at the site.

---

## Box 3: Connect Flutterwave (TEST MODE first)

1. Log in to Flutterwave and leave the dashboard in **Test Mode**.
2. Open your Developer/API settings and copy the **Test Secret Key**. Flutterwave test secret keys begin with `FLWSECK_TEST`.
3. In Netlify, open **Site configuration → Environment variables**.
4. Add:
   - `FLW_SECRET_KEY` → your Flutterwave **Test Secret Key**
   - `FLW_SECRET_HASH` → a strong random secret value you choose for webhook verification
5. Redeploy the site after saving the variables.
6. In Flutterwave, go to **Settings → Webhooks** and set the webhook URL to:
   `https://yoursite.com/.netlify/functions/flutterwave-webhook`
7. Set Flutterwave's webhook secret hash to the exact same value you used for `FLW_SECRET_HASH`.

The website uses Flutterwave Standard Checkout. The secret key stays on Netlify's server and is never exposed to the browser.

**Do not replace the test key with a live key yet.** Flutterwave provides Test Mode specifically for simulated transactions and recommends testing the integration before switching to Live Mode.

## Box 4: Let the site remember bookings (Supabase)

1. Go to supabase.com, make a free account, click **New project**.
2. Give it any name, wait for it to finish setting up.
3. Go to **Project Settings → API**. Copy the **Project URL** and the
   **service_role key**.
4. In Netlify's environment variables, add two more:
   - `SUPABASE_URL` → paste the Project URL
   - `SUPABASE_SERVICE_KEY` → paste the service_role key
5. Inside Supabase, go to the **SQL editor** and run this once, so it
   has somewhere to store slots, holds, and bookings:

   ```sql
   create table slots (
     id text primary key,
     starts_at timestamptz,
     label text
   );
   create table holds (
     slot_id text primary key,
     expires_at timestamptz
   );
   create table bookings (
     reference text primary key,
     slot jsonb,
     name text,
     email text,
     phone text,
     business text,
     link text,
     sells text,
     age text,
     reason text,
     settled text,
     confirmed_by_oops boolean default false,
     created_at timestamptz default now()
   );
   ```

6. Done. The site now has a real memory for who booked what, and a
   slot someone else is paying for can't be double-booked.

---

## Box 5: Let emails actually send (Resend)

1. Go to resend.com, make an account.
2. Add your domain. It gives you a few lines of text to paste into
   your domain's DNS settings, same place as Box 2.
3. Once it shows your domain as verified, copy your **API Key**.
4. In Netlify's environment variables, add:
   - `RESEND_API_KEY` → paste the API key
   - `NOTIFY_EMAIL` → the inbox you personally read (e.g.
     `hello@oopsbranding.com`)
5. Done. Confirmation emails and booking briefs will now actually
   arrive.

---

## Box 6: Turn on live reviews (Airtable)

1. Go to airtable.com, sign up free.
2. Create a new **Base**. Name the table `Reviews`.
3. Add these columns exactly (case-sensitive):
   - `reviewerName` — Single line text
   - `reviewerBusiness` — Single line text
   - `reviewText` — Long text
   - `clarity` — Number
   - `Created` — **Created time** (pick this exact field type from
     the list, don't type it as plain text)
4. Get your **Base ID**: open the base → **Help → API documentation**
   → it's shown at the top, starts with `app...`.
5. Get your **Personal Access Token**: click your profile icon → 
   **Developer Hub** → **Personal access tokens** → **Create token**.
   - Name it "Oops Website"
   - Scopes: add `data.records:read` and `data.records:write`
   - Access: add the base you just made
   - Create it, copy the token (starts with `pat...`) — shown once
6. Open `js/config.js` and fill in:
   ```js
   export const AIRTABLE_CONFIG = {
     baseId: "app...",
     tableName: "Reviews",
     apiKey: "pat..."
   };
   ```

**Honest caveat:** this token lives in a file the browser downloads,
so a technically determined person could find it and write to your
Reviews table directly. Low-stakes for a small review board — but
don't reuse this token anywhere sensitive, and you can revoke and
replace it instantly from the same Developer Hub page if needed.

---

## Box 7: The one human step

This system was built on purpose to still need a person. Every time
a booking brief lands in your inbox, someone reads it and replies to
confirm the slot within 24 hours. Decide now who that person is.
That's the only box with no button to click — just a habit to keep.

---

## What happens if you skip a box

Nothing breaks. Every function checks whether its box is filled in
before doing anything with it.

- Skip Box 3 (Flutterwave) — the payment screen still walks through end
  to end, just without touching real money.
- Skip Box 4 (Supabase) — slots still show up and booking still
  works, just from a small built-in list instead of a real,
  shared calendar (two people could theoretically pick the same slot).
- Skip Box 5 (Resend) — bookings still complete, just without emails
  going out.
- Skip Box 6 (Airtable) — reviews still submit and appear on the
  page, just only for that visitor's browser session, not
  permanently or shared with other visitors.

Turn each one on whenever you're ready, in any order. Nothing you've
already set up gets undone by adding another box later.

---

## Testing before you go fully live

1. Deploy the site to Netlify.
2. Confirm `FLW_SECRET_KEY` is the Flutterwave **Test Secret Key**.
3. Book a consultation using the website.
4. Select a payment method and click **Pay and lock slot**.
5. Flutterwave should open its Test Mode checkout.
6. Use one of Flutterwave's official test cards from its testing documentation.
7. Complete the simulated payment.
8. Flutterwave redirects you back to the Oops! website.
9. The website calls `verify-payment` and checks the transaction server-side before showing the paid confirmation screen.
10. Check Flutterwave's Test Mode dashboard for the transaction.
11. If Supabase and Resend are configured, also check that the booking is stored and the expected emails are sent.
12. Test a failed/cancelled payment too. It must **not** show a paid confirmation.

Official Flutterwave test cards:
https://developer.flutterwave.com/v3.0/docs/testing

When the test flow is reliable and your Flutterwave business account has been approved, switch to Live Mode and replace `FLW_SECRET_KEY` with the Live Secret Key. Do not use a live key for testing.

## If something looks broken

Right-click the page → **Inspect** → **Console** tab. Any error shows
up there in plain English, and will usually name exactly which piece
(Supabase, Flutterwave, Resend, Airtable) isn't finding what it expects.
