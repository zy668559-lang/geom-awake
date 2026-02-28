# DEPLOY (Vercel Production/Staging)

## 1) Deploy Steps
1. Push latest `main` to GitHub.
2. In Vercel, open project `geometry-mvp` and confirm `Production Branch = main`.
3. Trigger deploy from latest `main` commit and wait for `Ready`.

## 2) Required Env Vars (for diagnosis flow)
- `GEMINI_API_KEY`
- `ANALYZE_CACHE_TTL_MS` (optional, default 120000)

## 3) What Changed (Payload + Real Diagnosis)
- Client upload now preprocesses image before submit:
  - longest edge ~1400px
  - JPEG quality ~0.75
  - if still >2MB, UI blocks and asks user to crop/retry
- Client sends `multipart/form-data` only (`image`, `note`, `cause`), no JSON base64 payload.
- `/api/analyze` now parses `formData()` and sends image + note + cause to Gemini.
- Gemini failure returns structured error JSON (`errorCode`, `reason`, `nextStep`) instead of fake successful template diagnosis.

## 4) Verification
1. Open `${BASE_URL}/processing`, upload a real image, select one cause, click `确定`.
   - Network must show exactly one `POST /api/analyze`.
   - Request payload type must be `multipart/form-data`.
2. Repeat with a different image and compare report `inputHashTail` (should differ).
3. Open `${BASE_URL}/upsell?cause=draw_line`, page should load normally.

## 5) If "Payload Too Large" Appears
1. Confirm frontend version is latest deployment (hard refresh / clear cache).
2. Re-upload image after cropping to only the geometry problem area.
3. If still failing, lower source image resolution before upload and retry.
