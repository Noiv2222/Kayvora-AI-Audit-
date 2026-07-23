// Fetches the prospect's website and runs real, verifiable checks on it.
// No guessing here - every field below is pulled straight from the actual HTML.

export async function checkWebsite(rawUrl) {
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  const result = {
    url,
    isReachable: false,
    hasSSL: url.startsWith("https://"),
    title: null,
    titleLength: 0,
    metaDescription: null,
    metaDescriptionLength: 0,
    h1Count: 0,
    h2Count: 0,
    hasViewportTag: false,
    hasContactForm: false,
    hasCTAButtons: false,
    imagesTotal: 0,
    imagesWithAlt: 0,
    hasPhoneLink: false,
    hasChatWidget: false,
    error: null,
  };

  let html = "";
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; KayvoraAuditBot/1.0; +https://kayvora.ai)",
      },
    });
    result.isReachable = response.ok;
    result.finalUrl = response.url;
    result.hasSSL = response.url.startsWith("https://");
    html = await response.text();
  } catch (err) {
    result.error = "Could not reach this website. Double check the URL.";
    return result;
  }

  // Title tag
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    result.title = titleMatch[1].trim();
    result.titleLength = result.title.length;
  }

  // Meta description
  const metaDescMatch = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i
  );
  if (metaDescMatch) {
    result.metaDescription = metaDescMatch[1].trim();
    result.metaDescriptionLength = result.metaDescription.length;
  }

  // Headings
  result.h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  result.h2Count = (html.match(/<h2[\s>]/gi) || []).length;

  // Mobile viewport tag
  result.hasViewportTag = /<meta[^>]+name=["']viewport["']/i.test(html);

  // Contact form
  result.hasContactForm = /<form[\s>]/i.test(html);

  // CTA-style buttons (rough heuristic on common CTA wording)
  result.hasCTAButtons =
    /(book\s*(a|your)?\s*(call|demo|consult)|get\s*a?\s*quote|contact\s*us|schedule|free\s*(quote|estimate|consult))/i.test(
      html
    );

  // Images + alt text coverage
  const imgTags = html.match(/<img\b[^>]*>/gi) || [];
  result.imagesTotal = imgTags.length;
  result.imagesWithAlt = imgTags.filter((tag) =>
    /alt=["'][^"']+["']/i.test(tag)
  ).length;

  // Click-to-call phone link
  result.hasPhoneLink = /href=["']tel:/i.test(html);

  // Chat widget presence (common providers)
  result.hasChatWidget =
    /(intercom|drift|tawk\.to|crisp\.chat|livechat|tidio|zendesk|hubspot.*chat)/i.test(
      html
    );

  return result;
}
