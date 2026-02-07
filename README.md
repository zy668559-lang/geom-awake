# Geometry Awakening MVP

极简几何思维“体检中心” —— 帮助孩子少走冤枉路。

## 项目简介
本项目通过 Google Gemini Vision 识别几何图形，联合 DeepSeek 进行“陈老师”风格的互动式诊断，为学生提供针对性的成长建议。

## 快速启动
1. **配置环境**:
   创建 `.env.local` 并填写：
   ```env
   GEMINI_API_KEY=xxx
   DEEPSEEK_API_KEY=xxx
   MOCK_MODE=false
   ```
2. **启动服务**:
   ```bash
   npm run dev
   ```
   访问: `http://localhost:3000`

## 常见故障 (TS)
- **429 Rate Limit**: 后端已内置请求队列与指数退避，如有发生请稍候。
- **端口冲突**: 项目固定使用 3000 端口，请确保无其他占位进程。
- **图片无法识别**: 系统会自动压缩图片，若仍失败请尝试光线充足的近景拍照。

## 仓库结构
- `docs/TODO.md`: 需求与路线图。
- `docs/ARCH.md`: 系统架构说明。
- `docs/CHANGELOG.md`: 开发记录。
- `docs/ACCEPTANCE.md`: 验收标准。
