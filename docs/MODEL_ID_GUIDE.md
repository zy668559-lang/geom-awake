# 模型ID配置与获取指南

## 1. 概述
本系统采用数据驱动架构，所有训练题目均关联特定的几何模型ID（Model ID）。前端页面（如训练页）依赖正确的Model ID来加载对应的题目数据。

## 2. 合法模型ID列表
当前版本（V1.0）支持以下三个核心模型ID：
- **`M1_MIDPOINT`**：中点模型（对应7/8/9年级中点相关题目）
- **`M2_ANGLE`**：角度模型（对应平行线、角度计算相关题目）
- **`M3_SIMILAR`**：相似模型（对应相似三角形判定与性质相关题目）

> 注意：`M4_CONGRUENCE` 等其他ID尚未在 `data/models.json` 中定义，请勿使用。

## 3. 模型ID传递流程
1. **诊断生成**：
   - 后端 API (`/api/diagnose` 或 `/api/clinic`) 根据用户错题，计算推荐的训练模型。
   - **安全机制**：API 内置白名单校验，强制将 AI 生成的无效 ID（如 `M1_LINE`）修正为合法 ID（如 `M2_ANGLE`）。

2. **报告展示**：
   - 诊断报告页 (`/report/[id]`) 接收 API 返回的 `nextTraining` 字段。
   - “开始专项修复训练”按钮通过 URL 参数传递 ID：`/train?model=M2_ANGLE`。

3. **训练页加载**：
   - 训练页 (`/train`) 读取 URL 中的 `model` 参数。
   - 调用 `lib/data-loader.ts` 中的 `getQuestionsByModel(modelId)` 获取题目。

## 4. 故障排查
若出现“未找到对应的训练题目”错误：
1. **检查 URL**：确认地址栏 `model` 参数是否在上述合法列表中。
2. **检查 `models.json`**：确认该模型ID下是否有 `type: "TRAIN"` 的题目。
3. **查看日志**：训练页会在控制台输出具体的错误信息。
