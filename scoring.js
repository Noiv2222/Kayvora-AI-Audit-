// Turns raw website checks + PageSpeed result into 0-100 scores.
// Every point deducted maps to something real and explainable - never arbitrary.

export function scoreWebsite(check, pageSpeed) {
  let score = 100;
  const issues = [];

  if (!check.isReachable) {
    return { score: 0, issues: ["Website could not be reached"] };
  }
  if (!check.hasSSL) {
    score -= 20;
    issues.push("No SSL certificate (site is not using https)");
  }
  if (!check.hasViewportTag) {
    score -= 15;
    issues.push("Missing mobile viewport tag - site likely isn't mobile-optimized");
  }
  if (!check.hasContactForm) {
    score -= 10;
    issues.push("No contact form detected");
  }
  if (!check.hasCTAButtons) {
    score -= 10;
    issues.push("No clear call-to-action buttons detected");
  }
  if (!check.hasPhoneLink) {
    score -= 5;
    issues.push("No click-to-call phone link detected");
  }
  if (!check.hasChatWidget) {
    score -= 5;
    issues.push("No live chat widget detected");
  }

  if (pageSpeed.available) {
    if (pageSpeed.score < 50) {
      score -= 20;
      issues.push(`Slow page speed (PageSpeed score: ${pageSpeed.score}/100)`);
    } else if (pageSpeed.score < 80) {
      score -= 10;
      issues.push(`Page speed could be improved (PageSpeed score: ${pageSpeed.score}/100)`);
    }
  }

  return { score: Math.max(0, Math.round(score)), issues };
}

export function scoreSEO(check) {
  let score = 100;
  const issues = [];

  if (!check.title || check.titleLength === 0) {
    score -= 20;
    issues.push("Missing title tag");
  } else if (check.titleLength > 60) {
    score -= 5;
    issues.push("Title tag is too long for search results (over 60 characters)");
  }

  if (!check.metaDescription) {
    score -= 20;
    issues.push("Missing meta description");
  } else if (check.metaDescriptionLength > 160) {
    score -= 5;
    issues.push("Meta description is too long (over 160 characters)");
  }

  if (check.h1Count === 0) {
    score -= 15;
    issues.push("No H1 heading found on the page");
  } else if (check.h1Count > 1) {
    score -= 5;
    issues.push("Multiple H1 headings found (should typically be just one)");
  }

  if (check.h2Count === 0) {
    score -= 10;
    issues.push("No H2 subheadings found - content structure may be weak");
  }

  if (check.imagesTotal > 0) {
    const altCoverage = check.imagesWithAlt / check.imagesTotal;
    if (altCoverage < 0.5) {
      score -= 15;
      issues.push(
        `Only ${check.imagesWithAlt}/${check.imagesTotal} images have alt text (hurts SEO and accessibility)`
      );
    } else if (altCoverage < 1) {
      score -= 5;
      issues.push(
        `${check.imagesWithAlt}/${check.imagesTotal} images have alt text - close, but not complete`
      );
    }
  }

  return { score: Math.max(0, Math.round(score)), issues };
}
