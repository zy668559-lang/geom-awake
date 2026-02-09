# MVP2 Tasks

## M1: 报告页入口 + 最小解锁门
- **目标**: 引导体检完成的用户进入 7 天修复。
- **改动点**:
  - `app/report/page.tsx`: 增加【开始7天修复】按钮。
  - `app/unlock/page.tsx`: 实现验证码/激活码输入页。
  - `app/repair/page.tsx`: 实现重定向或壳子页。
- **影响文件**: `app/report/page.tsx`, `app/unlock/page.tsx`, `app/repair/page.tsx`.
- **验收标准 (DoD)**: 点【开始修复】跳转 /unlock；输入正确码后跳转 /repair；状态记录在 localStorage。

## M2: /repair 训练计划 Day1-7 壳子
- **目标**: 让用户看到 7 天的完整路线图。
- **改动点**:
  - `app/repair/page.tsx`: 展示 Day1-7 卡片列表。
  - `app/repair/day/[id]/page.tsx`: 展示具体某一天的口令、题目和复盘入口。
- **影响文件**: `app/repair/page.tsx`, `app/repair/day/[id]/page.tsx`.
- **验收标准 (DoD)**: 7 天卡片正确渲染；点击具体天数能进入对应详情页；页面结构固定。

## M3: /repair/submit 提交判定页
- **目标**: 模拟交付与即时反馈。
- **改动点**:
  - `app/repair/submit/page.tsx`: 上传组件 + 选项卡点。
  - `api/repair/submit/route.ts`: 实现判定逻辑（关键步骤/下一步）。
  - 实现防连点锁、幂等等待、429 退避逻辑。
- **影响文件**: `app/repair/submit/page.tsx`, `app/api/repair/submit/route.ts`.
- **验收标准 (DoD)**: 点击提交，Network 仅 1 条请求；后端 429 时触发 console log 指数退避；重复点击不产生新请求。

## M4: /retest 复检对比页
- **目标**: 证明修复效果，引导续费。
- **改动点**:
  - `app/retest/page.tsx`: 渲染前后对比卡片。
  - `app/upsell/page.tsx`: 占位页（继续定制/升级陪跑）。
- **影响文件**: `app/retest/page.tsx`, `app/upsell/page.tsx`.
- **验收标准 (DoD)**: 对比数据展示正常；两个转化按钮跳转至占位页。
