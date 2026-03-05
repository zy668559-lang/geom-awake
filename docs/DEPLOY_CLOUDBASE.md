# CloudBase Run 部署指南（中国可访问）

## 1) CloudBase 控制台配置（逐步点击）
1. 腾讯云控制台 -> CloudBase -> 进入目标环境。
2. 打开 `云托管 CloudBase Run` -> `新建服务` -> 选择 `从代码仓库部署（GitHub）`。
3. 选择仓库与分支：`geometry-mvp` / `main`。
4. 构建配置：
   - 安装命令：`npm ci`
   - 构建命令：`npm run build`
   - 启动命令：`npm run start`
   - Node 版本：`20`（建议）
5. 端口配置（必须）：
   - 容器监听端口：`3000`
   - 公网访问端口：`80`
6. 环境变量配置（服务设置 -> 环境变量）：
   - 必填：`GEMINI_API_KEY`
   - 可选：`ANALYZE_CACHE_TTL_MS`
   - 本项目不需要新增外部服务变量。
7. 点击部署，等待状态为 `运行中`。

## 2) 项目脚本（来自 package.json）
- 本地开发：`npm run dev`（等价 `next dev -p 3000`）
- 生产构建：`npm run build`（`next build`）
- 生产启动：`npm run start`（`next start`）

## 3) 上传与体积策略（本次上线重点）
- 前端上传前压缩：
  - 最长边 `<= 1600px`
  - 转 JPEG，质量约 `0.75`
  - 目标 `<= 900KB`，硬上限 `1MB`
- 若压缩后仍超限，前端提示：
  - `图片过大，请重试/换一张更清晰但更小的照片`

## 4) 安全检查清单（SECURITY）
- `.env.local` 必须被忽略，不得提交。
- API Key 只放在 CloudBase 环境变量，不写入仓库。
- 提交前执行：
  - `git ls-files | rg "^(\\.env|.*\\/\\.env)"`
  - `git status`

## 5) 三步验收（必须全通过）
1. `processing -> report`：
   - 打开 `${BASE_URL}/processing`
   - 上传真实照片（<1MB），选择卡点后点击 `确定`
   - 期望进入 `/report`，且文案不是 demo 固定文案。
2. `upsell -> confirm`：
   - 打开 `${BASE_URL}/upsell?cause=draw_line`
   - 点击 A 或 B，跳转到 `/confirm?pkg=A|B&cause=draw_line`
3. Playwright 网络审计：
   - 执行 `npx playwright test tests/diagnostic.spec.ts --project=chromium`
   - 必须 PASS，且保持 `1 click = 1 request`。
