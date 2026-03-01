# CloudBase Deploy Guide (Tencent)

This guide deploys the current Next.js app to Tencent CloudBase as a China-accessible alternative.

## 0) Prerequisites
- Tencent Cloud account with CloudBase enabled.
- This repo connected to GitHub.
- Branch to deploy: `main`.

## 1) Build/Start Scripts (from `package.json`)
- Dev: `npm run dev` (internally `next dev -p 3000`)
- Build: `npm run build` (internally `next build`)
- Start: `npm run start` (internally `next start`)

CloudBase should use:
- Install command: `npm ci` (or `npm install`)
- Build command: `npm run build`
- Start command: `npm run start`

## 2) CloudBase UI Steps
1. Open Tencent Cloud console -> CloudBase -> your environment.
2. Go to `Hosting` (or `Web 应用托管`) -> `Create`.
3. Choose `Import from GitHub` and select this repository.
4. Set branch to `main`.
5. Framework: `Next.js` (auto-detect if available).
6. Build settings:
   - Install: `npm ci`
   - Build: `npm run build`
   - Start: `npm run start`
   - Node version: `18+` (recommended `20`).
7. Environment variables:
   - Add `GEMINI_API_KEY` in CloudBase environment variables.
   - Optional: `ANALYZE_CACHE_TTL_MS`.
8. Click `Deploy` and wait for status `Running/Available`.

## 3) Notes
- Do not upload `.env.local` to Git.
- Keep API path unchanged: `/api/analyze`.
- If diagnosis fails with quota/permission, the API returns structured error JSON with `errorCode/reason/nextStep`.

## 4) Acceptance Checklist (3 steps)
1. Processing -> Report:
   - Open `${BASE_URL}/processing`, upload image, select one cause, click `确定`.
   - Expect one `POST /api/analyze`, then route to `/report` (or explicit structured error message).
2. Upsell -> Confirm:
   - Open `${BASE_URL}/upsell?cause=draw_line`.
   - Click `我选A` or `我选B`, expect route to `/confirm?pkg=A|B&cause=draw_line`.
3. Playwright diagnostic:
   - Run command below locally and ensure PASS.

## 5) Acceptance Commands (exact)
```bash
npm run dev -- -p 3000
npx playwright test tests/diagnostic.spec.ts --project=chromium
```
