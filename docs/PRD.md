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
  - Complete 3 repair lines (`鐢荤嚎鎯充笉鍒?鏉′欢鍏崇郴涔?璇佹槑鍐欎笉鍑篳) with full 7-day static content.
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
  - 澶嶆閲囩敤闈欐€?6 棰樻ā寮忥紝鎸夐敊鍥犵嚎锛堢敾绾挎兂涓嶅埌/鏉′欢鍏崇郴涔?璇佹槑鍐欎笉鍑猴級鍑洪銆?  - 鍒ゅ畾鍦ㄥ墠绔湰鍦板畬鎴愶紝杈撳嚭鍛戒腑鐜囦笌寤鸿锛屼笉鎺ュ叆澶栭儴棰樺簱鎴栧閮ㄥ垽棰樻湇鍔°€?- **Boundary**:
  - 涓嶆敼 `/api/analyze`锛屼笉鏀硅瘖鏂姹傛鏁扮瓥鐣ャ€?  - 涓嶆柊澧炰换浣曞閮?API 璋冪敤锛岀‘淇濊瘖鏂摼璺ǔ瀹氥€?
### 2026-02-21 - Report to Unlock to Repair gate strategy
- **Decision**:
  - 鍦ㄦ姤鍛婇〉鎻愪緵缁熶竴鍏ュ彛鎸夐挳鈥滃紑濮?澶╀慨澶嶁€濄€?  - 鏈В閿佺敤鎴疯烦杞?`/unlock?next=/repair`銆?  - 瑙ｉ攣鎴愬姛鍚庤嚜鍔ㄥ洖璺冲埌 `next`锛堥粯璁?`/repair`锛夈€?- **Boundary**:
  - 涓嶆敼 `/api/analyze` 璇婃柇閾捐矾銆?  - 涓嶆柊澧炲閮?API 璋冪敤锛屽叏閮ㄥ墠绔湰鍦扮姸鎬佹帶鍒躲€?
### 2026-02-21 - Sellable deliverable loop hardening
- **Decision**:
  - 鎶?7 澶╁唴瀹瑰崰浣嶅叏閮ㄦ浛鎹㈡垚鍙洿鎺ヤ氦浠樼殑闈欐€佹枃妗堬紙3 鏉￠敊鍥犵嚎 x 7 澶╋級銆?  - 澶嶆缁撴灉椤靛己鍒舵寜宸查€夐敊鍥犵嚎鍏滃簳鏄剧ず锛屼笉鍐嶅嚭鐜扳€滄湭鎸囧畾閿欏洜鈥濄€?  - 澧炲姞 `?demo=1` 婕旂ず妯″紡锛岀洿鎺ヤ娇鐢ㄦ湰鍦板す鍏疯蛋瀹屾暣閾捐矾锛岄伩鍏?429 椋庨櫓銆?- **Boundary**:
  - 涓嶆敼 `/api/analyze`锛屼笉鏂板浠讳綍澶栭儴 API銆?  - 淇濇寔 `tests/diagnostic.spec.ts` 閫氳繃锛岀户缁弧瓒?1 click = 1 request銆?
### 2026-02-21 - T-205 challenge completion and local submit determinism
- **Decision**:
  - 浠婃棩灏忔寫鎴樺湪 3 鏉￠敊鍥犵嚎鐨?Day1~Day7 鍏ㄩ噺濉厖锛屾瘡澶╁浐瀹?2 鏉″井棰橈紝椤甸潰鎸?`cause + dayId` 鏄剧ず銆?  - 鎻愪氦鍙嶉椤垫敼涓烘湰鍦扮‘瀹氭€у垽瀹氾紝涓嶄緷璧栨帴鍙ｈ繑鍥烇紝淇濊瘉 2 绉掑唴缁撴潫骞跺睍绀虹粨鏋滃崱銆?  - 缁撴灉鍗″浐瀹氭彁渚涗袱涓笅涓€姝ユ寜閽細鍥炲埌璁粌銆佸幓澶嶆銆?- **Boundary**:
  - 涓嶄慨鏀?`/api/analyze`銆?  - 涓嶆柊澧炲閮?API 璇锋眰銆?  - 涓嶇牬鍧忕幇鏈夎瘖鏂姹傛鏁扮害鏉熶笌缃戠粶瀹¤娴嬭瘯銆?
### 2026-02-23 - T-206 static challenge completion + local submit deterministic result
- **Do**:
  - Fill all `today challenge` entries for 3 fault lines x Day1-Day7, fixed to 2 micro questions per day, and render directly on `/repair/day/:id`.
  - Make `/repair/submit` use local deterministic judging only (no API call), always finish quickly, and show result card in-page with two next-step buttons.
- **Do not**:
  - Do not modify `/api/analyze`.
  - Do not add any external API call.
  - Do not change diagnosis request-count strategy (`1 click = 1 request`).
- **Why**:
  - Keep MVP2 training/retest loop demoable and stable under local conditions, while avoiding submit-page hanging and preserving diagnosis stability.
