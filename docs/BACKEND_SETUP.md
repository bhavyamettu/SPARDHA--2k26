# Registration backend setup (5 minutes, free)

1. Create a Google Sheet named "SPARDHA 2K26 Registrations" (logged in as the ACM account).
2. Extensions > Apps Script. Delete the sample code, paste `backend/Code.gs`.
3. Edit `CFG`: set `ORGANISER_EMAIL`, a long random `ADMIN_TOKEN`, and optionally `MAX_PER_EVENT`.
4. Deploy > New deployment > type **Web app**. Execute as: **Me**. Who has access: **Anyone**. Authorise when asked.
5. Copy the Web app URL (ends in `/exec`).
6. In the project root create `.env` with `VITE_REGISTRATION_ENDPOINT=<that URL>`; rebuild/redeploy the site.
   (On Vercel/Netlify/Lovable add it as an environment variable instead.)
7. Test: `<URL>?action=ping` shows `{"ok":true,...}`. Submit the form: a row appears in the "Registrations" sheet, the participant gets a confirmation email with an ID like SP26-0001, and organisers get a notification.

Organiser extras: `<URL>?action=count` (per-event totals), `<URL>?action=list&token=ADMIN_TOKEN` (CSV download).
After editing Code.gs, use Deploy > Manage deployments > Edit > New version, or the changes will not go live.
Limits: ~100 emails/day on a free Gmail account; registrations are always saved even if mail quota is hit.
