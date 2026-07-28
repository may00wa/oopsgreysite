// =========================================================
// HERO FLIP — infinite loop.
// Front holds briefly, snap-flips to the back, the back lingers
// much longer (that's the real message), then flips back and
// repeats. Runs continuously — nothing to configure.
// =========================================================

const card = document.getElementById("flipCard");

const FRONT_HOLD_MS = 2800;  // brief — this is the generic line
const BACK_HOLD_MS = 8000;   // long — this is the real message, let it sit

function loop() {
  card.classList.add("flipped");
  setTimeout(() => {
    card.classList.remove("flipped");
    setTimeout(loop, FRONT_HOLD_MS);
  }, BACK_HOLD_MS);
}

setTimeout(loop, FRONT_HOLD_MS);
