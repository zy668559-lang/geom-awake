# DEPLOY (Vercel Staging)

## 1) Deploy Steps
1. Push latest `main` to GitHub.
2. In Vercel, click `Add New -> Project`, import this repo, framework keeps `Next.js`.
3. Build command: `next build` (default), output: `.next` (default).
4. Add environment variables from the list below.
5. Click `Deploy`, wait until status is `Ready`.

## 2) Required Env Vars
- `OPENAI_API_KEY`
- `GOOGLE_API_KEY`

Notes:
- Do not commit `.env.local`.
- For staging demo mode, you can use `/processing?demo=1` to avoid upstream model calls.

## 3) Acceptance (3 steps)
1. Open staging URL, run one diagnosis from `/processing`, verify it reaches `/report`.
2. From `/upsell`, click either package and verify route goes to `/confirm?pkg=A|B&cause=...`.
3. Run `npx playwright test tests/diagnostic.spec.ts --project=chromium` locally and confirm PASS.
