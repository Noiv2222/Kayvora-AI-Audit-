# Kayvora AI - Free AI Business Audit Generator

A standalone lead-generation tool. A prospect enters their business info and website,
and within a couple minutes gets a professional PDF audit: Website Score, SEO Score,
Automation Score, Lead Generation Score, AI Readiness Score, an opportunity map, a
revenue estimate, priority recommendations, and a 4-week roadmap.

**This entire project runs for $0/month.**

---

## What's in this project

```
kayvora-audit/
├── wrangler.toml              <- Cloudflare Worker config
├── package.json
├── src/
│   ├── worker.js               <- the API (handles /api/audit)
│   └── lib/
│       ├── websiteChecker.js   <- real checks on the prospect's site (SSL, meta tags, etc.)
│       ├── pagespeed.js        <- real speed score via Google PageSpeed API
│       ├── scoring.js          <- turns checks into 0-100 scores
│       └── gemini.js           <- AI-generated opportunities, roadmap, revenue estimate
├── public/
│   ├── index.html               <- the form + results page
│   ├── styles.css
│   ├── app.js                   <- form logic, calls the API
│   └── pdfGenerator.js          <- builds the PDF in the browser (jsPDF)
└── google-apps-script/
    └── Code.gs                  <- free lead-logging webhook (paste into Google Sheets)
```

---

## Step 1: Create the new GitHub repo

1. Go to GitHub and create a new repo, e.g. `kayvora-ai-audit`
2. Drag-and-drop all the files/folders above into it (same way you've uploaded files before)
   - Keep the folder structure exactly as shown - `src/lib/...` and `public/...` need to stay nested

## Step 2: Get your free PageSpeed API key

1. Go to https://console.cloud.google.com/
2. Create a new project (or use an existing one) - no credit card required just for this
3. In the search bar, search for "PageSpeed Insights API" and click **Enable**
4. Go to **APIs & Services > Credentials**
5. Click **Create Credentials > API key**
6. Copy the key - this is your `PAGESPEED_API_KEY`
7. (Optional but recommended) Click "Restrict key" and limit it to the PageSpeed Insights API only, so it can't be misused if it ever leaks

Free tier: 25,000 requests/day - you will not come close to this.

## Step 3: Set up the free Google Sheets webhook

Follow the instructions at the top of `google-apps-script/Code.gs` - it walks through
creating the sheet, pasting the script, and deploying it as a web app. You'll end up
with a URL that looks like `https://script.google.com/macros/s/XXXXX/exec` -
that's your `SHEET_WEBHOOK_URL`.

## Step 4: Connect the repo to Cloudflare (same way as your main site)

1. In Cloudflare dashboard, go to **Workers & Pages > Create > Connect to Git**
2. Select the `kayvora-ai-audit` repo
3. Build settings: leave build command blank (there's no build step - this project
   has no bundler, it's plain JS), output directory doesn't matter since we use `wrangler.toml`
4. Deploy

## Step 5: Add your secrets

You will NOT put these in `wrangler.toml` in plain text - they're set as encrypted
secrets, same idea as your `GEMINI_API_KEY` on the main site.

In the Cloudflare dashboard, go to your new Worker's **Settings > Variables and Secrets**,
and add these three (as "Secret" type, not plain text variable):

| Name | Value |
|---|---|
| `GEMINI_API_KEY` | same key you already use on the main Kayvora AI site |
| `PAGESPEED_API_KEY` | the key from Step 2 |
| `SHEET_WEBHOOK_URL` | the URL from Step 3 |

## Step 6: Add the free subdomain

1. In Cloudflare, go to your `kayvora.ai` zone > DNS
2. Your Worker route/custom domain can be added directly from the Worker's
   **Settings > Domains & Routes > Add Custom Domain** screen
3. Enter `audit.kayvora.ai` - Cloudflare handles the DNS + SSL automatically, free

## Step 7: Test it

Visit `audit.kayvora.ai`, fill out the form with a real website, and confirm:
- The results show up on the page
- The PDF downloads and looks right
- A new row appears in your Google Sheet

---

## How it works (plain English)

1. Someone fills out the form (business name, website, industry, email, etc.)
2. Your Worker fetches their actual website and checks real things: is it on https,
   does it have a title tag, meta description, mobile viewport tag, contact form,
   alt text on images, etc.
3. It calls Google's free PageSpeed API to get a real speed score
4. Those real checks get turned into a Website Score and SEO Score using fixed rules
   (see `scoring.js` if you ever want to adjust what counts against a business)
5. Gemini (the same AI powering your chatbot) takes those real findings plus their
   industry/size/challenge, and generates the Automation Score, Lead Gen Score, AI
   Readiness Score, the opportunity map, revenue estimate, and roadmap
6. The browser builds the full PDF locally using jsPDF - no server-side PDF service needed
7. The lead's info gets logged to your Google Sheet in the background

## Cost breakdown (all free tier)

| Service | Free limit | Your expected usage |
|---|---|---|
| Cloudflare Workers | 100,000 requests/day | Way under, even with hundreds of audits/day |
| Google PageSpeed API | 25,000 requests/day | 1 request per audit |
| Gemini 2.5 Flash | Generous daily free quota | 1 request per audit |
| Google Sheets + Apps Script | No practical cap | 1 request per audit |
| Cloudflare custom domain | Free | You already own kayvora.ai |

## Adjusting things later

- Want to change what counts against a website's score? Edit `src/lib/scoring.js`
- Want to change the questions Gemini answers, or the tone of the summary?
  Edit the prompt in `src/lib/gemini.js`
- Want to change the PDF's look? Edit `public/pdfGenerator.js`
- Want to change form fields? Edit `public/index.html` and `public/app.js`
