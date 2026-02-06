# 几何觉醒 - 违章整改实施方案 (REFORM_PLAN)

> **最高指令响应**：本计划严格遵循 `PROJECT_CONSTITUTION.md`，以“宪法入库、计划先行、闭环验收”为行动准则。
> **状态**：待执行
> **执行人**：Antigravity (施工队长)

## 1. 核心目标 (Objective)

将项目从目前的 **"UI 空壳"** 状态，升级为 **"双核驱动"** 的真正 AI 应用。
**绝对红线**：
1.  严禁出现年级选择。
2.  必须实现 Gemini (眼) + DeepSeek (脑) 的协同工作。
3.  必须闭环跑通。

---

## 2. Phase 1: 存量违章排查与验证 (Verification)

虽然代码库目前似乎已移除年级选择，但必须进行“暴力测试”以确没有任何残留。

*   [ ] **全库 grep 扫描**：搜索 `grade`、`Select`、`Grade` 等关键词，确保没有任何残留组件或逻辑。
*   [ ] **视觉验收**：`npm run dev` 后，确认首页只有标题 + 一个“立即上传”大按钮。没有任何下拉框或多余选项。
*   [ ] **样式审计**：确认 `globals.css` 中无深色边框定义，全站背景强制白色。

---

## 3. Phase 2: 灵魂注入 (AI Implementation)

这是本次改革的核心。我们将构建 **"Eyes-Brain-Voice"** 架构。

### 3.1 架构设计
```mermaid
graph LR
    User[用户上传图片] --> Frontend
    Frontend -->|POST /api/analyze| API
    API -->|1. Image| Gemini[Gemini 1.5 Flash]
    Gemini -->|2. Geometry Description| API
    API -->|3. Description + Prompt| DeepSeek[DeepSeek R1/V3]
    DeepSeek -->|4. Chen Laoshi Advice (JSON)| API
    API -->|JSON| Frontend
    Frontend -->|Render| ReportPage
```

### 3.2 具体施工步骤

#### Step 1: 基础设施建设
*   [ ] **依赖安装**：安装 Google Generative AI SDK。
    ```bash
    npm install @google/generative-ai
    ```
*   [ ] **环境变量配置**：
    *   `GEMINI_API_KEY`: 用于视觉识别。
    *   `DEEPSEEK_API_KEY`: 用于逻辑推理。
    *   `DEEPSEEK_BASE_URL`: 适配 DeepSeek V3 接入点。

#### Step 2: "眼睛" (Vision Layer)
*   [ ] **新建 `lib/gemini.ts`**：
    *   封装调用 Gemini 1.5 Flash 的函数。
    *   Prompt 重点：“请详细描述这个几何图形，包括：图形类型（三角形/圆/四边形）、标注字母、已知条件（如垂直符号、相等符号）、文字描述的条件。不要解题，只描述事实。”

#### Step 3: "大脑" (Logic Layer)
*   [ ] **重写 `app/api/analyze/route.ts`**：
    *   **移除** 目前的 Mock 逻辑。
    *   **串联**：先 await `callGemini(image)`，拿到 `description`。
    *   **推理**：将 `description` + System Prompt (陈老师人设) 发送给 DeepSeek。
    *   **输出**：强制 DeepSeek 返回 JSON 格式（StuckPoint, RootCause, CoachAdvice, Plan）。

#### Step 4: 交互闭环补全
*   [ ] **新建/改造 `app/processing/page.tsx`**：
    *   此前只做了 UI 轮播，现在必须**真实调用 API**。
    *   **新增交互**（根据宪法）：在 API 调用前或过程中，弹窗/输入框询问：“孩子觉得难在哪？”（这一步将作为 Prompt 的一部分传给 DeepSeek）。
    *   状态管理：Handling -> Analyzed -> Redirect to Report with Data.

#### Step 5: 报告页数据对接
*   [ ] **改造 `app/report/page.tsx`**：
    *   从 `useSearchParams` 或 `localStorage` (临时) 或 状态管理库 读取 API 返回的真实诊断结果。
    *   替换掉写死的“辅助线画多了”等 Mock 文案。

---

## 4. 闭环验收标准 (Acceptance Criteria)

执行 `npm run dev` 后，必须通过以下测试：

1.  **首页**：
    *   白底、无年级、大按钮。
2.  **流程**：
    *   点击上传 -> (新增) 输入“难点” -> 处理页(真实等待) -> 报告页。
3.  **结果**：
    *   报告页显示的陈老师建议必须是 **针对刚才上传的那张图** 的，而不是写死的 Mock 数据。
    *   例如：上传一个圆的题，陈老师不能说“三角形中位线”。
4.  **无报错**：
    *   控制台无 API 500 错误。

---

## 5. 即刻行动 (Next Actions)

1.  安装依赖。
2.  创建 `lib/gemini.ts`。
3.  重写 `app/api/analyze/route.ts`。
