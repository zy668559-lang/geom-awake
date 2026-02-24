# Geometry Awakening MVP

Next.js app for geometry diagnosis, repair training loop, retest, and upsell/confirm flow.

## Local Run
1. Install deps: `npm install`
2. Configure env from `.env.example` into `.env.local`
3. Start dev: `npm run dev`
4. Open: `http://localhost:3000`

## Vercel Deploy (Staging/Prod)
1. Push `main` to GitHub.
2. Vercel: `Add New` -> `Project` -> import this repo.
3. Framework should auto-detect as `Next.js`.
4. Add env vars from checklist below.
5. Click `Deploy`.

## Vercel Env Vars Checklist (names only)
- `GEMINI_API_KEY`
- `DEEPSEEK_API_KEY`
- `DEEPSEEK_BASE_URL`
- `DEEPSEEK_MODEL`
- `MOCK_MODE`
- `FORCE_MOCK_ANALYZE`
- `ANALYZE_MAX_RETRIES`
- `ANALYZE_BACKOFF_BASE_MS`
- `ANALYZE_CACHE_TTL_MS`
- `OPENAI_API_KEY`
- `OPENAI_BASE_URL`
- `OPENAI_MODEL`
- `NEXT_PUBLIC_GEMINI_API_KEY`

## Safety
- Do not commit `.env.local`.
- No secrets should appear in committed files.

## Key Docs
- `docs/DEPLOY.md`
- `docs/OPS_BETA.md`
- `docs/TASKS.md`
