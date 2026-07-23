// FREE lead-logging webhook - no Make.com, no third-party service, no cost, no request caps.
//
// SETUP:
// 1. Go to https://sheets.google.com and create a new spreadsheet, name it "Kayvora AI Audit Leads"
// 2. In row 1, add these column headers exactly:
//    Timestamp | Business Name | Website | Industry | Email | Phone | Employees | Challenge | Overall Score
// 3. Click Extensions > Apps Script
// 4. Delete anything in the editor and paste this entire file in
// 5. Click Deploy > New deployment > select type "Web app"
//    - Description: Kayvora Audit Webhook
//    - Execute as: Me
//    - Who has access: Anyone
// 6. Click Deploy, authorize it (click through the "unsafe" warning - this is your own script)
// 7. Copy the Web app URL it gives you - that's your SHEET_WEBHOOK_URL secret

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.businessName || "",
    data.websiteUrl || "",
    data.industry || "",
    data.email || "",
    data.phone || "",
    data.employees || "",
    data.challenge || "",
    data.overallScore || "",
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
