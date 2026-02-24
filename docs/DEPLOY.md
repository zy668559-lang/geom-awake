# DEPLOY (Vercel Staging)

## 1) Deploy Steps
1. Push latest `main` to GitHub.
2. In Vercel, click `Add New -> Project`, import this repo, framework keeps `Next.js`.
3. Build command: `next build` (default), output: `.next` (default).
4. Add environment variables from the list below.
5. Click `Deploy`, wait until status is `Ready`.

## 2) Required Env Vars
- `GEMINI_API_KEY`
- `DEEPSEEK_API_KEY`

Optional but recommended:
- `DEEPSEEK_BASE_URL` (default: `https://api.deepseek.com`)
- `DEEPSEEK_MODEL` (default: `deepseek-chat`)
- `MOCK_MODE` / `FORCE_MOCK_ANALYZE` (`true` enables analyze fallback mock mode)

Notes:
- Do not commit `.env.local`.
- For staging demo mode, you can use `/processing?demo=1` to avoid upstream model calls.
- Current diagnosis route `/api/analyze` checks both `GEMINI_API_KEY` and `DEEPSEEK_API_KEY`.

## 3) Acceptance (3 steps)
1. Open `${STAGING_URL}/processing`, run one diagnosis, verify it reaches `${STAGING_URL}/report`.
2. Open `${STAGING_URL}/upsell?cause=draw_line`, click either package, verify it routes to `${STAGING_URL}/confirm?pkg=A|B&cause=draw_line`.
3. Run `npx playwright test tests/diagnostic.spec.ts --project=chromium` locally and confirm PASS.
