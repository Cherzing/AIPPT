# AIPPT 中文版

AIPPT 是开源 AI 演示文稿生成器和 API，支持从提示词或文档生成可编辑的 PPTX/PDF，并可连接多种文本、图片和联网搜索提供商。

本目录是 `AIPPT` 项目的中文化副本，原始项目保留在同级 `AIPPT` 目录中。

## 主要能力

- 支持 Docker 自托管和 Electron 桌面应用。
- 支持 Ollama、LM Studio、OpenAI、Gemini、Vertex AI、Azure OpenAI、Amazon Bedrock、Fireworks、Together AI、Anthropic 以及 OpenAI 兼容接口。
- 支持自定义模板、主题、字体、图片、图标和图表。
- 支持从提示词、上传文档和自定义模板生成演示文稿。
- 支持导出可编辑 PPTX 和 PDF。
- 内置演示文稿生成 API 与 MCP 服务。

## 运行方式

### Docker

Linux/macOS:

```bash
docker run -it --name AIPPT -p 5001:80 -v "./app_data:/app_data" ghcr.io/AIPPT/AIPPT:latest
```

Windows PowerShell:

```powershell
docker run -it --name AIPPT -p 5001:80 -v "${PWD}\app_data:/app_data" ghcr.io/AIPPT/AIPPT:latest
```

启动后访问：

```text
http://localhost:5001
```

### Electron 桌面版

需要 Node.js、npm、Python 3.11 和 uv。

```bash
cd electron
npm run setup:env
npm run dev
```

构建安装包：

```bash
npm run build:all
npm run dist
```

## Web 前端开发

```bash
cd servers/nextjs
npm install
npm run dev
```

## 后端开发

```bash
cd servers/fastapi
uv sync
uv run python -m api.main
```

## 汉化范围

- Next.js 前端页面标题、按钮、表单、通知、占位符、仪表盘、设置、模板、主题、上传和生成流程。
- Electron 启动画面。
- 常见 FastAPI 错误和生成状态消息。
- README 项目说明。

品牌名、API 字段、模型名、路由、环境变量、包名和协议名称保持英文，避免影响运行兼容性。
