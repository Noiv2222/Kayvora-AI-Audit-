const form = document.getElementById("audit-form");
const formSection = document.getElementById("form-section");
const loadingSection = document.getElementById("loading");
const errorSection = document.getElementById("error");
const resultsSection = document.getElementById("results");
const loadingText = document.getElementById("loading-text");

let latestReport = null;

const loadingMessages = [
  "Scanning your website...",
  "Checking SEO fundamentals...",
  "Running speed test...",
  "Calculating AI opportunities...",
  "Building your roadmap...",
];

function cycleLoadingMessages() {
  let i = 0;
  return setInterval(() => {
    i = (i + 1) % loadingMessages.length;
    loadingText.textContent = loadingMessages[i];
  }, 2500);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  formSection.classList.add("hidden");
  errorSection.classList.add("hidden");
  loadingSection.classList.remove("hidden");
  const interval = cycleLoadingMessages();

  try {
    const res = await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    clearInterval(interval);
    loadingSection.classList.add("hidden");

    if (!res.ok) {
      document.getElementById("error-text").textContent = data.error || "Something went wrong.";
      errorSection.classList.remove("hidden");
      return;
    }

    latestReport = data;
    renderResults(data);
    resultsSection.classList.remove("hidden");
  } catch (err) {
    clearInterval(interval);
    loadingSection.classList.add("hidden");
    document.getElementById("error-text").textContent = "Network error. Please try again.";
    errorSection.classList.remove("hidden");
  }
});

document.getElementById("try-again-btn").addEventListener("click", () => {
  errorSection.classList.add("hidden");
  formSection.classList.remove("hidden");
});

function renderResults(report) {
  const grid = document.getElementById("scores-grid");
  const scores = report.scores;
  grid.innerHTML = `
    ${scoreBox("Website", scores.website)}
    ${scoreBox("SEO", scores.seo)}
    ${scoreBox("Automation", scores.automation)}
    ${scoreBox("Lead Generation", scores.leadGen)}
    ${scoreBox("AI Readiness", scores.aiReadiness)}
    ${scoreBox("Overall", scores.overall)}
  `;
  document.getElementById("summary-text").textContent = report.narrativeSummary;
}

function scoreBox(label, value) {
  return `<div class="score-box"><div class="value">${value}/100</div><div class="label">${label}</div></div>`;
}

document.getElementById("download-pdf-btn").addEventListener("click", () => {
  if (latestReport) {
    generateAuditPDF(latestReport);
  }
});
