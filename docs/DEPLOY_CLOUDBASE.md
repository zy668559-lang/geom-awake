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
   - Container port: `3000` (Dockerfile default `PORT=3000`)
   - Public access port: `80`
   - Port mapping: `80 -> 3000`
5. Build/Start expectations (inside Dockerfile):
   - `npm ci`
   - `npm run build`
   - `npm run start -- -p ${PORT}`

## Required Environment Variables
- `DASHSCOPE_API_KEY` (preferred in China production)
- `GEMINI_API_KEY` (fallback provider)
- `DEEPSEEK_API_KEY` (existing compatibility env)
- `VISION_PROVIDER` (default: `gemini`)
- Optional: `ANALYZE_CACHE_TTL_MS`

Provider routing:
- If `DASHSCOPE_API_KEY` exists, diagnosis uses Qwen-VL.
- Else, diagnosis falls back to Gemini provider.

## Upload Payload Notes
- Client compresses image before upload:
  - max edge `<= 1280px`
  - JPEG quality about `0.7`
  - target `<= 900KB`, hard cap `1MB`
- If still too large, UI message:
  - `图片过大，请重试/换一张更清晰但更小的照片`

## Security Checklist
- `.env.local` and all secret env files must stay ignored.
- Never commit keys; set keys only in CloudBase environment variables.
- Quick check:
  - `git ls-files | rg "^(\\.env|.*\\/\\.env)"`
  - `git status`

## 3-step Acceptance
1. `${BASE_URL}/processing`:
   - upload a real photo (<1MB), pick one cause, click once
   - expect exactly one `POST /api/analyze`, then `/report` (non-demo diagnosis text).
2. `${BASE_URL}/upsell?cause=draw_line`:
   - click package A/B, expect `/confirm?pkg=A|B&cause=draw_line`.
3. Local audit:
   - `npx playwright test tests/diagnostic.spec.ts --project=chromium` must PASS.
