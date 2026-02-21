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

### 2026-02-21 - MVP2 training content delivery mode
- **Delivery decision**:
  - MVP2 7-day repair content is delivered as a static content package (`data`) rendered by pages.
  - No new external API calls are introduced for this stage.
  - Existing diagnosis chain remains unchanged.
- **Not included now**:
  - No AI-based judging for repair content in this phase.
  - No adaptive content generation in this phase.

### 2026-02-21 - Retest and Upsell as paid-loop exit
- **Decision**:
  - Retest and upsell are the MVP2 monetization loop exit.
  - The loop path is: `Day7 -> /retest -> /retest/result -> /upsell`.
  - Retest uses static local pack scoring (no external API) to keep flow stable and explainable.

### 2026-02-21 - T-202 static 7-day content completion
- **Do**:
  - Complete 3 repair lines (`画线想不到/条件关系乱/证明写不出`) with full 7-day static content.
  - Standardize each day payload to include `command`, `microPractice`, `reflectionPrompt`.
  - Keep current page rendering and route flow unchanged, only feed richer static content.
- **Do not**:
  - Do not add any external API.
  - Do not change `/api/analyze`.
  - Do not change request count/concurrency strategy for diagnosis.
- **Why**:
  - Content delivery can be expanded safely without introducing instability to the existing diagnosis path.
  - Static package keeps behavior deterministic and supports immediate MVP2 content handoff.

### 2026-02-21 - Retest static 6Q local-judge mode
- **Decision**:
  - 复检采用静态 6 题模式，按错因线（画线想不到/条件关系乱/证明写不出）出题。
  - 判定在前端本地完成，输出命中率与建议，不接入外部题库或外部判题服务。
- **Boundary**:
  - 不改 `/api/analyze`，不改诊断请求次数策略。
  - 不新增任何外部 API 调用，确保诊断链路稳定。
