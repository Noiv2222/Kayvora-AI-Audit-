<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Free AI Business Audit | Kayvora AI</title>
<meta name="description" content="Get a free AI-powered business audit: website score, SEO score, automation opportunities, and a custom AI roadmap." />
<link rel="stylesheet" href="/styles.css" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
</head>
<body>

<header class="site-header">
  <div class="logo">Kayvora <span>AI</span></div>
</header>

<main>
  <section id="intro" class="hero">
    <h1>Free AI Business Audit</h1>
    <p>Enter your business info and get a professional AI-generated audit in minutes — your Website Score, SEO Score, Automation Opportunities, Lead Generation Score, AI Readiness, and a custom roadmap.</p>
  </section>

  <section id="form-section" class="card">
    <form id="audit-form">
      <label>Business Name
        <input type="text" name="businessName" required />
      </label>
      <label>Website URL
        <input type="text" name="websiteUrl" placeholder="yourbusiness.com" required />
      </label>
      <label>Industry
        <select name="industry" required>
          <option value="">Select an industry</option>
          <option>Home Services / Contracting</option>
          <option>Healthcare / Medical / Dental</option>
          <option>Legal Services</option>
          <option>Real Estate</option>
          <option>Restaurants / Hospitality</option>
          <option>Automotive</option>
          <option>Retail / E-commerce</option>
          <option>Professional Services / Consulting</option>
          <option>Fitness / Wellness</option>
          <option>Other</option>
        </select>
      </label>
      <label>Business Email
        <input type="email" name="email" required />
      </label>
      <label>Phone (Optional)
        <input type="tel" name="phone" />
      </label>
      <label>Number of Employees
        <select name="employees" required>
          <option value="">Select a range</option>
          <option>1-5</option>
          <option>6-20</option>
          <option>21-50</option>
          <option>51-200</option>
          <option>200+</option>
        </select>
      </label>
      <label>Biggest Challenge Right Now
        <textarea name="challenge" rows="3" placeholder="e.g. We miss too many calls after hours" required></textarea>
      </label>

      <button type="submit" id="submit-btn">Generate My Free AI Audit</button>
    </form>
  </section>

  <section id="loading" class="card hidden">
    <div class="spinner"></div>
    <p id="loading-text">Scanning your website...</p>
  </section>

  <section id="error" class="card hidden">
    <p id="error-text"></p>
    <button id="try-again-btn">Try Again</button>
  </section>

  <section id="results" class="card hidden">
    <h2>Your AI Business Audit is Ready</h2>
    <div id="scores-grid" class="scores-grid"></div>
    <div id="summary-text" class="summary-text"></div>
    <button id="download-pdf-btn">Download Full PDF Report</button>
    <a href="https://calendly.com/kayvora-ai/30min" target="_blank" class="cta-link">Book a Free Strategy Call</a>
  </section>
</main>

<footer class="site-footer">
  <p>Kayvora AI &middot; kayvora.ai@gmail.com</p>
</footer>

<script src="/pdfGenerator.js"></script>
<script src="/app.js"></script>
</body>
</html>
