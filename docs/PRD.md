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
  - Complete 3 repair lines (`閻㈣崵鍤庨幆鍏呯瑝閸?閺夆€叉閸忓磭閮存稊?鐠囦焦妲戦崘娆庣瑝閸戠) with full 7-day static content.
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
  - 婢跺秵顥呴柌鍥╂暏闂堟瑦鈧?6 妫版ɑ膩瀵骏绱濋幐澶愭晩閸ョ姷鍤庨敍鍫㈡暰缁炬寧鍏傛稉宥呭煂/閺夆€叉閸忓磭閮存稊?鐠囦焦妲戦崘娆庣瑝閸戠尨绱氶崙娲暯閵?  - 閸掋倕鐣鹃崷銊ュ缁旑垱婀伴崷鏉跨暚閹存劧绱濇潏鎾冲毉閸涙垝鑵戦悳鍥︾瑢瀵ら缚顔呴敍灞肩瑝閹恒儱鍙嗘径鏍劥妫版ê绨遍幋鏍ь樆闁劌鍨芥０妯绘箛閸斅扳偓?- **Boundary**:
  - 娑撳秵鏁?`/api/analyze`閿涘奔绗夐弨纭呯槚閺傤叀顕Ч鍌涱偧閺佹壆鐡ラ悾銉ｂ偓?  - 娑撳秵鏌婃晶鐐版崲娴ｆ洖顦婚柈?API 鐠嬪啰鏁ら敍宀€鈥樻穱婵婄槚閺傤參鎽肩捄顖溓旂€规哎鈧?
### 2026-02-21 - Report to Unlock to Repair gate strategy
- **Decision**:
  - 閸︺劍濮ら崨濠囥€夐幓鎰返缂佺喍绔撮崗銉ュ經閹稿鎸抽垾婊冪磻婵?婢垛晙鎱ㄦ径宥佲偓婵勨偓?  - 閺堫亣袙闁夸胶鏁ら幋鐤儲鏉?`/unlock?next=/repair`閵?  - 鐟欙綁鏀ｉ幋鎰閸氬氦鍤滈崝銊ユ礀鐠哄啿鍩?`next`閿涘牓绮拋?`/repair`閿涘鈧?- **Boundary**:
  - 娑撳秵鏁?`/api/analyze` 鐠囧﹥鏌囬柧鎹愮熅閵?  - 娑撳秵鏌婃晶鐐差樆闁?API 鐠嬪啰鏁ら敍灞藉弿闁劌澧犵粩顖涙拱閸︽壆濮搁幀浣瑰付閸掕翰鈧?
### 2026-02-21 - Sellable deliverable loop hardening
- **Decision**:
  - 閹?7 婢垛晛鍞寸€圭懓宕版担宥呭弿闁劍娴涢幑銏″灇閸欘垳娲块幒銉ゆ唉娴犳娈戦棃娆愨偓浣规瀮濡楀牞绱? 閺夛繝鏁婇崶鐘靛殠 x 7 婢垛晪绱氶妴?  - 婢跺秵顥呯紒鎾寸亯妞ら潧宸遍崚鑸靛瘻瀹告煡鈧鏁婇崶鐘靛殠閸忔粌绨抽弰鍓с仛閿涘奔绗夐崘宥呭毉閻滄壋鈧粍婀幐鍥х暰闁挎瑥娲滈垾婵勨偓?  - 婢х偛濮?`?demo=1` 濠曟梻銇氬Ο鈥崇础閿涘瞼娲块幒銉ゅ▏閻劍婀伴崷鏉裤仚閸忕柉铔嬬€瑰本鏆ｉ柧鎹愮熅閿涘矂浼╅崗?429 妞嬪酣娅撻妴?- **Boundary**:
  - 娑撳秵鏁?`/api/analyze`閿涘奔绗夐弬鏉款杻娴犺缍嶆径鏍劥 API閵?  - 娣囨繃瀵?`tests/diagnostic.spec.ts` 闁俺绻冮敍宀€鎴风紒顓熷姬鐡?1 click = 1 request閵?
### 2026-02-21 - T-205 challenge completion and local submit determinism
- **Decision**:
  - 娴犲﹥妫╃亸蹇斿閹存ê婀?3 閺夛繝鏁婇崶鐘靛殠閻?Day1~Day7 閸忋劑鍣烘繅顐㈠帠閿涘本鐦℃径鈺佹祼鐎?2 閺夆€充簳妫版﹫绱濇い鐢告桨閹?`cause + dayId` 閺勫墽銇氶妴?  - 閹绘劒姘﹂崣宥夘洯妞ゅ灚鏁兼稉鐑樻拱閸︽壆鈥樼€规碍鈧冨灲鐎规熬绱濇稉宥勭贩鐠ф牗甯撮崣锝堢箲閸ョ儑绱濇穱婵婄槈 2 缁夋帒鍞寸紒鎾存将楠炶泛鐫嶇粈铏圭波閺嬫粌宕遍妴?  - 缂佹挻鐏夐崡鈥虫祼鐎规碍褰佹笟娑楄⒈娑擃亙绗呮稉鈧銉﹀瘻闁筋噯绱伴崶鐐插煂鐠侇厾绮岄妴浣稿箵婢跺秵顥呴妴?- **Boundary**:
  - 娑撳秳鎱ㄩ弨?`/api/analyze`閵?  - 娑撳秵鏌婃晶鐐差樆闁?API 鐠囬攱鐪伴妴?  - 娑撳秶鐗崸蹇曞箛閺堝鐦栭弬顓☆嚞濮瑰倹顐奸弫鎵閺夌喍绗岀純鎴犵捕鐎孤ゎ吀濞村鐦妴?
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

### 2026-02-23 - T-UPS-001 sellable retest/report copy + local upsell conversion
- **Do**:
  - Update `/retest/result` and `/report` to use short one-sentence verdict copy in Chen-teacher tone, with two explicit next steps: `鍐嶇粌涓€杞甡 and `鎶婂垎鏁扮ǔ浣廯.
  - Build `/upsell` as a static conversion page with Package A (楼199) and Package B (楼599), no payment and no external API.
  - Add local form page to collect parent contact info and selected package, then store to `localStorage` and show next-step instructions.
- **Do not**:
  - Do not modify `/api/analyze`.
  - Do not introduce any new external API calls.
  - Keep diagnosis network invariant and `diagnostic.spec.ts` passing.
- **Why**:
  - Close MVP2 monetization handoff with deterministic local flow and clear CTA copy that can be demoed immediately.

### 2026-02-23 - T-BIZ-002 Humanized commercial UI revamp
- **Do**:
  - Refactor `pricing` package copy to direct parent-facing language; add clear hot badge and stronger high-ticket value proposition.
  - Upgrade static retest interaction with instant result panel after option selection, one-line comment, and explicit deep-diagnosis hook.
  - Rebuild recommendation modal into three short lines + highly visible primary CTA.
- **Do not**:
  - Do not modify `/api/analyze`.
  - Do not introduce external API calls.
  - Keep diagnosis one-click one-request stability.
- **Why**:
  - Increase conversion clarity and reduce cognitive load so parents can understand value and next action immediately.
