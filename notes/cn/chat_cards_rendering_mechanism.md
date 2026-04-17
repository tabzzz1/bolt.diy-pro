# 聊天区域“卡片”渲染机制与代码链路分析

在 `bolt.diy-pro` 项目中，聊天区域（Chat 界面）呈现的“交互式卡片”主要分为两大类处理系统：**Artifacts（代码/项目制品卡片）** 和 **Tool Invocations（工具调用卡片，主要是 MCP 机制）**。这两种卡片有着完全不同的前因后果和渲染链路。

---

## 1. Artifact 制品卡片系统

这是项目中最常见的卡片，用于展示代码生成、项目创建、命令执行等系统级行为。

### 1.1 触发场景与形式

*   **场景 1：AI 生成新项目/代码**。LLM 决定生成文件或执行终端命令时。
*   **场景 2：从 Github/Gitlab 克隆或导入本地文件夹**。UI 会自动在对话中插入一条初始化的伪造助手消息。
*   **外观表现：**
    *   **普通类型 (Standard)**: 包含标题“xxx”(如 Project Setup)和子标题“Click to open preview”，可以点击展开执行日志（如 npm install 等）。
    *   **聚合类型 (Bundled)**: 类似克隆模板时出现的卡片，显示有动画图标，文案如“初始文件已创建”(Initial files created)、“项目已还原”(Project restored)等状态。

### 1.2 代码链路与位置

1.  **数据源生成**：
    *   **AI 产出**：大模型根据 `system prompt` 输出诸如 `<boltArtifact id="xxx" title="yyy"> ... <boltAction type="file">...</boltAction> </boltArtifact>` 这种基于类似 XML 的特殊标记文本。
    *   **Git 导入**：在 `app/components/git/GitUrlImport.client.tsx` 与 `app/components/chat/GitCloneButton.tsx` 中，当用户成功拉取代码后，前端会主动伪造一条包含 `<boltArtifact type="bundled"> ... </boltArtifact>` 的消息传入到聊天历史中。

2.  **流式解析与转换 (`MessageParser`)**：
    *   **文件位置**: `app/lib/runtime/message-parser.ts` 或 `enhanced-message-parser.ts`
    *   **行为**: 聊天消息文本在展示前，会被 `useMessageParser` 逐字解析。当解析器捕捉到 `<boltArtifact>` 标签时，它会触发 `onArtifactOpen` 回调，将此 Artifact 的元数据灌入 `workbenchStore.addArtifact()` 中。同时，在传回给 UI 的纯文本里，解析器会用 HTML 标签 `<div class="__boltArtifact__" data-artifact-id="..."></div>` 替换掉原来的长串 XML 标签。

3.  **状态管理 (Zustand / Nanostores)**：
    *   **文件位置**: `app/lib/stores/workbench.ts`
    *   **行为**: `workbenchStore` 全局统一管理着各个 Artifact 的状态，包括它包含哪些 action（写入文件、执行 shell 脚本等），目前分别处于什么状态（`running`, `complete`, 等）。

4.  **Markdown 的拦截渲染**：
    *   **文件位置**: `app/components/chat/Markdown.tsx` 和 `app/utils/markdown.ts`
    *   **行为**: `rehype-sanitize` 插件被配置为允许 `__boltArtifact__` 这个 className 留在输出文本中。`react-markdown` 的 `components` 映射配置里拦截了 `div` 渲染流程：如果发现该 div 的 className 包含 `__boltArtifact__`，就直接放弃渲染原生 div，转而挂载 React 组件 `<Artifact>`。

5.  **最终 UI 的呈现 (`Artifact.tsx`)**：
    *   **文件位置**: `app/components/chat/Artifact.tsx`
    *   **行为**: 组件挂载后，通过 `artifactId` 去 `workbenchStore` 订阅实时状态。当检测到 `artifact.type === 'bundled'` 以及其下的 actions 都执行完毕时，就会展示 `"项目已创建"` (projectCreated) 等相应的国际化文案。

---

## 2. Tool Invocation 工具调用卡片（如 MCP）

此类卡片用于展示对话中大模型触发的函数调用（Function Calling/Tool Calling），最典型的就是最近引入的 MCP (Model Context Protocol) 功能。

### 2.1 触发场景与形式

*   **场景：AI 请求功能调用**。例如询问系统文件、进行 Web 检索或使用 MCP 提供的高级服务时。
*   **外观表现：** 会展现正在运行的大型卡片（带有 Spinner 动画），运行完毕会变成绿色对勾和工具名称。可从下拉详情里面看到工具入参(Request)与出参(Response)。

### 2.2 代码链路与位置

1.  **数据源生成**：
    *   基于 `@ai-sdk` 的规范，AI 在响应中不再输出文本标记，而是发起明确的 `Tool Call`。
    *   前端的 `useChat` (`app/components/chat/Chat.client.tsx`) 会收到类型为 `part.type === 'tool-invocation'` 的元素。

2.  **UI 层按类型分离 (AssistantMessage)**：
    *   **文件位置**: `app/components/chat/AssistantMessage.tsx`
    *   **行为**: 每条 AI 消息都会被遍历其拥有的 `parts`。如遇到 `tool-invocation`，会将它们与常规的文字 (`text`) 块分离。通过梳理，保留原本的插入顺序位置（之前修复 bug 即是因为这部分丢失了对 Artifact 后处理文本与原始文本的隔离），分别交付给不同的组件渲染。

3.  **最终 UI 的呈现 (`ToolInvocations.tsx`)**：
    *   **文件位置**: `app/components/chat/ToolInvocations.tsx` (以及衍生的 `MCPTools.tsx`)
    *   **行为**: 组件收到 `toolInvocations` 数组后，为每一个工具展现卡片。根据 `invocation.state` 属性（如 `callable`, `running`, `result`），决定是否展示加载动画，或把内部携带的具体工具请求体/结果数据格式化为 JSON、Markdown 加以显示。

---

## 总结比较

| 特性 | Artifact (制品卡片) | Tool Invocation (工具调用卡片) |
| :--- | :--- | :--- |
| **底层规范** | 项目自定义的类 XML 标记 (`<boltArtifact>`) | 业界标准 (OpenAI Function Calling) / `@ai-sdk/react` |
| **解析位置** | 自定义的字元流拦截器 (`MessageParser`) | 原生 `ai` 库维护的 `parts` 状态流 |
| **UI 入口** | Markdown 渲染树拦截 `class="__boltArtifact__"` | `AssistantMessage` 分流遍历 `parts` 直接挂载组件 |
| **主要定位** | 工作台文件级操作、代码构建、模板导入、执行脚本 | 通用网络检索、查询操作、MCP服务端交互集成 |
| **渲染形态** | 提供 "Open in Workbench" 功能、文件/终端动态折叠 | 展示 JSON Request/Response 及步骤状态徽章 |