import { checkWebsite } from "./lib/websiteChecker.js";
import { getPageSpeedScore } from "./lib/pagespeed.js";
import { scoreWebsite, scoreSEO } from "./lib/scoring.js";
import { generateAIInsights } from "./lib/gemini.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/audit" && request.method === "POST") {
      return handleAudit(request, env);
    }

    // Everything else: serve the static frontend
    return env.ASSETS.fetch(request);
  },
};

async function handleAudit(request, env) {
  try {
    const body = await request.json();
    const {
      businessName,
      websiteUrl,
      industry,
      email,
      phone,
      employees,
      challenge,
    } = body;

    if (!businessName || !websiteUrl || !industry || !email) {
      return jsonResponse({ error: "Missing required fields" }, 400);
    }

    // 1. Real website checks
    const websiteCheck = await checkWebsite(websiteUrl);

    if (!websiteCheck.isReachable) {
      return jsonResponse(
        { error: websiteCheck.error || "Could not reach that website. Please check the URL." },
        400
      );
    }

    // 2. Real speed score (if API key configured)
    const pageSpeed = await getPageSpeedScore(websiteCheck.finalUrl || websiteCheck.url, env.PAGESPEED_API_KEY);

    // 3. Deterministic scores from real data
    const websiteScoreResult = scoreWebsite(websiteCheck, pageSpeed);
    const seoScoreResult = scoreSEO(websiteCheck);

    // 4. AI-generated scores + recommendations
    const aiInsights = await generateAIInsights(
      {
        businessName,
        websiteUrl: websiteCheck.finalUrl || websiteCheck.url,
        industry,
        employees,
        challenge,
        websiteCheck,
        websiteScore: websiteScoreResult.score,
        seoScore: seoScoreResult.score,
      },
      env.GEMINI_API_KEY
    );

    const report = {
      generatedAt: new Date().toISOString(),
      business: { businessName, websiteUrl, industry, email, phone, employees, challenge },
      scores: {
        website: websiteScoreResult.score,
        seo: seoScoreResult.score,
        automation: aiInsights.automationScore,
        leadGen: aiInsights.leadGenScore,
        aiReadiness: aiInsights.aiReadinessScore,
        overall: aiInsights.overallScore,
      },
      websiteIssues: websiteScoreResult.issues,
      seoIssues: seoScoreResult.issues,
      pageSpeed,
      opportunities: aiInsights.opportunities,
      revenueEstimate: aiInsights.revenueEstimate,
      priorityRecommendations: aiInsights.priorityRecommendations,
      roadmap: aiInsights.roadmap,
      narrativeSummary: aiInsights.narrativeSummary,
    };

    // 5. Log the lead (fire-and-forget, never blocks the response to the user)
    if (env.SHEET_WEBHOOK_URL) {
      logLeadToSheet(report, env.SHEET_WEBHOOK_URL).catch(() => {});
    }

    return jsonResponse(report, 200);
  } catch (err) {
    return jsonResponse({ error: "Something went wrong generating the audit. Please try again." }, 500);
  }
}

async function logLeadToSheet(report, webhookUrl) {
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      timestamp: report.generatedAt,
      businessName: report.business.businessName,
      websiteUrl: report.business.websiteUrl,
      industry: report.business.industry,
      email: report.business.email,
      phone: report.business.phone,
      employees: report.business.employees,
      challenge: report.business.challenge,
      overallScore: report.scores.overall,
    }),
  });
}

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
