# Codebase Structure

**Analysis Date:** 2026-04-01

## Directory Layout

```text
bolt.diy-pro/
├── app/                    # Remix 应用主目录（页面、API 路由、业务逻辑）
├── electron/               # Electron 主进程与预加载脚本
├── functions/              # Cloudflare Pages Functions 入口
├── public/                 # 静态资源
├── build/                  # 构建产物（运行与打包使用）
├── scripts/                # 构建/开发辅助脚本
├── docs/                   # 文档站/文档资源
├── types/                  # 全局类型声明补充
├── vite.config.ts          # Web 端构建与开发配置
├── vite-electron.config.ts # Electron renderer 构建配置
├── tsconfig.json           # TS 编译与路径别名配置
└── package.json            # 脚本与依赖声明
```

## Directory Purposes

**app/**
- Purpose: 核心业务代码边界。
- Contains: `routes`、`components`、`lib`、`types`、`utils`、`styles`。
- Key files: `app/root.tsx`, `app/entry.client.tsx`, `app/entry.server.tsx`, `app/routes/api.chat.ts`。

**app/routes/**
- Purpose: 页面路由与 API 路由边界（Remix 约定目录）。
- Contains: 页面文件（如 `_index.tsx`）与后端动作/加载器（`api.*.ts`）。
- Key files: `app/routes/_index.tsx`, `app/routes/api.chat.ts`, `app/routes/api.llmcall.ts`, `app/routes/api.models.ts`。

**app/lib/**
- Purpose: 脱离路由层的共享业务逻辑。
- Contains: `/.server/llm`（服务端 LLM 编排）、`runtime`（artifact/action 解析执行）、`stores`（nanostores 状态）、`services`（外部集成）、`webcontainer`（容器运行时）。
- Key files: `app/lib/.server/llm/stream-text.ts`, `app/lib/runtime/action-runner.ts`, `app/lib/runtime/message-parser.ts`, `app/lib/stores/workbench.ts`, `app/lib/modules/llm/manager.ts`。

**electron/**
- Purpose: 桌面端宿主层。
- Contains: `main`（主进程启动、协议桥接、窗口与菜单）、`preload`（上下文桥接）。
- Key files: `electron/main/index.ts`, `electron/main/ui/window.ts`, `electron/preload/index.ts`。

**functions/**
- Purpose: Cloudflare Pages Function 入口适配。
- Contains: catch-all 请求处理。
- Key files: `functions/[[path]].ts`。

**public/**
- Purpose: 浏览器可直接访问的静态资源。
- Contains: 图标、静态脚本等。
- Key files: `public/icons/**`, `public/inspector-script.js`（由 `webcontainer` 运行时加载）。

## Key File Locations

**Entry Points:**
- `app/entry.client.tsx`: 浏览器 hydration 入口；调用 `hydrateRoot` 与 `initAuth`（证据：`app/entry.client.tsx:7`, `app/entry.client.tsx:11`）。
- `app/entry.server.tsx`: SSR 入口；`renderToReadableStream` 输出 HTML（证据：`app/entry.server.tsx:18`）。
- `functions/[[path]].ts`: Cloudflare Pages 入口；`onRequest` 调 `createPagesFunctionHandler`（证据：`functions/[[path]].ts:4`, `functions/[[path]].ts:7`）。
- `electron/main/index.ts`: Electron 主入口；注册 `protocol.handle('http')` 并交给 Remix handler（证据：`electron/main/index.ts:80`, `electron/main/index.ts:119`）。

**Configuration:**
- `package.json`: 运行、构建、测试与 Electron 打包脚本。
- `tsconfig.json`: `~/* -> ./app/*` 路径别名（证据：`tsconfig.json:25`）。
- `vite.config.ts`: Remix + Cloudflare dev proxy + UnoCSS + polyfills。
- `vite-electron.config.ts`: Electron 渲染进程构建配置。

**Core Logic:**
- `app/routes/api.chat.ts`: 聊天主编排（MCP、上下文优化、流式输出）。
- `app/lib/.server/llm/stream-text.ts`: LLM 调用核心。
- `app/lib/modules/llm/manager.ts`: provider 注册与模型目录管理。
- `app/lib/runtime/action-runner.ts`: 动作执行引擎。
- `app/lib/stores/workbench.ts`: IDE-like 工作台组合根。

**Testing:**
- `app/lib/runtime/message-parser.spec.ts`: 解析器单元测试样例。
- `playwright.config.preview.ts`: 预览相关 E2E/集成测试配置。

## Naming Conventions

**Files:**
- 路由 API: `api.<domain>.ts`，示例：`app/routes/api.chat.ts`, `app/routes/api.system.diagnostics.ts`。
- 客户端专用组件: `*.client.tsx`，示例：`app/components/chat/Chat.client.tsx`。
- server-only 逻辑放入 `.server` 子目录，示例：`app/lib/.server/llm/stream-text.ts`。
- store 文件以领域命名，示例：`app/lib/stores/workbench.ts`, `app/lib/stores/chat.ts`。

**Directories:**
- 按职责分层：`components/`（视图）、`routes/`（边界）、`lib/`（能力）、`utils/`（通用工具）。
- 领域聚合：`app/lib/modules/llm/providers/*` 按 provider 切分。

## Where to Add New Code

**New Feature:**
- Primary code: 页面/UI 放到 `app/components/<feature>/`，服务编排放到 `app/lib/services/` 或 `app/lib/modules/`。
- Route/API boundary: 新接口优先放 `app/routes/api.<feature>.ts`。
- Tests: 与实现同目录增加 `*.spec.ts`/`*.test.ts`，优先参考 `app/lib/runtime/message-parser.spec.ts`。

**New Component/Module:**
- Implementation: 可复用 UI 组件放 `app/components/ui/`，业务组件放 `app/components/<domain>/`。
- Server LLM 能力扩展: 放 `app/lib/.server/llm/`。
- 新模型 provider: 放 `app/lib/modules/llm/providers/`，并在 `app/lib/modules/llm/registry.ts` 导出。

**Utilities:**
- Shared helpers: 放 `app/utils/`（跨层通用）或 `app/lib/utils/`（lib 内部通用）。

## Special Directories

**app/lib/.server/**
- Purpose: SSR/API 执行时的 server-only 逻辑。
- Generated: No
- Committed: Yes

**build/**
- Purpose: 构建产物（含 client/server/electron）。
- Generated: Yes
- Committed: Yes（当前仓库状态中存在并被使用于 Electron/运行流程）

**functions/**
- Purpose: Cloudflare Pages 运行时桥接。
- Generated: No
- Committed: Yes

**electron/**
- Purpose: 桌面壳层（主进程/预加载）。
- Generated: No
- Committed: Yes

**.planning/codebase/**
- Purpose: 代码库映射文档输出目录。
- Generated: Yes（由映射流程生成）
- Committed: Yes（用于后续规划与执行阶段读取）

---

*Structure analysis: 2026-04-01*
