# MVP2 Walkthrough (3 steps)

1. 安装并启动
   - `npm install`
   - `npm run dev`
   - 打开 `http://localhost:3000`
2. 手动走通壳子流程
   - 首页上传任意图片进入 `/processing`，点击一次诊断。
   - 到 `/report` 点“输入激活码，解锁 7 天修复”，在 `/unlock` 输入 `123456`。
   - 进入 `/repair` -> `Day 1` -> `/repair/submit` 提交 -> `/repair/submit/result` -> `/retest` -> `/upsell`。
3. 自动化网络审计
   - `npx playwright test tests/diagnostic.spec.ts --project=chromium`
   - 预期：PASS，日志中 `/api/analyze call count after click: 1`，状态 `200`。

