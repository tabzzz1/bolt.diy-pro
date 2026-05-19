# bolt.diy-pro

[English](./README_EN.md) · [旧版 README](./README_OLD.md)

> 基于 [bolt.diy](https://github.com/stackblitz-labs/bolt.diy) fork / 二次开发的 AI 全栈开发工作台。

## 项目简介

`bolt.diy-pro` 保留了 `bolt.diy` 的核心体验：在浏览器中通过 AI 对话生成、修改、运行和预览 Node.js Web 项目，并在此基础上整理了更适合当前项目维护的文档、开发流程和工程说明。

如果你需要查看更完整的上游安装说明、历史功能介绍和社区信息，请参考 [README_OLD.md](./README_OLD.md)。

## 核心能力

| 能力 | 说明 |
| --- | --- |
| 多模型接入 | 支持 OpenAI、Anthropic、Google、Groq、DeepSeek、OpenRouter、Ollama、LM Studio、Amazon Bedrock、GitHub Models 等 |
| AI 开发闭环 | 聊天生成、文件编辑、终端执行、实时预览、Diff 查看 |
| 项目管理 | 支持项目导入、ZIP 导出、快照恢复、聊天与设置导入导出 |
| 部署集成 | 支持 Vercel、Netlify 等部署流程 |
| 代码平台 | 支持 GitHub、GitLab 相关操作 |
| 数据服务 | 支持 Supabase 连接、变量读取和数据库查询等能力 |
| 扩展能力 | 支持 MCP 工具接入 |
| 本地应用 | 支持 Electron 桌面端与 Docker 运行 |

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 前端 | React 18, Remix 2, Vite 5, UnoCSS |
| 语言 | TypeScript |
| AI | Vercel AI SDK, MCP SDK |
| 运行时 | WebContainer, Cloudflare Pages Functions, Electron |
| 工具链 | pnpm, Vitest, ESLint, Prettier, Docker |

更多说明见 [TECH_STACK.md](./TECH_STACK.md) 和 [ARCHITECTURE.md](./ARCHITECTURE.md)。

## 快速开始

建议使用 Node.js 22 和 pnpm。

```bash
pnpm install
cp .env.example .env
cp .env.example .env.local
pnpm run dev
```

按需在 `.env` 或 `.env.local` 中填写模型 Provider、部署平台、Supabase 等服务的 API Key。不要提交真实密钥。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `pnpm run dev` | 启动本地开发服务 |
| `pnpm run build` | 构建 Web 应用 |
| `pnpm run start` | 使用 Wrangler 运行构建产物 |
| `pnpm run preview` | 构建并预览 |
| `pnpm run typecheck` | TypeScript 检查 |
| `pnpm run lint` | ESLint 检查 |
| `pnpm run test` | 运行 Vitest 测试 |

## Docker

```bash
# 开发模式
pnpm run dockerbuild
docker compose --profile development up

# 生产模式
pnpm run dockerbuild:prod
docker compose --profile production up
```

## Electron

```bash
# 开发运行
pnpm electron:dev

# 构建全部桌面端安装包
pnpm electron:build:dist

# 按平台构建
pnpm electron:build:mac
pnpm electron:build:win
pnpm electron:build:linux
```

## 项目文档

| 文档 | 内容 |
| --- | --- |
| [README_EN.md](./README_EN.md) | English README |
| [DESIGN.md](./DESIGN.md) | 产品定位与体验原则 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 系统架构与模块分层 |
| [TECH_STACK.md](./TECH_STACK.md) | 技术栈与依赖说明 |
| [LLM_INTEGRATION.md](./LLM_INTEGRATION.md) | 模型、Prompt、上下文和 MCP 集成 |
| [AI_COLLABORATION.md](./AI_COLLABORATION.md) | AI 协作开发规范 |
| [DATA_GOVERNANCE.md](./DATA_GOVERNANCE.md) | 数据与密钥处理规则 |
| [OPERATIONS.md](./OPERATIONS.md) | 运行、构建、部署和排障手册 |
| [DOCUMENTATION.md](./DOCUMENTATION.md) | 文档地图 |
| [README_OLD.md](./README_OLD.md) | 旧版完整 README |

## 与上游项目的关系

本项目 fork / 基于 [stackblitz-labs/bolt.diy](https://github.com/stackblitz-labs/bolt.diy) 二次开发。

上游资料：

- [bolt.diy GitHub](https://github.com/stackblitz-labs/bolt.diy)
- [bolt.diy Docs](https://stackblitz-labs.github.io/bolt.diy/)
- [bolt.diy Community](https://thinktank.ottomator.ai)

## License

本项目继承上游项目的 MIT License。使用 WebContainer API 时，请同时注意其生产环境商业使用许可要求。
