# Changelog

## [2026-02-08] - Baseline & Stabilization

### Added
- `docs/TODO.md`: Prioritized roadmap.
- `docs/ARCH.md`: Architecture overview.
- `docs/ACCEPTANCE.md`: Verification guidelines.
- Mock Mode: Toggle via `MOCK_MODE=true` in `.env.local`.
- Request Queuing: Singleton queue in backend to prevent API collisions.
- Exponential Backoff: Systematic retry logic for 429/503 errors.

### Changed
- Refactored `lib/gemini.ts`: Added image scaling (sharp) and token limits.
- Hardened `app/processing/page.tsx`: Added frontend button locks and re-execution guards.
- Fixed `package.json`: Hardcoded dev port to 3000.
- Updated `.gitignore`: Enhanced secret protection.

### Fixed
- Duplicate API requests in development mode.
- Resource Exhausted (429) errors from Google API.
- Port drifting from 3000 to 3001.
