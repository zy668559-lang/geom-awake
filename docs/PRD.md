# PRD

## Decision Log

### 2026-02-21 - MVP2 shell-first close loop + stable local verification
- **Scope chosen**:
  - Deliver MVP2 as a runnable paid-loop shell first (unlock, repair plan, submit, retest, upsell), with placeholder content allowed.
  - Keep focus on flow integrity (routes/buttons/state), not full curriculum content depth.
- **Grade field decision**:
  - Keep grade support in backend payload/contracts where already present.
  - Do not expand grade-specific UI/logic in MVP2 shell stage to avoid scope creep.
  - Reason: preserve future compatibility while minimizing current delivery risk.
- **429 strategy decision**:
  - Enforce frontend anti-double-submit hard lock (`isLoading` + sync lock ref) so "1 click = 1 request".
  - Add backend exponential backoff + max retries + explicit logs in `/api/analyze`.
  - Add short-lived idempotent cache for identical analyze payloads to absorb repeated bursts.
  - Reason: make behavior deterministic under fast-click and transient upstream throttling.
- **Out of scope (explicitly not done in this round)**:
  - No payment gateway integration.
  - No auth/account system expansion.
  - No large content bank enrichment beyond placeholders.

