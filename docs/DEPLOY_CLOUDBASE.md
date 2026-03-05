# CloudBase Run Deployment (Git Source)

## CloudBase UI Fields (exact)
1. Tencent Cloud Console -> CloudBase -> target environment -> CloudBase Run.
2. Create Service -> Deploy from Git repository.
3. Repository:
   - Source: GitHub
   - Branch: `main`
   - Target directory: `.`
   - Dockerfile name: `Dockerfile`
4. Runtime/Ports:
   - Container port: use `PORT` (default `80` in Dockerfile)
   - Public access port: `80`
   - If your template asks mapping, set `80 -> 80`.
5. Build/Start expectations (inside Dockerfile):
   - `npm ci`
   - `npm run build`
   - `npm run start -- -p ${PORT}`

## Required Environment Variables
- `GEMINI_API_KEY`
- `DEEPSEEK_API_KEY`
- `VISION_PROVIDER` (default: `gemini`)
- Optional: `ANALYZE_CACHE_TTL_MS`

## Upload Payload Notes
- Client now compresses image before upload:
  - max edge `<= 1600px`
  - JPEG quality around `0.7`
  - target `<= 900KB`, hard cap `1MB`
- If still too large, UI message:
  - `图片过大，请重试/换一张更清晰但更小的照片`

## Security Checklist
- `.env.local` and all secret env files must stay ignored.
- Never commit keys; only set keys in CloudBase environment variables.
- Quick check:
  - `git ls-files | rg "^(\\.env|.*\\/\\.env)"`
  - `git status`

## 3-step Acceptance
1. `${BASE_URL}/processing`:
   - upload real photo (<1MB), pick one cause, click once
   - expect exactly one `POST /api/analyze`, then `/report`.
2. `${BASE_URL}/upsell?cause=draw_line`:
   - click package A/B, expect `/confirm?pkg=A|B&cause=draw_line`.
3. Local audit:
   - `npx playwright test tests/diagnostic.spec.ts --project=chromium` must PASS.
