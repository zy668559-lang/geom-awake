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

## Mobile Upload Tips (iOS/WeChat)
- `/processing` keeps two explicit entries:
  - `拍照上传` (camera capture)
  - `从相册选择` (album picker)
- Before submit, UI always shows:
  - selected image preview
  - file name
  - MIME type
  - file size
- Client preprocessing:
  - longest edge `<= 1280px`
  - JPEG quality around `0.7`
  - target `<= 900KB`, hard cap `1MB`

## Troubleshooting (IMAGE_EMPTY / payload-too-large)
- If user sees `IMAGE_EMPTY` or `图片为空/格式不支持`:
  - retry via `从相册选择`
  - on iOS camera settings switch to `兼容性最佳 (JPG)`
  - avoid HEIC source when possible
- If user sees `IMAGE_TOO_LARGE` or payload warning:
  - crop to one question area only
  - reduce background and retake with better light
  - retry upload after compression
- Server guard behavior:
  - empty bytes -> `400 IMAGE_EMPTY`
  - oversized image -> `413 IMAGE_TOO_LARGE`
  - model provider failure -> response includes `MODEL_FAILED=true`

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
