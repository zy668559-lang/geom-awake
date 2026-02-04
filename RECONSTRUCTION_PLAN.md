# 几何觉醒 - 大破大立重构方案

> **施工队长工作令** | 日期：2026-02-04  
> **状态：** ✅ 已批准，立即开工！

---

## 🏛️ 产品宪法（最终版）

### 三大原则

#### 1️⃣ 去中心化
- ❌ **删掉年级选择**，首页只留一个大按钮
- ✅ 用户无需配置，直接拍照即可

#### 2️⃣ 极简主义
- 🍎 **参考 iPad 交互**，页面要干净
- 🎨 大圆角、呼吸感、留白至上

#### 3️⃣ 人设第一
- 👨‍🏫 **AI 说话必须像'陈老师'本人**
- 💬 直白接地气，不要术语堆砌

---

## 🛠️ 施工路径（必须按顺序执行）

### 第一步：清理旧代码 🗑️
**目标：** 删除 GradeSelector 和相关的冗余 API 参数

**具体任务：**
- [ ] 删除所有年级选择相关 UI 组件
- [ ] 清理 API 中的 `grade` 参数传递
- [ ] 删除 `/diagnose` 旧体检页面
- [ ] 移除 `components/DiagnosticHub.tsx`
- [ ] 移除 `components/RetestEngine.tsx`

---

### 第二步：搭建页面骨架 🏗️
**目标：** 搭建 `/` 和 `/report` 的壳子，确保跳转不崩

**具体任务：**
- [ ] 重构首页 `/` - 极简大按钮
- [ ] 重构 `/upload` 页面 - 一键上传
- [ ] 创建 `/processing` 加载页
- [ ] 搭建 `/report/[id]` 报告页框架
- [ ] 验证完整跳转链路：首页 → 上传 → 处理中 → 报告

---

### 第三步：AI 集成 🤖
**目标：** 接入 DeepSeek，注入'陈老师口语化分析'的 Prompt

**具体任务：**
- [ ] 创建 `lib/deepseek.ts` - API 封装
- [ ] 创建 `lib/coachPrompt.ts` - 陈老师 Prompt 模板
- [ ] 创建 `app/api/analyze/route.ts` - 分析接口
- [ ] 创建 `components/CoachReport.tsx` - 口语化报告组件
- [ ] 测试 API 调用和返回格式

---

### 第四步：Bug 修复 🐛
**目标：** 修复图片点击预览和专项练习跳转的 Bug

**具体任务：**
- [ ] 修复图片点击预览（Lightbox 效果）
- [ ] 修复专项练习页跳转逻辑
- [ ] 测试所有交互流程
- [ ] iPad 视觉效果验证

---

## 📋 核心逻辑重构

### 新流程设计（四步闭环）

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  首页       │      │  处理中     │      │  报告页     │      │  修复页     │
│  拍照/上传  │  →   │  AI 诊断    │  →   │  陈老师建议 │  →   │  专项练习   │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
  用户上传图片        DeepSeek 分析        口语化报告          针对性训练
```

### 废除功能
- ❌ **年级选择** - 彻底移除，不再让用户选年级
- ❌ **复杂的错题信息表单** - 简化上传流程
- ❌ **体检题/诊断模式切换** - 统一为一种诊断模式

### 简化原则
- ✅ 用户只需：**拍照 → 等待 → 看报告 → 做练习**
- ✅ 所有年级自动识别（通过 AI 分析图片内容）
- ✅ 一键上传，零配置

---

## 🎨 视觉规范（iPad 极简白风格）

### 设计关键词
```
大圆角 | 呼吸感 | 留白 | 柔和阴影 | 高级灰
```

### 具体规范

**颜色系统：**
```css
/* 主背景 */
--bg-primary: #FFFFFF;
--bg-secondary: #F8F9FA;

/* 卡片 */
--card-bg: #FFFFFF;
--card-border: rgba(0, 0, 0, 0.06);
--card-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);

/* 强调色（蓝紫渐变） */
--accent-gradient: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
--accent-light: #F0F4FF;

/* 文字 */
--text-primary: #1A1A1A;
--text-secondary: #6B7280;
--text-tertiary: #9CA3AF;
```

**圆角规范：**
```
- 主卡片：32px
- 按钮：24px
- 输入框：16px
- 图片/内容块：20px
```

**间距系统（呼吸感）：**
```
- 页面边距：24px
- 卡片内边距：32px
- 元素间距：16px, 24px, 32px（递增原则）
```

**动画（呼吸感）：**
```css
/* 悬停上浮 */
.hover-lift {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.hover-lift:hover {
  transform: translateY(-4px);
}

/* 呼吸光晕 */
@keyframes breathing {
  0%, 100% { box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15); }
  50% { box-shadow: 0 12px 48px rgba(102, 126, 234, 0.25); }
}
```

---

## 🔄 数据流转（DeepSeek API 集成）

### API 调用流程

```
用户上传图片
    ↓
前端转 Base64
    ↓
POST /api/analyze
    ↓
调用 DeepSeek API
    ┃
    ┣━ 携带【陈老师人设 Prompt】
    ┣━ 传入图片 Base64
    ┗━ 要求返回结构化 JSON
    ↓
解析返回结果
    ↓
存储到 Session
    ↓
跳转到 /report/[sessionId]
```

### 陈老师人设 Prompt（必须嵌入）

```
你是陈老师，一位有20年经验的初中几何教练。你的风格是：

1. **口语化**：用"咱们""你看"这种亲切表达，不用术语堆砌
2. **找规律**：不是讲题，而是帮学生发现"这类题都卡在哪"
3. **给方法**：每个建议都配具体的3天练习计划
4. **鼓励型**：强调"不是笨，是缺练习"

分析这张错题图片，给出：
- 卡点诊断（一句话说清楚）
- 为什么会卡（找本质原因）
- 怎么修复（3天计划，每天1个小练习）

返回 JSON 格式：
{
  "stuckPoint": "看不出隐藏的平行线",
  "rootCause": "平行线判定5个定理没形成条件反射",
  "coachAdvice": "咱们这样，今晚睡前...",
  "threeDay Plan": [...]
}
```

### API 配置要求

**环境变量（`.env.local`）：**
```env
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxx
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
```

**请求参数：**
```javascript
{
  model: "deepseek-chat",
  messages: [
    { role: "system", content: "【陈老师人设 Prompt】" },
    { 
      role: "user", 
      content: [
        { type: "text", text: "请分析这道错题" },
        { type: "image_url", image_url: { url: "data:image/jpeg;base64,..." } }
      ]
    }
  ],
  temperature: 0.7,
  max_tokens: 2000
}
```

---

## 🗑️ 任务 2：删除清单（旧组件）

### 需要删除的文件/组件

#### 页面级（app/）
- ❌ `app/diagnose/page.tsx` - 旧的"体检模式"，完全废除
- ❌ `app/review/page.tsx` - 如果存在旧的复习页

#### 组件级（components/）
- ❌ `components/DiagnosticHub.tsx` - 旧的诊断组件
- ❌ `components/RetestEngine.tsx` - 旧的复测引擎

### 需要重构的文件

#### 保留但需大改
- 🔄 `app/page.tsx` - 首页保留，简化为只有"拍照诊断"按钮
- 🔄 `app/clinic/page.tsx` - 改名为 `app/upload/page.tsx`，极简上传页
- 🔄 `app/report/[id]/page.tsx` - 报告页，调整为"陈老师口吻"
- 🔄 `app/train/page.tsx` - 专项练习页，保留训练功能

#### CSS 全局样式
- 🔄 `app/globals.css` - 按新视觉规范重写

---

## 📝 新建核心文件清单

### API 层（app/api/）
```
app/api/
├── analyze/
│   └── route.ts          【新建】DeepSeek 图片分析接口
├── report/
│   └── [id]/route.ts     【新建】获取报告数据
└── practice/
    └── route.ts          【新建】获取专项练习题
```

### 新组件（components/）
```
components/
├── UploadCard.tsx        【新建】极简上传卡片
├── CoachReport.tsx       【新建】陈老师口语化报告组件
├── PracticeCard.tsx      【新建】练习题卡片（极简风格）
└── BreathingButton.tsx   【新建】呼吸动画按钮（可复用）
```

### 工具函数（lib/）
```
lib/
├── deepseek.ts           【新建】DeepSeek API 封装
├── imageUtils.ts         【新建】图片压缩/Base64 转换
└── coachPrompt.ts        【新建】陈老师 Prompt 模板
```

### 数据存储（暂用内存，后续可迁移数据库）
```
lib/
└── sessionStore.ts       【新建】Session 数据临时存储（Map）
```

---

## 🎯 重构后的目录结构

```
geometry-mvp/
├── app/
│   ├── page.tsx                  【改】极简首页
│   ├── upload/
│   │   └── page.tsx              【新】一键上传页（原 clinic）
│   ├── processing/
│   │   └── page.tsx              【新】AI 分析中页面
│   ├── report/
│   │   └── [id]/page.tsx         【改】陈老师口语化报告
│   ├── practice/
│   │   └── page.tsx              【改】专项练习（简化版）
│   └── api/
│       ├── analyze/route.ts      【新】DeepSeek 分析
│       ├── report/[id]/route.ts  【新】报告数据
│       └── practice/route.ts     【新】练习题
│
├── components/
│   ├── UploadCard.tsx            【新】
│   ├── CoachReport.tsx           【新】
│   ├── PracticeCard.tsx          【新】
│   ├── BreathingButton.tsx       【新】
│   └── ...（保留有用的旧组件）
│
├── lib/
│   ├── deepseek.ts               【新】
│   ├── imageUtils.ts             【新】
│   ├── coachPrompt.ts            【新】
│   └── sessionStore.ts           【新】
│
└── app/globals.css               【改】iPad 极简风格
```

---

## ⚠️ 关键风险提示

### 需要老板确认的问题

1. **API 成本**  
   每次图片分析调用 DeepSeek API，是否有预算限制？

2. **年级识别准确性**  
   完全移除年级选择后，如果 AI 识别错误年级怎么办？需要设置"重新分析"按钮吗？

3. **数据持久化**  
   当前方案用内存存储 Session，服务重启会丢失。是否需要迁移到数据库？

4. **图片隐私**  
   用户上传的错题图片是否需要存储？存储在哪？保留多久？

---

## 🚀 施工计划（3 个阶段）

### Phase 1：拆除（1 天）
- [ ] 删除旧组件（见删除清单）
- [ ] 备份现有代码到 `backup/` 分支

### Phase 2：重建（2-3 天）
- [ ] 新建 DeepSeek API 接口
- [ ] 重构首页 + 上传页
- [ ] 开发陈老师报告组件
- [ ] 调整练习页样式

### Phase 3：验证（1 天）
- [ ] 完整流程测试
- [ ] 视觉还原度检查
- [ ] API 调用成本评估

---

## 📌 等待老板批示

**队长已准备就绪，请老板确认：**

1. ✅ 重构方向是否正确？
2. ✅ 删除清单是否同意？
3. ✅ 新建文件规划是否合理？
4. ✅ 需要先回答上述"风险提示"中的问题吗？

**收到批准后，立即开工！** 🔨🔥
