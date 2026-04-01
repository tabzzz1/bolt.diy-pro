# Architecture

**Analysis Date:** 2026-04-01

## Pattern Overview

**Overall:** Remix 路由驱动的同构 Web 应用 + Cloudflare Pages Functions 适配层 + Electron 桌面封装的多运行时架构。

**Key Characteristics:**
- 以 `app/routes/*.ts(x)` 作为 HTTP/页面边界，路由文件同时承载页面与 API 入口。
- 业务核心集中在 `app/lib/**`，其中 `.server/llm` 负责服务端 LLM 编排，`runtime` 负责流式动作解析与执行。
- 桌面端通过 `electron/main/index.ts` 复用 Remix server build，请求由 Electron 协议层转发到 Remix request handler。

## Layers

**Presentation/UI Layer:**
- Purpose: 渲染页面、收集用户输入、触发聊天与工作台交互。
- Location: `app/root.tsx`, `app/routes/_index.tsx`, `app/components/**`
- Contains: Remix Layout、页面组件、聊天组件、DnD/Toast 等 UI 容器。
- Depends on: `app/lib/stores/**`, `app/lib/hooks/**`, `app/routes/api.*`
- Used by: 浏览器客户端与 Electron 渲染进程。
- Evidence: `app/root.tsx:67`, `app/root.tsx:86`, `app/routes/_index.tsx:20`, `app/components/chat/Chat.client.tsx:134`

**Route/API Layer:**
- Purpose: 作为 BFF 层处理请求、校验输入、拼装流式响应。
- Location: `app/routes/api.chat.ts`, `app/routes/api.llmcall.ts`, `app/routes/api.models.ts`, 以及其它 `app/routes/api.*.ts`
- Contains: Remix `action/loader`、cookie 解析、上下文筛选、调用 LLM 管理器与服务。
- Depends on: `app/lib/.server/llm/**`, `app/lib/modules/**`, `app/lib/services/**`, `app/lib/api/**`
- Used by: 前端 `useChat` 与其它 API 消费方。
- Evidence: `app/routes/api.chat.ts:18`, `app/routes/api.chat.ts:42`, `app/routes/api.chat.ts:93`, `app/routes/api.llmcall.ts:13`, `app/routes/api.models.ts:43`

**Domain Service Layer:**
- Purpose: 聚合外部能力（模型、MCP、GitHub/GitLab/Supabase 等）并提供稳定接口。
- Location: `app/lib/modules/llm/**`, `app/lib/services/**`, `app/lib/security.ts`
- Contains: `LLMManager` 单例、provider registry、安全包装中间层。
- Depends on: provider SDK、cookie 中 provider 配置、Cloudflare env。
- Used by: API 路由层与部分客户端逻辑。
- Evidence: `app/lib/modules/llm/manager.ts:8`, `app/lib/modules/llm/manager.ts:19`, `app/lib/modules/llm/manager.ts:80`, `app/lib/security.ts:173`

**Runtime Execution Layer:**
- Purpose: 解析模型产出的 artifact/action，并在 WebContainer 中顺序执行 shell/file/build/start 动作。
- Location: `app/lib/runtime/message-parser.ts`, `app/lib/runtime/action-runner.ts`, `app/lib/webcontainer/index.ts`, `app/lib/stores/workbench.ts`
- Contains: 流式消息解析器、动作状态机、执行队列、预览错误采集。
- Depends on: `@webcontainer/api`, nanostores, terminal/files/previews store。
- Used by: 聊天 UI 与工作台。
- Evidence: `app/lib/runtime/message-parser.ts:67`, `app/lib/runtime/action-runner.ts:66`, `app/lib/runtime/action-runner.ts:151`, `app/lib/webcontainer/index.ts:26`, `app/lib/stores/workbench.ts:39`

**Platform Adapter Layer:**
- Purpose: 将 Remix 应用适配到 Cloudflare Pages 与 Electron 主进程。
- Location: `functions/[[path]].ts`, `electron/main/index.ts`, `electron/preload/index.ts`
- Contains: Pages `onRequest` handler、Electron `protocol.handle('http')`、IPC bridge。
- Depends on: Remix server build (`build/server`)、Electron APIs。
- Used by: Cloudflare Pages runtime 与桌面发行包。
- Evidence: `functions/[[path]].ts:4`, `functions/[[path]].ts:7`, `electron/main/index.ts:80`, `electron/main/index.ts:119`, `electron/preload/index.ts:20`

## Data Flow

**Chat Request/Response Flow:**

1. 客户端 `Chat.client.tsx` 调用 `useChat({ api: '/api/chat' })` 发起请求。证据：`app/components/chat/Chat.client.tsx:135`。
2. `api.chat` 读取消息、文件与 cookie 中 API key/provider settings，初始化 `SwitchableStream` 与 `MCPService`。证据：`app/routes/api.chat.ts:42`, `app/routes/api.chat.ts:87`。
3. 当开启上下文优化时，调用 `createSummary` 与 `selectContext` 选择上下文文件。证据：`app/routes/api.chat.ts:163`。
4. `streamText` 在 `app/lib/.server/llm/stream-text.ts` 内根据 provider/model 组装 system prompt 与 token 参数后流式调用模型。证据：`app/lib/.server/llm/stream-text.ts:57`, `app/lib/.server/llm/stream-text.ts:301`。
5. 结果通过 data stream 回到客户端，客户端再由 parser/action-runner 驱动工作台文件与命令执行。

**App Boot Flow (Web):**

1. 服务端入口 `app/entry.server.tsx` 使用 `renderToReadableStream` 生成 HTML 流。证据：`app/entry.server.tsx:18`。
2. 客户端入口 `app/entry.client.tsx` 调用 `hydrateRoot`，随后初始化鉴权监听 `initAuth`。证据：`app/entry.client.tsx:7`, `app/entry.client.tsx:11`。
3. 根布局 `app/root.tsx` 注入 Head、DndProvider、Toast、Scripts，形成全局 UI 容器。证据：`app/root.tsx:67`, `app/root.tsx:86`。

**Desktop Request Flow (Electron):**

1. `electron/main/index.ts` 在 `app.whenReady()` 后加载 Remix server build。证据：`electron/main/index.ts:68`。
2. `protocol.handle('http')` 接管请求，静态资源命中则直接返回，否则交给 `createRequestHandler`。证据：`electron/main/index.ts:80`, `electron/main/index.ts:119`。
3. `electron/preload/index.ts` 通过 `contextBridge.exposeInMainWorld` 暴露受控 IPC 能力给渲染层。证据：`electron/preload/index.ts:20`。

## Key Abstractions

**LLMManager (Provider Registry + Model Catalog):**
- Purpose: 统一 provider 注册、动态模型获取、缓存与默认 provider 选择。
- Examples: `app/lib/modules/llm/manager.ts`, `app/routes/api.models.ts`, `app/routes/api.llmcall.ts`
- Pattern: 单例 + provider 插件注册（registry 扫描导出类）。

**StreamingMessageParser (LLM DSL Parser):**
- Purpose: 解析 `<boltArtifact>` 与 `<boltAction>` 流式片段，触发 action 生命周期回调。
- Examples: `app/lib/runtime/message-parser.ts`
- Pattern: 增量状态机解析（按 messageId 维护解析状态）。

**ActionRunner (Action Executor):**
- Purpose: 串行执行 shell/file/build/start/supabase 动作并回写状态。
- Examples: `app/lib/runtime/action-runner.ts`, `app/lib/stores/workbench.ts`
- Pattern: 内部 promise 队列 + 各 action type 专用执行器。

**WorkbenchStore (Composition Root for IDE-like Subsystem):**
- Purpose: 聚合 files/editor/previews/terminal 与 artifact runner，形成工作台子系统。
- Examples: `app/lib/stores/workbench.ts`
- Pattern: Store 组合 + 工厂式创建 `ActionRunner`。

## Entry Points

**Cloudflare Pages Entry:**
- Location: `functions/[[path]].ts`
- Triggers: Cloudflare Pages 请求进入函数。
- Responsibilities: 动态加载 `build/server` 并交给 `createPagesFunctionHandler`。

**Remix Server Entry:**
- Location: `app/entry.server.tsx`
- Triggers: SSR 请求。
- Responsibilities: 渲染 `RemixServer`，拼接 `<head>` 与 body stream，设置响应头。

**Remix Client Entry:**
- Location: `app/entry.client.tsx`
- Triggers: 浏览器加载完成后 hydration。
- Responsibilities: `hydrateRoot` + 初始化认证监听。

**Route Entry (Main Chat API):**
- Location: `app/routes/api.chat.ts`
- Triggers: 客户端 `/api/chat` POST。
- Responsibilities: 请求解析、上下文优化、MCP 工具调用编排、LLM 流式输出。

**Electron Main Entry:**
- Location: `electron/main/index.ts`
- Triggers: 桌面应用启动。
- Responsibilities: 初始化窗口、HTTP 协议桥接、IPC、自动更新与热重载。

## Error Handling

**Strategy:** 以“路由层捕获 + 结构化响应 + 运行时告警”组合为主。

**Patterns:**
- API 路由捕获异常后返回对应 HTTP status 与可恢复信息。示例：`app/routes/api.llmcall.ts:106`, `app/routes/api.llmcall.ts:240`。
- Action 执行失败写入 action 状态并触发 UI alert。示例：`app/lib/runtime/action-runner.ts:225`。
- Electron 主进程注册 `uncaughtException`/`unhandledRejection` 兜底日志。示例：`electron/main/index.ts:24`。

## Cross-Cutting Concerns

**Logging:** 使用 `createScopedLogger` 与 `logStore` 双轨日志（服务端 scoped logger + 客户端事件日志）。证据：`app/routes/api.chat.ts:22`, `app/components/chat/Chat.client.tsx:170`。

**Validation:** token/model/provider 校验位于路由层；安全校验由 `withSecurity` 提供方法与限流封装。证据：`app/routes/api.llmcall.ts:70`, `app/lib/security.ts:173`。

**Authentication:** 客户端通过 `initAuth` 初始化会话监听，API 侧主要读取 cookie 中 API key/provider 设置。证据：`app/entry.client.tsx:11`, `app/routes/api.chat.ts:69`。

**Subsystem keyword "做":** 未发现名为“做”的独立子系统；仅存在中文文案占位符。证据：`app/lib/i18n/locales/zh.ts:681`。

---

*Architecture analysis: 2026-04-01*
