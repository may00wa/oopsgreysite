/* =========================================================
   OOPS! BRANDING SOLUTIONS — DESIGN TOKENS
   ========================================================= */
:root {
  --ink: #0E0E0E;
  --card: #1A1A1A;
  --paper: #F5F5F5;
  --grey-mid: #8A8A8A;
  --grey-line: #2A2A2A;
  --glass-bg: rgba(255,255,255,0.06);
  --glass-border: rgba(255,255,255,0.14);

  --font: 'Montserrat', sans-serif;
  --ease-snap: cubic-bezier(0.83, 0, 0.17, 1);
  --ease-soft: cubic-bezier(0.16, 1, 0.3, 1);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  background: var(--ink);
  color: var(--paper);
  font-family: var(--font);
  font-weight: 400;
  line-height: 1.4;
  overflow-x: hidden;
}
a { color: inherit; text-decoration: none; }
ul { list-style: none; }
button { font-family: var(--font); cursor: pointer; border: none; background: none; }
img { display: block; max-width: 100%; }
::selection { background: var(--paper); color: var(--ink); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}

/* =========================================================
   BUTTONS
   ========================================================= */
.btn {
  display: inline-block;
  font-family: var(--font);
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  font-size: 0.85rem;
  padding: 1rem 1.9rem;
  border: 2px solid var(--paper);
  transition: background 0.2s var(--ease-soft), color 0.2s var(--ease-soft);
}
.btn:focus-visible { outline: 3px solid var(--paper); outline-offset: 3px; }
.btn-primary { background: var(--paper); color: var(--ink); }
.btn-primary:hover { background: transparent; color: var(--paper); }
.btn-outline { background: transparent; color: var(--paper); }
.btn-outline:hover { background: var(--paper); color: var(--ink); }
.btn-nav { padding: 0.7rem 1.3rem; font-size: 0.72rem; }
@media (max-width: 720px) { .btn-nav { display: none; } }
.btn-full { width: 100%; text-align: center; }

/* on the light conversion section, invert the button colors */
.on-paper .btn-primary { background: var(--ink); color: var(--paper); border-color: var(--ink); }
.on-paper .btn-primary:hover { background: transparent; color: var(--ink); }

/* =========================================================
   FROSTED GLASS UTILITY — reserved for reviews + booking, never the hero
   ========================================================= */
.glass {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
}

/* =========================================================
   NAV
   ========================================================= */
.nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  padding: 1.1rem clamp(1.2rem, 4vw, 3rem);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: linear-gradient(to bottom, rgba(14,14,14,0.92), rgba(14,14,14,0));
}
.nav-logo img { height: 22px; width: auto; }
.nav-links {
  display: flex;
  gap: 2rem;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.nav-links a { opacity: 0.7; transition: opacity 0.2s; }
.nav-links a:hover { opacity: 1; }
@media (max-width: 720px) { .nav-links { display: none; } }

/* =========================================================
   HERO — card flip (the signature move)
   ========================================================= */
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6rem 1.2rem 4rem;
  overflow: hidden;
}

/* soft ambient glow behind the card — stays within the grey palette */
.hero::before {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  width: min(1100px, 140vw);
  height: min(700px, 90vw);
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 45%, transparent 70%);
  pointer-events: none;
}

/* fine grain texture, CSS-only (no image asset needed) */
.hero::after {
  content: '';
  position: absolute; inset: 0;
  opacity: 0.05;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.flip-scene {
  position: relative;
  z-index: 1;
  width: min(920px, 100%);
  aspect-ratio: 16 / 9;
  max-height: 68vh;
  perspective: 1800px;
}
.flip-card {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.5s var(--ease-snap);
}
.flip-card.flipped { transform: rotateY(180deg); }

.flip-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  background: linear-gradient(155deg, #202020 0%, var(--card) 45%, #151515 100%);
  border: 1px solid var(--grey-line);
  box-shadow: 0 40px 80px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}
/* corner bracket accents — small designed-object detail */
.flip-face::before, .flip-face::after {
  content: '';
  position: absolute;
  width: 22px; height: 22px;
  border-color: rgba(255,255,255,0.35);
  border-style: solid;
  border-width: 0;
}
.flip-face::before {
  top: 18px; left: 18px;
  border-top-width: 1.5px;
  border-left-width: 1.5px;
}
.flip-face::after {
  bottom: 18px; right: 18px;
  border-bottom-width: 1.5px;
  border-right-width: 1.5px;
}

.flip-face p {
  font-weight: 800;
  font-size: clamp(1.7rem, 5.2vw, 3.6rem);
  line-height: 1.05;
  text-transform: uppercase;
  letter-spacing: -0.01em;
}
.flip-back { transform: rotateY(180deg); }
.flip-back p { color: var(--paper); }

.hero-cue {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--grey-mid);
  z-index: 1;
}

/* =========================================================
   RECOGNIZE YOURSELF — desktop spine row
   ========================================================= */
.symptoms { border-top: 1px solid var(--grey-line); }

.symptoms-desktop {
  display: none;
  padding: clamp(4rem, 8vw, 7rem) clamp(1.2rem, 6vw, 6rem);
  gap: 3rem;
}
.spine {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: clamp(1.4rem, 2.4vw, 2rem);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  line-height: 1;
  white-space: nowrap;
  padding-right: 2rem;
  border-right: 2px solid var(--paper);
  flex-shrink: 0;
}
.row { display: flex; flex: 1; }
.row .item {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 1.4rem;
  border-left: 1px solid var(--grey-line);
}
.row .item:first-child { border-left: none; padding-left: 0; }
.num {
  font-size: clamp(4rem, 6.2vw, 7.5rem);
  font-weight: 900;
  line-height: 0.75;
  letter-spacing: -0.03em;
}
.rule { width: 100%; height: 1px; background: var(--grey-line); margin: 1.3rem 0 0; }
.row .item p {
  margin-top: 1.3rem;
  font-size: 0.78rem;
  font-weight: 500;
  line-height: 1.45;
  color: #a8a8a8;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

@media (min-width: 900px) {
  .symptoms-desktop { display: flex; }
  .symptoms-mobile { display: none; }
}

/* =========================================================
   RECOGNIZE YOURSELF — mobile stem layout
   ========================================================= */
.symptoms-mobile { padding: 3.5rem 1.4rem 3rem; }
.m-header { text-align: center; margin-bottom: 2.5rem; }
.m-header h2 {
  font-size: clamp(1.6rem, 6vw, 2rem);
  font-weight: 800;
  text-transform: uppercase;
  line-height: 1.1;
}
.m-item { display: flex; gap: 1rem; padding-bottom: 2.2rem; }
.m-item .stem {
  width: 2px;
  background: var(--paper);
  flex-shrink: 0;
  position: relative;
}
.m-item .stem::before {
  content: '';
  position: absolute;
  left: -3px; top: 0;
  width: 8px; height: 8px;
  background: var(--paper);
  border-radius: 50%;
}
.m-item:last-child .stem { background: transparent; }
.m-num {
  font-size: clamp(3.4rem, 15vw, 4.2rem);
  font-weight: 900;
  line-height: 0.78;
}
.m-item p {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1.45;
  color: #a8a8a8;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

/* =========================================================
   CONVERSION
   ========================================================= */
.convert {
  padding: clamp(5rem, 10vw, 8rem) clamp(1.2rem, 6vw, 6rem);
  background: var(--paper);
  color: var(--ink);
}
.convert-inner { max-width: 780px; }
.convert-head {
  font-size: clamp(1.8rem, 4.5vw, 3.2rem);
  font-weight: 800;
  text-transform: uppercase;
  line-height: 1.12;
  letter-spacing: -0.01em;
  margin-bottom: 2rem;
}
.convert-body {
  font-size: clamp(1.05rem, 1.8vw, 1.3rem);
  line-height: 1.5;
  max-width: 56ch;
  margin-bottom: 1.2rem;
  color: #2c2c2c;
}
.convert-body--bold { font-weight: 700; color: var(--ink); }
.convert .btn { margin-top: 1.5rem; }
.convert-fine { margin-top: 1rem; font-size: 0.78rem; color: #666; letter-spacing: 0.03em; }

/* =========================================================
   REVIEWS — frosted glass
   ========================================================= */
.reviews {
  padding: clamp(5rem, 10vw, 8rem) clamp(1.2rem, 6vw, 6rem);
  text-align: center;
  position: relative;
}
.reviews::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.05), transparent 60%);
  pointer-events: none;
}
.reviews-head { font-size: clamp(1.4rem, 3vw, 2.4rem); font-weight: 800; text-transform: uppercase; }
.reviews-sub { color: var(--grey-mid); margin: 0.6rem 0 clamp(2.5rem, 5vw, 4rem); font-size: 0.95rem; }

.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.2rem;
  margin-bottom: 2.5rem;
  text-align: left;
}
.review-card {
  padding: 1.8rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-radius: 2px;
}
.review-blocks { display: flex; gap: 4px; }
.review-block { width: 20px; height: 7px; background: rgba(255,255,255,0.15); }
.review-block.filled { background: var(--paper); }
.review-text { font-size: 1rem; line-height: 1.55; }
.review-meta { font-size: 0.75rem; color: var(--grey-mid); letter-spacing: 0.03em; text-transform: uppercase; }
.reviews .btn { margin: 0 0.5rem 1rem; }

/* =========================================================
   FOOTER — full standalone closing section
   ========================================================= */
.footer {
  border-top: 1px solid var(--grey-line);
  padding: clamp(4rem, 9vw, 7rem) clamp(1.2rem, 6vw, 6rem) 2.5rem;
  text-align: center;
}
.footer-logo img {
  height: clamp(48px, 9vw, 90px);
  width: auto;
  margin: 0 auto 1.2rem;
}
.footer-tag { color: var(--grey-mid); font-size: 1rem; margin-bottom: 3rem; }
.footer-socials {
  display: flex;
  justify-content: center;
  gap: 2.5rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}
.footer-socials a {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.75;
  transition: opacity 0.2s;
}
.footer-socials a:hover { opacity: 1; }
.footer-cta { margin-bottom: 3rem; }
@media (max-width: 720px) { .footer-cta { display: none; } }
.footer-bottom {
  padding-top: 2rem;
  border-top: 1px solid var(--grey-line);
  font-size: 0.72rem;
  color: var(--grey-mid);
}

/* =========================================================
   STICKY MOBILE CTA
   ========================================================= */
.sticky-cta {
  display: none;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 90;
  padding: 0.8rem 1rem;
  background: var(--ink);
  border-top: 1px solid var(--grey-line);
}
@media (max-width: 720px) {
  .sticky-cta { display: block; }
  .footer { padding-bottom: 6rem; }
}

/* =========================================================
   REVIEW SUBMISSION MODAL — frosted glass
   ========================================================= */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}
.modal-overlay.open { display: flex; }
.modal {
  width: 100%;
  max-width: 460px;
  max-height: 92vh;
  overflow-y: auto;
  padding: clamp(1.8rem, 4vw, 2.6rem);
  position: relative;
}
.modal-close {
  position: absolute; top: 1.1rem; right: 1.2rem;
  font-size: 1.7rem; color: var(--paper); opacity: 0.7;
}
.modal-close:hover { opacity: 1; }
.modal-eyebrow {
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--grey-mid); margin-bottom: 0.5rem; font-weight: 700;
}
.modal-title { font-size: clamp(1.4rem, 4vw, 1.9rem); font-weight: 800; text-transform: uppercase; margin-bottom: 1.6rem; line-height: 1.1; }

.clarity-blocks { display: flex; gap: 6px; margin-bottom: 0.6rem; }
.clarity-block {
  flex: 1; height: 32px;
  background: rgba(255,255,255,0.12);
  filter: blur(3px); opacity: 0.5;
  cursor: pointer;
  transition: filter 0.25s var(--ease-soft), opacity 0.25s var(--ease-soft), background 0.25s var(--ease-soft);
}
.clarity-block.lit { background: var(--paper); filter: blur(0); opacity: 1; }
.clarity-caption { font-size: 0.75rem; color: var(--grey-mid); margin-bottom: 1.6rem; }

.q-form { display: flex; flex-direction: column; gap: 1.4rem; }
.q-field { display: flex; flex-direction: column; gap: 0.5rem; }
.q-field span { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--grey-mid); font-weight: 700; }
.q-field input, .q-field textarea, .q-field select {
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--glass-border);
  color: var(--paper);
  font-family: var(--font);
  font-size: 0.95rem;
  padding: 0.85rem 0.9rem;
  resize: vertical;
}
.q-field select {
  appearance: none;
  -webkit-appearance: none;
  font-weight: 600;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23F5F5F5'%3E%3Cpath d='M5.5 7.5l4.5 4.5 4.5-4.5' stroke='%23F5F5F5' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.9rem center;
  padding-right: 2.4rem;
}
.q-field select option { background: var(--ink); color: var(--paper); }
.q-field input:focus, .q-field textarea:focus, .q-field select:focus { outline: none; border-color: var(--paper); }

/* =========================================================
   BOOKING PAGE (book-time.html) — frosted glass panel
   ========================================================= */
.booking-page {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 1.2rem 3rem;
  text-align: center;
}
.booking-panel {
  width: min(760px, 100%);
  padding: clamp(2rem, 5vw, 3rem);
  margin-top: 2rem;
}
.booking-title { font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 800; text-transform: uppercase; margin-bottom: 0.8rem; }
.booking-sub { color: #cfcfcf; font-size: 0.95rem; margin-bottom: 2rem; }
.cal-embed { width: 100%; min-height: 560px; }

@media (max-width: 560px) {
  .flip-face p { font-size: 1.6rem; }
}

/* =========================================================
   BOOKING MODAL — ported system, restyled for our system
   ========================================================= */
.booking-modal { max-width: 620px; padding: 0; display: flex; flex-direction: column; max-height: 90vh; }
.modal-topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.2rem 1.6rem 0.8rem;
}
.modal-mark { height: 18px; width: auto; }
.modal-progress { height: 2px; background: var(--grey-line); }
.modal-progress-fill { height: 100%; width: 25%; background: var(--paper); transition: width 0.3s var(--ease-soft); }
.modal-scroll { overflow-y: auto; padding: 1.8rem 1.6rem 2rem; }

.b-screen { display: none; }
.b-screen.active { display: block; }

.b-nav { display: flex; gap: 0.8rem; margin-top: 1.6rem; }
.b-nav .btn { flex: 1; text-align: center; }
.b-error { color: #ff8a8a; font-size: 0.82rem; margin-top: 0.8rem; }

.b-group-label {
  font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--grey-mid); font-weight: 700; margin: 1.4rem 0 0.4rem;
}
.b-group-label:first-child { margin-top: 0; }

.b-radio {
  display: flex; align-items: center; gap: 0.6rem;
  font-size: 0.9rem; padding: 0.2rem 0; cursor: pointer;
}
.b-radio input { accent-color: var(--paper); }

.b-chip-group { display: flex; flex-direction: column; gap: 0.6rem; margin-top: 0.3rem; }
.b-chip {
  text-align: left;
  padding: 0.85rem 1rem;
  font-family: var(--font);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--paper);
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--glass-border);
  transition: background 0.15s var(--ease-soft), border-color 0.15s var(--ease-soft);
}
.b-chip:hover { border-color: rgba(255,255,255,0.4); }
.b-chip.active {
  background: var(--paper);
  color: var(--ink);
  border-color: var(--paper);
  font-weight: 700;
}

/* slots */
.b-week-tabs { display: flex; gap: 0.6rem; margin-bottom: 1rem; }
.b-week-tab {
  padding: 0.5rem 1rem; font-size: 0.78rem; font-weight: 700;
  border: 1px solid var(--glass-border); color: var(--grey-mid);
  text-transform: uppercase; letter-spacing: 0.04em;
}
.b-week-tab.active { color: var(--paper); border-color: var(--paper); }

.b-date-strip { display: flex; gap: 0.5rem; margin-bottom: 1.2rem; overflow-x: auto; }
.b-date-chip {
  flex-shrink: 0; padding: 0.6rem 0.9rem; text-align: center;
  border: 1px solid var(--glass-border); min-width: 60px;
  color: var(--paper);
}
.b-date-chip-day { display: block; font-size: 0.65rem; color: var(--grey-mid); text-transform: uppercase; }
.b-date-chip-date { display: block; font-size: 0.85rem; font-weight: 700; margin-top: 2px; color: inherit; }
.b-date-chip.active { background: var(--paper); color: var(--ink); border-color: var(--paper); }
.b-date-chip.active .b-date-chip-day { color: #555; }
.b-date-chip:disabled { opacity: 0.25; }

.b-time-label {
  display: flex; justify-content: space-between;
  font-size: 0.75rem; color: var(--grey-mid); margin-bottom: 0.6rem;
  text-transform: uppercase; letter-spacing: 0.04em;
}
.b-time-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)); gap: 8px; }
.b-time-slot {
  padding: 0.65rem 0.4rem; text-align: center; font-size: 0.85rem; font-weight: 600;
  border: 1px solid var(--glass-border);
  color: var(--paper);
}
.b-time-slot:not(:disabled):hover { border-color: var(--paper); }
.b-time-slot.active { background: var(--paper); color: var(--ink); border-color: var(--paper); }
.b-time-slot:disabled { opacity: 0.25; text-decoration: line-through; }

/* payment */
.b-amount { font-size: clamp(2rem, 6vw, 2.8rem); font-weight: 900; margin-bottom: 0.4rem; }
.b-hold {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.9rem 1.1rem; margin: 1.4rem 0; font-size: 0.85rem;
}
.b-hold-timer { font-weight: 800; font-size: 1.1rem; font-variant-numeric: tabular-nums; }
.b-pay-methods { display: flex; gap: 0.6rem; margin-bottom: 1.2rem; }
.b-pay-method {
  flex: 1; padding: 0.7rem 0.5rem; font-size: 0.8rem; font-weight: 700;
  border: 1px solid var(--glass-border); color: var(--grey-mid);
}
.b-pay-method.active { color: var(--ink); background: var(--paper); border-color: var(--paper); }
.b-summary { padding: 1.1rem; font-size: 0.9rem; line-height: 1.6; }
#payButton.is-loading { opacity: 0.7; }

/* confirmation */
.b-confirm-mark { font-size: clamp(1.8rem, 5vw, 2.6rem); font-weight: 900; text-align: center; margin-bottom: 0.6rem; }
.b-ref { text-align: center; font-size: 0.85rem; color: var(--grey-mid); margin-bottom: 1.2rem; }
