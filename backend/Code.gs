/**
 * SPARDHA 2K26 — Registration backend (Google Apps Script + Google Sheets)
 * Setup: see BACKEND_SETUP.md. Deploy as Web app: Execute as "Me", access "Anyone".
 */
const CFG = {
  SHEET: "Registrations",
  ORGANISER_EMAIL: "acm.vvit@gmail.com",
  FEST: "SPARDHA 2K26",
  MAX_PER_EVENT: 0,          // 0 = unlimited; set e.g. 60 to cap registrations per event
  ADMIN_TOKEN: "CHANGE_ME",  // used for ?action=list&token=... (CSV export)
};
const HEAD = ["Reg ID", "Timestamp", "Event", "Day", "Team Leader", "Email", "Phone", "College", "Team Size"];

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(CFG.SHEET);
  if (!sh) {
    sh = ss.insertSheet(CFG.SHEET);
    sh.appendRow(HEAD);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEAD.length).setFontWeight("bold").setBackground("#2b1d0e").setFontColor("#f3e3b5");
  }
  return sh;
}
const clean_ = (v, n) => String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
// Stop spreadsheet formula injection (=, +, -, @)
const safe_ = (v) => (/^[=+\-@]/.test(v) ? "'" + v : v);

function validate_(d) {
  const e = {};
  let p = String(d.phone || "").replace(/\D/g, "");
  if (p.length === 12 && p.startsWith("91")) p = p.slice(2);
  if (d.name.length < 2) e.name = "Enter the team leader's full name";
  if (!/^\S+@\S+\.\S+$/.test(d.email)) e.email = "Enter a valid email address";
  if (p.length !== 10) e.phone = "Enter a 10-digit mobile number";
  if (d.college.length < 2) e.college = "Enter your college / institution";
  if (!d.event) e.event = "Select an event";
  d.phone = p;
  return e;
}

function doPost(ev) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    let raw = {};
    try { raw = JSON.parse(ev.postData.contents); } catch (x) { return json_({ ok: false, error: "Bad request" }); }
    if (raw.website) return json_({ ok: true, id: "SP26-0000" }); // honeypot: pretend success to bots

    const d = {
      name: clean_(raw.name, 80), email: clean_(raw.email, 120).toLowerCase(), phone: raw.phone,
      college: clean_(raw.college, 120), event: clean_(raw.event, 60), day: clean_(raw.day, 40),
      teamSize: Math.max(1, Math.min(10, parseInt(raw.teamSize, 10) || 1)),
    };
    const errors = validate_(d);
    if (Object.keys(errors).length) return json_({ ok: false, errors: errors, error: "Please correct the highlighted fields" });

    const sh = sheet_();
    const rows = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, HEAD.length).getValues() : [];
    if (rows.some((r) => r[2] === d.event && String(r[5]).toLowerCase() === d.email))
      return json_({ ok: false, duplicate: true, error: "This email is already registered for " + d.event });
    if (CFG.MAX_PER_EVENT && rows.filter((r) => r[2] === d.event).length >= CFG.MAX_PER_EVENT)
      return json_({ ok: false, full: true, error: d.event + " is full. Please pick another event." });

    const id = "SP26-" + String(sh.getLastRow()).padStart(4, "0"); // row 2 -> 0001
    sh.appendRow([id, new Date(), safe_(d.event), safe_(d.day), safe_(d.name), safe_(d.email), "'" + d.phone, safe_(d.college), d.teamSize]);
    SpreadsheetApp.flush();
    notify_(id, d);
    return json_({ ok: true, id: id });
  } catch (err) {
    return json_({ ok: false, error: "Server busy, please retry" });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function notify_(id, d) {
  try {
    MailApp.sendEmail({
      to: d.email, replyTo: CFG.ORGANISER_EMAIL, name: CFG.FEST,
      subject: "Registration confirmed — " + d.event + " (" + id + ")",
      htmlBody:
        "<div style='font-family:Georgia,serif;max-width:480px'><h2 style='color:#8a5a12'>" + CFG.FEST + " — Expedition Logged</h2>" +
        "<p>Hi " + esc_(d.name) + ", your team is registered.</p>" +
        "<table cellpadding='6' style='border-collapse:collapse'>" +
        "<tr><td><b>Registration ID</b></td><td>" + id + "</td></tr>" +
        "<tr><td><b>Event</b></td><td>" + esc_(d.event) + "</td></tr>" +
        "<tr><td><b>Day</b></td><td>" + esc_(d.day) + "</td></tr>" +
        "<tr><td><b>Team size</b></td><td>" + d.teamSize + "</td></tr></table>" +
        "<p>Carry this ID to the venue. Questions? Reply to this email.</p></div>",
    });
    MailApp.sendEmail(CFG.ORGANISER_EMAIL, "New registration " + id + " — " + d.event,
      [d.name, d.email, d.phone, d.college, d.event, d.day, "Team: " + d.teamSize].join("\n"));
  } catch (x) { /* mail quota must never block a saved registration */ }
}
const esc_ = (s) => String(s).replace(/[&<>"]/g, (c) => "&#" + c.charCodeAt(0) + ";");

// GET ?action=ping -> health, ?action=count -> per-event counts, ?action=list&token=... -> CSV for organisers
function doGet(ev) {
  const a = (ev.parameter && ev.parameter.action) || "ping";
  if (a === "count") {
    const sh = sheet_(), n = {};
    if (sh.getLastRow() > 1) sh.getRange(2, 3, sh.getLastRow() - 1, 1).getValues().forEach((r) => (n[r[0]] = (n[r[0]] || 0) + 1));
    return json_({ ok: true, counts: n });
  }
  if (a === "list") {
    if (ev.parameter.token !== CFG.ADMIN_TOKEN || CFG.ADMIN_TOKEN === "CHANGE_ME") return json_({ ok: false, error: "Unauthorised" });
    const csv = sheet_().getDataRange().getValues().map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(",")).join("\n");
    return ContentService.createTextOutput(csv).setMimeType(ContentService.MimeType.CSV);
  }
  return json_({ ok: true, service: "spardha-registration" });
}
