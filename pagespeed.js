// Builds the full multi-page audit PDF entirely in the browser using jsPDF.
// No server-side PDF rendering needed - keeps this tool free to run.

function generateAuditPDF(report) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const NAVY = [15, 23, 42];
  const BLUE = [37, 99, 235];
  const PURPLE = [124, 58, 237];
  const CYAN = [34, 211, 238];
  const GRAY = [100, 116, 139];

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  let y = margin;

  function addPage() {
    doc.addPage();
    y = margin;
  }

  function heading(text, size = 18) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor(...NAVY);
    doc.text(text, margin, y);
    y += size * 1.1;
  }

  function subheading(text) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...BLUE);
    doc.text(text, margin, y);
    y += 18;
  }

  function bodyText(text, size = 10) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * (size * 1.3) + 8;
  }

  function bulletList(items) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    items.forEach((item) => {
      const lines = doc.splitTextToSize("• " + item, pageWidth - margin * 2 - 10);
      doc.text(lines, margin + 10, y);
      y += lines.length * 13 + 4;
    });
    y += 8;
  }

  function checkSpace(needed) {
    if (y + needed > pageHeight - margin) {
      addPage();
    }
  }

  // ---------- COVER PAGE ----------
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text("AI Business Audit", pageWidth / 2, 220, { align: "center" });

  doc.setFontSize(16);
  doc.setTextColor(...CYAN);
  doc.text(report.business.businessName, pageWidth / 2, 255, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(200, 210, 225);
  doc.text(report.business.websiteUrl, pageWidth / 2, 280, { align: "center" });
  doc.text(
    `Audit Date: ${new Date(report.generatedAt).toLocaleDateString()}`,
    pageWidth / 2,
    300,
    { align: "center" }
  );

  doc.setFontSize(10);
  doc.setTextColor(...GRAY);
  doc.text("Prepared by Kayvora AI", pageWidth / 2, pageHeight - 60, { align: "center" });

  // ---------- OVERALL SCORES ----------
  addPage();
  heading("Overall Scores");
  y += 10;

  const scoreEntries = [
    ["Website", report.scores.website],
    ["SEO", report.scores.seo],
    ["Automation", report.scores.automation],
    ["Lead Generation", report.scores.leadGen],
    ["AI Readiness", report.scores.aiReadiness],
  ];

  scoreEntries.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(label, margin, y);

    const barX = margin + 150;
    const barWidth = 250;
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(barX, y - 9, barWidth, 10, 3, 3, "F");
    doc.setFillColor(...BLUE);
    doc.roundedRect(barX, y - 9, barWidth * (value / 100), 10, 3, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.text(`${value}/100`, barX + barWidth + 15, y);
    y += 26;
  });

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...PURPLE);
  doc.text(`Overall Score: ${report.scores.overall}/100`, margin, y);
  y += 30;

  subheading("Summary");
  bodyText(report.narrativeSummary);

  // ---------- WEBSITE REVIEW ----------
  checkSpace(150);
  heading("Website Review", 16);
  if (report.websiteIssues.length === 0) {
    bodyText("No major issues found - your website checks out well across the board.");
  } else {
    bulletList(report.websiteIssues);
  }

  // ---------- SEO REVIEW ----------
  checkSpace(150);
  heading("SEO Review", 16);
  if (report.seoIssues.length === 0) {
    bodyText("No major SEO issues found.");
  } else {
    bulletList(report.seoIssues);
  }

  // ---------- AI OPPORTUNITY REPORT ----------
  checkSpace(150);
  heading("AI Opportunity Report", 16);
  report.opportunities.forEach((op) => {
    checkSpace(40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(op.currentGap, margin, y);
    doc.setTextColor(...GRAY);
    doc.text("→", margin + 180, y);
    doc.setTextColor(...CYAN);
    doc.setFont("helvetica", "bold");
    doc.text(op.aiSolution, margin + 200, y);
    y += 22;
  });

  // ---------- REVENUE OPPORTUNITY ----------
  checkSpace(140);
  y += 10;
  heading("Revenue Opportunity", 16);
  const rev = report.revenueEstimate;
  bodyText(
    `If your business misses roughly ${rev.assumedMissedCallsPerWeek} calls per week, at an average job value of $${rev.assumedAvgJobValue}, that could represent approximately $${rev.potentialMonthlyRevenueLost.toLocaleString()}/month in potential lost revenue.`
  );
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  const disclaimer = doc.splitTextToSize(
    "These are illustrative estimates based on your inputs and industry assumptions, not guaranteed results.",
    pageWidth - margin * 2
  );
  doc.text(disclaimer, margin, y);
  y += disclaimer.length * 12 + 20;

  // ---------- PRIORITY RECOMMENDATIONS ----------
  checkSpace(200);
  heading("Priority Recommendations", 16);
  subheading("High Priority");
  bulletList(report.priorityRecommendations.high);
  checkSpace(80);
  subheading("Medium Priority");
  bulletList(report.priorityRecommendations.medium);
  checkSpace(80);
  subheading("Low Priority");
  bulletList(report.priorityRecommendations.low);

  // ---------- ROADMAP ----------
  checkSpace(160);
  heading("Implementation Roadmap", 16);
  report.roadmap.forEach((item) => {
    checkSpace(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...BLUE);
    doc.text(`Week ${item.week}`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(item.focus, margin + 80, y);
    y += 20;
  });

  // ---------- ESTIMATED INVESTMENT ----------
  checkSpace(140);
  y += 10;
  heading("Estimated Investment", 16);
  const investments = [
    ["AI Voice Agent", "Starting at $2,499"],
    ["Business Website", "Starting at $999"],
    ["Automation Package", "Starting at $999"],
  ];
  investments.forEach(([label, price]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(label, margin, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PURPLE);
    doc.text(price, margin + 300, y);
    y += 22;
  });

  // ---------- FINAL PAGE ----------
  addPage();
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("Ready to automate your business?", pageWidth / 2, 260, { align: "center" });

  doc.setFontSize(13);
  doc.setTextColor(...CYAN);
  doc.text("Book a FREE Strategy Call", pageWidth / 2, 300, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(200, 210, 225);
  doc.text("Kayvora AI", pageWidth / 2, 340, { align: "center" });
  doc.text("kayvora.ai@gmail.com", pageWidth / 2, 358, { align: "center" });
  doc.text("kayvora.ai", pageWidth / 2, 376, { align: "center" });

  doc.save(`${report.business.businessName.replace(/\s+/g, "-")}-AI-Audit.pdf`);
}
