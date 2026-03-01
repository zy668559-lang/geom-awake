# Security Notes

## Secrets Policy
- Never commit `.env.local`, API keys, or any credential files into Git.
- `GEMINI_API_KEY` must be configured only in deployment platform environment variables (CloudBase/Vercel), not in source code.
- Use `.env.example` for variable names only, never real values.

## Quick Check Before Push
```bash
git ls-files | rg "^(\\.env|.*\\/\\.env)"
git status
```
