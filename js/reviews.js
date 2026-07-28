// =========================================================
// REVIEWS
// Works immediately in demo mode (submissions show on the page
// for this visit only, so you can see exactly what happens).
// The moment js/config.js has real Airtable details, it quietly
// upgrades to real, permanent, shared storage — same code path,
// no other change needed.
// =========================================================

import { AIRTABLE_CONFIG } from "./config.js";

const reviewsGrid = document.getElementById("reviewsGrid");
const openReviewFormBtn = document.getElementById("openReviewForm");
const reviewModalOverlay = document.getElementById("reviewModalOverlay");
const reviewModalClose = document.getElementById("reviewModalClose");
const clarityBlocks = document.querySelectorAll(".clarity-block");
const clarityCaption = document.getElementById("clarityCaption");
const reviewForm = document.getElementById("reviewForm");

const isAirtableConfigured =
  AIRTABLE_CONFIG.baseId !== "REPLACE_ME" && AIRTABLE_CONFIG.apiKey !== "REPLACE_ME";

// Hardcoded seed review — always shows, not stored in Airtable.
const SEED_REVIEW = {
  reviewerName: "Founder, Luvia",
  reviewerBusiness: "",
  reviewText: "I really can't thank you enough. I don't know if I would have been able to bring this brand to life without you.",
  clarity: 5
};

// Demo-mode reviews live only in this tab's memory — gone on refresh.
// This is intentional: it lets you test the full submit-and-see flow
// before Airtable is connected, without pretending it's permanent.
let demoReviews = [];

let selectedClarity = 0;
const captions = ["", "Still blurry", "A little clearer", "Getting there", "Mostly clear", "Completely clear"];

// ---------- OPEN / CLOSE MODAL ----------
openReviewFormBtn.addEventListener("click", () => {
  reviewModalOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
});
reviewModalClose.addEventListener("click", closeModal);
reviewModalOverlay.addEventListener("click", (e) => { if (e.target === reviewModalOverlay) closeModal(); });
function closeModal() {
  reviewModalOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

// ---------- CLARITY RATING ----------
clarityBlocks.forEach(block => {
  block.addEventListener("click", () => {
    selectedClarity = Number(block.dataset.value);
    updateClarityUI();
  });
  block.addEventListener("mouseenter", () => previewClarity(Number(block.dataset.value)));
});
document.getElementById("clarityBlocks").addEventListener("mouseleave", updateClarityUI);

function previewClarity(value) {
  clarityBlocks.forEach(b => b.classList.toggle("lit", Number(b.dataset.value) <= value));
  clarityCaption.textContent = captions[value];
}
function updateClarityUI() {
  clarityBlocks.forEach(b => b.classList.toggle("lit", Number(b.dataset.value) <= selectedClarity));
  clarityCaption.textContent = selectedClarity ? captions[selectedClarity] : "Tap a block to rate";
}

// ---------- SUBMIT REVIEW ----------
reviewForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (selectedClarity === 0) {
    alert("Please give a clarity rating before submitting.");
    return;
  }

  const formData = new FormData(reviewForm);
  const submitBtn = reviewForm.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting…";

  const newReview = {
    reviewerName: formData.get("reviewerName"),
    reviewerBusiness: formData.get("reviewerBusiness") || "",
    reviewText: formData.get("reviewText"),
    clarity: selectedClarity
  };

  try {
    if (isAirtableConfigured) {
      const url = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${encodeURIComponent(AIRTABLE_CONFIG.tableName)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${AIRTABLE_CONFIG.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ fields: newReview })
      });
      if (!res.ok) throw new Error(`Airtable responded with ${res.status}`);
    } else {
      // DEMO MODE: no Airtable configured yet — keep it in memory for this
      // visit so the submit-and-see-it-appear flow is fully testable now.
      demoReviews.unshift(newReview);
      await new Promise(r => setTimeout(r, 500)); // brief pause so "Submitting…" is visible
    }

    reviewForm.reset();
    selectedClarity = 0;
    updateClarityUI();
    closeModal();
    loadReviews();
  } catch (err) {
    console.error(err);
    alert("Something went wrong submitting your review. Please try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit review";
  }
});

// ---------- LOAD + RENDER REVIEWS ----------
async function loadReviews() {
  const cards = [SEED_REVIEW, ...demoReviews];

  if (isAirtableConfigured) {
    try {
      const url = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${encodeURIComponent(AIRTABLE_CONFIG.tableName)}?sort%5B0%5D%5Bfield%5D=Created&sort%5B0%5D%5Bdirection%5D=desc`;
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${AIRTABLE_CONFIG.apiKey}` }
      });
      if (res.ok) {
        const data = await res.json();
        data.records.forEach(r => cards.push({
          reviewerName: r.fields.reviewerName,
          reviewerBusiness: r.fields.reviewerBusiness,
          reviewText: r.fields.reviewText,
          clarity: r.fields.clarity
        }));
      }
    } catch (err) {
      console.error("Could not load live reviews:", err);
    }
  }

  reviewsGrid.innerHTML = cards.map(renderCard).join("");
}

function renderCard(review) {
  const blocks = [1, 2, 3, 4, 5].map(n =>
    `<span class="review-block ${n <= review.clarity ? "filled" : ""}"></span>`
  ).join("");
  const byline = review.reviewerBusiness ? `${review.reviewerName} — ${review.reviewerBusiness}` : review.reviewerName;

  return `
    <div class="review-card glass">
      <div class="review-blocks">${blocks}</div>
      <p class="review-text">"${escapeHTML(review.reviewText)}"</p>
      <p class="review-meta">${escapeHTML(byline)}</p>
    </div>
  `;
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

if (!isAirtableConfigured) {
  console.info("Reviews are running in demo mode — submissions show for this visit only. Add your Airtable details in js/config.js to make them permanent (README, Box 6).");
}

loadReviews();
