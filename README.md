# AIPPT

> A self-hostable AI presentation generator with editable slides, template-driven layouts, AI image workflows, and PPTX/PDF export.
>
> AIPPT 是一款可私有化部署的 AI 演示文稿生成与编辑平台，支持从主题、文档、大纲和模板生成可编辑 PPT，并提供在线编辑、AI 图片替换、模板库、PPTX/PDF 导出和 Docker 部署能力。

<p align="center">
  <img src="readme_assets/images/screenshot-dashboard.png" alt="AIPPT 工作台" width="100%" />
</p>

<p align="center">
  <a href="#项目定位">项目定位</a> ·
  <a href="#核心能力">核心能力</a> ·
  <a href="#产品截图">产品截图</a> ·
  <a href="#技术架构">技术架构</a> ·
  <a href="#快速开始">快速开始</a> ·
  <a href="#配置说明">配置说明</a> ·
  <a href="#本地开发">本地开发</a>
</p>

## 项目定位

AIPPT 是一个面向真实办公场景的 AI PPT 工作台。它不是只生成静态预览图的演示工具，而是围绕“生成、编辑、复用、导出、部署”完整链路设计的演示文稿生产系统。

用户可以从一个主题、文档或大纲开始，选择模板后生成 PPT，在浏览器中继续编辑文字、图片、形状、表格、图表等元素，并导出为 PPTX 或 PDF。项目适合企业汇报、项目材料、行业模板、培训课件、产品介绍、技术方案和私有化办公自动化场景。

本项目基于 [presenton/presenton](https://github.com/presenton/presenton/) 开源项目继续扩展，重点增强了中文办公体验、模板分类、用户权限、模型配置、Docker 部署、AI 图片编辑和部分模板的原生可编辑模型能力。

## 典型流程

```text
主题 / 文档 / 大纲
        |
        v
AI 生成大纲与页面规划
        |
        v
选择模板与版式
        |
        v
生成可编辑演示文稿
        |
        v
在线编辑文字、图片、形状、表格、图表
        |
        v
导出 PPTX / PDF
```

## 核心能力

### AI 生成演示文稿

- 支持根据主题、提示词、文档或大纲生成 PPT。
- 支持生成前编辑大纲，先确认内容结构再进入页面生成。
- 支持模板驱动生成，生成结果保留模板风格与版式约束。
- 支持生成过程状态展示和历史文稿管理。
- 支持对已生成文稿继续编辑和二次迭代。

### 原生可编辑幻灯片模型

AIPPT 针对“AI 生成后不能改、导出后元素不可编辑”的问题，引入可编辑的幻灯片元素模型。部分模板不再只作为整页背景图渲染，而是拆分为可选择、可拖拽、可缩放和可修改的结构化元素。

当前模型覆盖的常见元素包括：

- 文本框与文字样式；
- 图片与图片提示词；
- 形状、线条和装饰元素；
- 表格；
- 图表；
- 公式；
- 视频、音频等媒体占位。

这使生成后的 PPT 更接近真实办公文件：用户可以在网页中改，也可以导出后继续在 PowerPoint、WPS 或 Keynote 中加工。

### 模板库与行业模板

- 内置通用模板、现代商务、标准模板、快速模板、代码演示、教育课件、产品介绍、报告模板、路演文稿等模板。
- 支持模板分类展示，包括通用模板、报告模板、电厂专区和自定义模板。
- 支持模板预览，用户可先查看母版页面再开始生成。
- 支持自定义模板创建、保存和分类。
- 支持电厂专区等行业模板，适合工程建设、投产汇报、生产经营和专题汇报等场景。
- 部分内置模板已转换为原生可编辑模型，提高在线编辑和 PPTX 导出可用性。

### AI 图片编辑与替换

- 点击图片可打开图片编辑面板。
- 支持根据提示词生成替换图片。
- 支持上传本地图片替换。
- 支持复用历史生成图片。
- 支持配置 Pexels、Pixabay 等图库提供商。
- 支持 OpenAI-compatible 图片接口、Open WebUI、ComfyUI 等图片生成方式。

### PPTX/PDF 导出

- 支持导出 PPTX。
- 支持导出 PDF。
- Docker 镜像内置导出运行时和相关依赖。
- 对原生可编辑模板优先走原生 PPTX 导出路径。
- 对旧版复杂模板保留兼容导出路径，降低模板迁移风险。

### 多模型与私有化部署

文本模型支持多种提供商和兼容模式：

- OpenAI-compatible API
- DeepSeek
- Google Gemini
- Azure OpenAI
- Amazon Bedrock
- Anthropic
- Together AI
- Fireworks
- Cerebras
- OpenRouter
- Ollama
- LM Studio
- Custom LLM endpoint

图片生成、联网搜索和记忆能力也可按需配置。系统支持通过 Docker 在本地、内网或服务器中部署，适合对数据和模型访问有管控要求的团队。

### 用户、权限与数据

- 支持登录认证。
- 普通用户管理自己的文稿。
- 管理员可管理用户和全局模型配置。
- 运行数据、上传图片、导出文件和配置默认保存在 `app_data`。
- 可通过 `DATABASE_URL` 接入外部数据库；未配置时使用本地默认存储。

## 产品截图

以下截图均来自当前 Docker 运行中的 AIPPT 项目页面，不是生成图或设计稿。

### 工作台

![AIPPT 工作台](readme_assets/images/screenshot-dashboard.png)

### 模板库

![AIPPT 模板库](readme_assets/images/screenshot-template-library.png)

### 行业模板预览

![AIPPT 行业模板预览](readme_assets/images/screenshot-template-preview.png)

### 在线编辑器

![AIPPT 在线编辑器](readme_assets/images/screenshot-editor.png)

### AI 图片替换

![AIPPT AI 图片替换](readme_assets/images/screenshot-image-editor.png)

## 技术架构

```text
AIPPT
├── servers/nextjs         # Web 前端、模板库、在线编辑器、导出路由
├── servers/fastapi        # API 后端、生成服务、模型适配、配置管理
├── electron               # 桌面端打包与本地集成
├── scripts                # 运行时同步、配置初始化、辅助脚本
├── readme_assets          # README 截图与展示资源
├── app_data               # Docker 挂载的运行数据目录
├── Dockerfile             # 生产镜像构建配置
└── docker-compose.yml     # 生产、GPU、开发服务编排
```

### 前端

前端基于 Next.js、React、TypeScript、Tailwind CSS、Radix UI 和 Redux 构建，负责工作台、模板库、设置页、模板预览、演示文稿编辑器、图片编辑面板和导出入口。

### 后端

后端基于 FastAPI 和 Python 构建，负责生成任务、模型调用、文档处理、模板发现、用户配置、认证、记忆服务和业务数据接口。

### 导出链路

项目内置演示文稿导出运行时，结合 PPTX/PDF 导出能力，将生成后的文稿输出为办公软件可继续处理的文件。生产 Docker 镜像包含浏览器、字体、Office、图片处理和导出依赖。

### 上下文记忆

后端包含基于 Mem0 的演示文稿记忆服务，用于存储生成上下文、大纲草稿、页面编辑记录和检索上下文，辅助后续 AI 编辑与问答操作。

## 快速开始

### Docker Compose 启动

```bash
docker compose up -d --build production
```

启动后访问：

```text
http://localhost:5001
```

默认端口：

- Web 应用：`http://localhost:5001`
- OAuth 回调辅助端口：`1455`
- 运行数据目录：`./app_data`

### GPU 服务

```bash
docker compose up -d --build production-gpu
```

当本地模型或图片生成链路需要 GPU 时，可使用该服务。

### 停止服务

```bash
docker compose down
```

## 配置说明

多数生产配置可通过环境变量传入，也可以登录后在系统设置页维护。

### OpenAI 示例

```bash
LLM=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1
```

### DeepSeek 示例

```bash
LLM=deepseek
DEEPSEEK_API_KEY=...
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
```

### Ollama 示例

```bash
LLM=ollama
OLLAMA_URL=http://host.docker.internal:11434
OLLAMA_MODEL=llama3.1:latest
```

### OpenAI-Compatible 自定义接口

```bash
LLM=custom
CUSTOM_LLM_URL=http://localhost:11434/v1
CUSTOM_LLM_API_KEY=local-key
CUSTOM_MODEL=your-model-name
```

### 图片生成接口

```bash
IMAGE_PROVIDER=openai_compatible
OPENAI_COMPAT_IMAGE_BASE_URL=https://your-image-endpoint/v1
OPENAI_COMPAT_IMAGE_API_KEY=...
OPENAI_COMPAT_IMAGE_MODEL=...
```

### 登录认证

```bash
AUTH_USERNAME=admin
AUTH_PASSWORD=change-me
```

系统生成的用户配置和登录信息会保存在：

```text
app_data/userConfig.json
```

## 本地开发

### 前端开发

```bash
cd servers/nextjs
npm install
npm run dev
```

### 后端开发

```bash
cd servers/fastapi
uv sync
uv run python -m api.main
```

### Docker 开发服务

```bash
docker compose up -d --build development
```

## 测试与验证

前端测试：

```bash
cd servers/nextjs
node --test tests/*.test.mjs
```

Next.js 生产构建：

```bash
cd servers/nextjs
npm run build
```

后端测试：

```bash
cd servers/fastapi
uv run pytest
```

导出运行时检查：

```bash
npm run check:presentation-export
```

## 模板系统

模板目录：

```text
servers/nextjs/app/presentation-templates
```

当前仓库包含的模板组包括：

- `general`
- `modern`
- `standard`
- `swift`
- `Code`
- `Education`
- `ProductOverview`
- `Report`
- `pitch-deck`
- `neo-general`
- `neo-modern`
- `neo-standard`
- `neo-swift`
- `taicang-coal-power-report`

原生 PPT 模型相关逻辑位于：

```text
servers/nextjs/lib/pptx-model
```

这些模块负责模板能力识别、原生页面文档校验、内置模板转换和导出路径选择。

## 生产部署建议

- 挂载 `app_data`，避免用户数据、生成记录和配置随容器删除。
- 在团队使用前配置稳定的模型、图片和搜索服务。
- 对公网访问场景建议使用 HTTPS 反向代理。
- 定期备份 `app_data`。
- 分享截图或日志前检查是否包含 API Key、用户数据或内部资料。
- 保持 Docker 镜像依赖与导出运行时版本一致。

## 路线图

- 提升更多复杂模板的原生 PPTX 导出一致性。
- 扩展更多中文行业模板专区。
- 增强企业级权限、审计和团队协作能力。
- 完善图表、表格、公式和媒体元素编辑能力。
- 提升导入 PPT 模板转换为原生可编辑元素的能力。
- 增加生成、编辑、导出的端到端测试覆盖。

## 许可证

本项目遵循 [LICENSE](LICENSE) 文件声明的许可证。

## 致谢

AIPPT 基于 [presenton/presenton](https://github.com/presenton/presenton/) 项目继续开发。感谢相关开源项目、模型服务和工具链对自托管 AI 办公工作流的支持。
