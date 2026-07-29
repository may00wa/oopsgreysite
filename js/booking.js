// =========================================================
// BOOKING MODAL
// Five screens: pick a slot, about you, the business, pay, receipt.
// Works immediately in demo mode — clickable end to end with
// no setup. The moment the matching Netlify Functions have real
// keys (Supabase + Paystack + Resend, all set as environment
// variables in Netlify's dashboard — see README), it quietly
// upgrades to real slot-holding, real payment, and real emails.
// Every spot that changes behavior is marked PLUG POINT.
// =========================================================

const modal = document.getElementById("bookingModal");
const progressFill = document.getElementById("progressFill");
const totalScreens = 5;
let currentScreen = 1;

// ---------- OPEN / CLOSE ----------
function openBooking() {
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
  if (!document.getElementById("slotGroups").children.length) renderSlots();
}
function closeBooking() {
  modal.classList.remove("open");
  document.body.style.overflow = "";
  setTimeout(() => { if (!modal.classList.contains("open")) goToScreen(1, true); }, 400);
}
document.querySelectorAll("[data-open-booking]").forEach(el =>
  el.addEventListener("click", (e) => { e.preventDefault(); openBooking(); })
);
document.querySelectorAll("[data-close-booking]").forEach(el =>
  el.addEventListener("click", closeBooking)
);
modal.addEventListener("click", (e) => {
  if (e.target === modal && !(payButton && payButton.classList.contains("is-loading"))) closeBooking();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("open")) closeBooking();
});
document.getElementById("bookingFormStep1").addEventListener("submit", (e) => e.preventDefault());
document.getElementById("bookingFormStep2").addEventListener("submit", (e) => e.preventDefault());

function goToScreen(n, silent) {
  if (n === currentScreen && !silent) return;
  document.querySelectorAll(".b-screen").forEach(s => s.classList.remove("active"));
  document.querySelector(`.b-screen[data-screen="${n}"]`).classList.add("active");
  currentScreen = n;
  progressFill.style.width = `${(n / totalScreens) * 100}%`;
  document.querySelector(".modal-scroll").scrollTop = 0;
  if (n === 4) startHoldTimer();
}

document.querySelectorAll("[data-next-screen]").forEach(btn => {
  btn.addEventListener("click", () => {
    if (currentScreen === 1 && !selectedSlot) {
      document.getElementById("slotError").style.display = "block";
      return;
    }
    if (currentScreen === 2 && btn.dataset.validateForm === "1") {
      if (!validateForm(document.getElementById("bookingFormStep1"), "formError1")) return;
    }
    if (currentScreen === 3 && btn.dataset.validateForm === "2") {
      if (!validateReason()) return;
      if (!validateForm(document.getElementById("bookingFormStep2"), "formError2")) return;
      buildSummary();
    }
    goToScreen(currentScreen + 1);
  });
});
document.querySelectorAll("[data-prev-screen]").forEach(btn =>
  btn.addEventListener("click", () => goToScreen(currentScreen - 1))
);

// =========================================================
// SCREEN 1 — SLOTS
// PLUG POINT: get-availability.js. Demo mode builds a small
// two-week list right here so the calendar works immediately.
// =========================================================
// Minimum notice required before a slot can be booked. Matches the
// "no one can book less than 24 hours out" rule: if it's 10:00 AM today,
// the earliest bookable slot is whichever time slot lands at/after
// 10:00 AM tomorrow — not a fixed set of always-crossed-out slots.
const LEAD_HOURS = 24;

function buildDemoSlots() {
  const times = [
    { label: "9:00 AM", hour: 9, minute: 0 },
    { label: "10:00 AM", hour: 10, minute: 0 },
    { label: "11:00 AM", hour: 11, minute: 0 },
    { label: "1:00 PM", hour: 13, minute: 0 },
    { label: "2:00 PM", hour: 14, minute: 0 },
    { label: "3:00 PM", hour: 15, minute: 0 },
    { label: "4:00 PM", hour: 16, minute: 0 }
  ];

  const now = new Date();
  const cutoff = new Date(now.getTime() + LEAD_HOURS * 60 * 60 * 1000);

  // A couple of slots pre-marked as booked, purely so the demo calendar
  // doesn't look emptily perfect. This is unrelated to the 24-hour rule
  // below and just simulates other people's real bookings.
  const demoBooked = new Set(["1-2-4"]);

  const weeks = [];
  for (let g = 0; g < 2; g++) {
    const label = g === 0 ? "This week" : "Next week";
    const days = [];
    for (let d = 0; d < 4; d++) {
      // Start from today (offset 0), not tomorrow — whether today's
      // slots are actually bookable is decided per-slot below by the
      // 24-hour cutoff, not by skipping the day entirely.
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (g * 7) + d);
      const dayShort = date.toLocaleDateString("en-GB", { weekday: "short" });
      const dateShort = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      const fullLabel = date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
      const slots = times.map((t, i) => {
        const slotDateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), t.hour, t.minute);
        const tooSoon = slotDateTime < cutoff;
        const alreadyBooked = demoBooked.has(`${g}-${d}-${i}`);
        return { id: `${g}-${d}-${i}`, time: t.label, taken: tooSoon || alreadyBooked, fullLabel };
      });
      days.push({ id: `${g}-${d}`, dayShort, dateShort, fullLabel, slots });
    }
    weeks.push({ label, days });
  }
  return weeks;
}

const weekData = buildDemoSlots();
let selectedWeekIndex = 0;
let selectedDayId = null;
let selectedSlot = null;
let holdExpiresAt = null;
let holdTimerInterval = null;

function currentWeek() { return weekData[selectedWeekIndex]; }
function currentDay() {
  return currentWeek().days.find(d => d.id === selectedDayId) || currentWeek().days[0];
}

function renderSlots() {
  if (!selectedDayId) selectedDayId = weekData[0].days[0].id;
  const container = document.getElementById("slotGroups");
  container.innerHTML = "";

  const tabs = document.createElement("div");
  tabs.className = "b-week-tabs";
  weekData.forEach((week, i) => {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "b-week-tab" + (i === selectedWeekIndex ? " active" : "");
    tab.textContent = week.label;
    tab.addEventListener("click", () => {
      selectedWeekIndex = i;
      selectedDayId = weekData[i].days[0].id;
      renderSlots();
    });
    tabs.appendChild(tab);
  });
  container.appendChild(tabs);

  const strip = document.createElement("div");
  strip.className = "b-date-strip";
  currentWeek().days.forEach(day => {
    const allTaken = day.slots.every(s => s.taken);
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "b-date-chip" + (day.id === selectedDayId ? " active" : "");
    chip.disabled = allTaken;
    chip.innerHTML = `<span class="b-date-chip-day">${day.dayShort}</span><span class="b-date-chip-date">${day.dateShort}</span>`;
    if (!allTaken) chip.addEventListener("click", () => { selectedDayId = day.id; renderSlots(); });
    strip.appendChild(chip);
  });
  container.appendChild(strip);

  const day = currentDay();
  const remaining = day.slots.filter(s => !s.taken).length;

  const panelLabel = document.createElement("div");
  panelLabel.className = "b-time-label";
  panelLabel.innerHTML = `<span>${day.fullLabel}</span><span>${remaining} left</span>`;
  container.appendChild(panelLabel);

  const grid = document.createElement("div");
  grid.className = "b-time-grid";
  day.slots.forEach(slot => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "b-time-slot";
    btn.textContent = slot.time;
    btn.disabled = slot.taken;
    if (selectedSlot && selectedSlot.id === slot.id) btn.classList.add("active");
    if (!slot.taken) btn.addEventListener("click", () => selectSlot(slot, btn));
    grid.appendChild(btn);
  });
  container.appendChild(grid);
}

async function selectSlot(slot, btn) {
  document.querySelectorAll(".b-time-slot").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  selectedSlot = { ...slot, date: slot.fullLabel };
  document.getElementById("slotError").style.display = "none";

  // PLUG POINT: create-hold.js — real mode writes a 10-min hold to
  // Supabase so no one else can grab this slot while you're paying.
  try {
    const res = await fetch("/.netlify/functions/create-hold", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId: slot.id })
    });
    if (res.ok) {
      const json = await res.json();
      holdExpiresAt = new Date(json.expiresAt).getTime();
      return;
    }
  } catch (err) { /* function not deployed yet — fall through to demo hold */ }

  holdExpiresAt = Date.now() + 10 * 60 * 1000;
}

// =========================================================
// SCREEN 2 & 3 — ABOUT YOU / THE BUSINESS
// =========================================================
function validateForm(form, errorBoxId) {
  const errorBox = document.getElementById(errorBoxId);
  if (!form.checkValidity()) {
    form.reportValidity();
    errorBox.style.display = "block";
    return false;
  }
  errorBox.style.display = "none";
  return true;
}

// "Why are you booking" — custom chips instead of native radios,
// since native radio selected-state contrast was hard to see.
let selectedReason = "";
document.querySelectorAll(".b-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".b-chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    selectedReason = chip.dataset.chipValue;
    document.getElementById("reasonInput").value = selectedReason;
  });
});
function validateReason() {
  const errorBox = document.getElementById("formError2");
  if (!selectedReason) {
    errorBox.textContent = "Pick one, then continue.";
    errorBox.style.display = "block";
    return false;
  }
  return true;
}

function getFormData() {
  const obj = {};
  [document.getElementById("bookingFormStep1"), document.getElementById("bookingFormStep2")].forEach(form => {
    new FormData(form).forEach((v, k) => { obj[k] = v; });
  });
  return obj;
}
function buildSummary() {
  const data = getFormData();
  const box = document.getElementById("bookingSummary");
  box.innerHTML = `
    <strong>${escapeHtml(data.business || "")}</strong> &middot; ${escapeHtml(data.name || "")}<br>
    ${escapeHtml(selectedSlot ? selectedSlot.date + " \u00B7 " + selectedSlot.time : "")} WAT
  `;
}
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// =========================================================
// SCREEN 4 — HOLD TIMER + PAYMENT METHOD
// =========================================================
function startHoldTimer() {
  clearInterval(holdTimerInterval);
  if (!holdExpiresAt) holdExpiresAt = Date.now() + 10 * 60 * 1000;
  const timerEl = document.getElementById("holdTimer");

  function tick() {
    const remaining = Math.max(0, holdExpiresAt - Date.now());
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    timerEl.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    if (remaining <= 0) {
      clearInterval(holdTimerInterval);
      handleHoldExpired();
    }
  }
  tick();
  holdTimerInterval = setInterval(tick, 1000);
}
function handleHoldExpired() {
  selectedSlot = null;
  document.querySelectorAll(".b-time-slot.active").forEach(s => s.classList.remove("active"));
  goToScreen(1);
  const err = document.getElementById("slotError");
  err.textContent = "Your hold expired. Pick a slot to continue.";
  err.style.display = "block";
}

let selectedPayMethod = "card";
document.querySelectorAll("[data-pay-method]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-pay-method]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedPayMethod = btn.dataset.payMethod;
  });
});

// =========================================================
// PAYMENT
// PLUG POINT: initialize-payment.js + flutterwave-webhook.js.
// Flutterwave Test Mode handles the payment. The browser never marks a payment
// as successful by itself; the return is verified server-side.
// =========================================================
const payButton = document.getElementById("payButton");
payButton.addEventListener("click", async () => {
  payButton.classList.add("is-loading");
  payButton.disabled = true;
  payButton.textContent = "Opening payment…";

  try {
    const data = getFormData();
    const payload = { slot: selectedSlot, method: selectedPayMethod, ...data };

    const res = await fetch("/.netlify/functions/initialize-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();

    if (!res.ok || !json.authorizationUrl) {
      throw new Error(json.error || "Could not open Flutterwave checkout.");
    }

    sessionStorage.setItem("oopsPendingPayment", JSON.stringify({
      data,
      selectedSlot,
      reference: json.reference
    }));

    window.location.href = json.authorizationUrl;
  } catch (err) {
    console.error(err);
    alert(err.message || "Could not start payment. Please try again.");
    payButton.classList.remove("is-loading");
    payButton.disabled = false;
    payButton.textContent = "Pay and lock slot";
  }
});

function showConfirmation(reference, data) {
  clearInterval(holdTimerInterval);
  document.getElementById("confirmDatetime").textContent =
    selectedSlot ? `${selectedSlot.date} \u00B7 ${selectedSlot.time} WAT` : "";
  document.getElementById("confirmRef").textContent = reference;
  document.getElementById("confirmEmail").textContent = data.email || "";
  goToScreen(5);
}


// Flutterwave returns to the homepage with payment status + transaction details.
(async function handleFlutterwaveReturn() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("payment") !== "return") return;

  const transactionId = params.get("transaction_id");
  const txRef = params.get("tx_ref");
  const status = params.get("status");
  const pendingRaw = sessionStorage.getItem("oopsPendingPayment");

  if (status !== "successful" || !transactionId || !txRef || !pendingRaw) return;

  try {
    const res = await fetch(`/.netlify/functions/verify-payment?transaction_id=${encodeURIComponent(transactionId)}&tx_ref=${encodeURIComponent(txRef)}`);
    const result = await res.json();
    if (!res.ok || !result.verified) return;

    const pending = JSON.parse(pendingRaw);
    selectedSlot = pending.selectedSlot;
    openBooking();
    showConfirmation(result.reference || txRef, pending.data);
    sessionStorage.removeItem("oopsPendingPayment");
    window.history.replaceState({}, document.title, window.location.pathname);
  } catch (err) {
    console.error("Could not verify returned Flutterwave payment:", err);
  }
})();
