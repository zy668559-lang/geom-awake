# OPS BETA Kit (No DB / No Payment)

## 1) Order Collection via `/confirm` Screenshot
1. Ask parent to choose package from `/upsell` and open `/confirm?pkg=A|B&cause=...`.
2. Parent sends screenshot of `/confirm` page (must include package + amount + cause line).
3. Ops manually records the order in a spreadsheet using the template below.

Suggested sheet columns:
- `order_time`
- `parent_name`
- `contact`
- `pkg` (`A` or `B`)
- `cause` (`draw_line` / `condition_relation` / `proof_writing`)
- `grade`
- `region`
- `current_score`
- `status` (`new` / `in_delivery` / `done`)

## 2) Tagging Rules (pkg/cause)
- `pkg`:
  - `A` = AI纠偏版（￥199）
  - `B` = 名师直通版（￥599）
- `cause`:
  - `draw_line` = 画线想不到
  - `condition_relation` = 条件关系乱
  - `proof_writing` = 证明写不出

Order ID format (manual):
- `BETA-YYYYMMDD-序号-pkg-cause`
- Example: `BETA-20260224-007-B-draw_line`

## 3) Manual Delivery SOP
### Package A (￥199)
1. Within 24h, send:
   - 稳分卷 1 套（PDF）
   - 提分卷 1 套（PDF）
2. Send static retest link and ask parent to complete one round.
3. Reply with one-sentence result note and mark status `done`.

### Package B (￥599)
1. Within 24h, send week-1 plan and confirm schedule.
2. Run 4-week loop manually:
   - 每周复检 6 题
   - 每周周报 1 份
3. Deliver 2 custom paper sets + 1 voice fallback slot and mark status by week.

## 4) Three Metrics to Log (minimum)
1. `daily_confirm_count`: number of `/confirm` screenshots received per day.
2. `confirm_to_paid_intent_rate`: `B package confirmations / all confirmations`.
3. `delivery_24h_on_time_rate`: delivered within 24h / all new orders.

## 5) Ops Verification URLs
- Upsell entry: `${STAGING_URL}/upsell?cause=draw_line`
- Confirm A: `${STAGING_URL}/confirm?pkg=A&cause=draw_line`
- Confirm B: `${STAGING_URL}/confirm?pkg=B&cause=condition_relation`
