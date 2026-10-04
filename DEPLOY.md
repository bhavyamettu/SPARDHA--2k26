# SPARDHA 2K26 — Deploy guide

## Folder layout
```
package.json, vite.config.ts, tsconfig.json   project config (this folder is the deploy root)
src/                 website source (routes, components, assets, spot-event posters in src/assets/spot)
public/              static files
backend/Code.gs      registration backend (Google Apps Script) — paste into your Google Sheet
docs/docs/BACKEND_SETUP.md  backend steps in detail
docs/preview.html    standalone offline preview of the site (not needed for deploy)
.env.example         copy to .env
```

## Step 1 — Backend (do this first, 5 min)
Follow `docs/docs/BACKEND_SETUP.md`. You end up with a URL ending in `/exec`.
Registrations appear in the Google Sheet tab "Registrations".

## Step 2 — Set the environment variable
Name: `VITE_REGISTRATION_ENDPOINT`   Value: your `/exec` URL
(Locally: copy `.env.example` to `.env` and fill it in.)
It must be set at BUILD time, so set it before you deploy/redeploy.

## Step 3 — Deploy
Local check:
```
bun install      # or: npm install
bun run dev      # http://localhost:8080 (or the port shown)
bun run build
```
Hosting options (this project builds for Cloudflare by default):
- Lovable: import the project, add the env variable in Project Settings, Publish.
- Cloudflare Pages / Workers: connect the repo or zip contents, build command `bun run build` (or `npm run build`), add the env variable, deploy.

## Step 4 — Test
Open the live site, register once, then check: a new row in the sheet, the confirmation email with an ID like SP26-0001, and the success message on screen.
