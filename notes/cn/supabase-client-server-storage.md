# Supabase 客户端与服务端数据存储详解

> 本文档梳理 bolt.diy-pro 中客户端与服务端针对 Supabase 的存储内容、存储位置及两者的本质差异。

---

## 一、整体架构概览

```
用户浏览器 (客户端)
  │
  ├── nanostores (内存)         ← 运行时连接状态
  ├── localStorage              ← 持久化连接凭证
  └── .env 文件 (生成代码中)    ← 注入到用户项目的配置
       │
       ▼
  Remix 服务端 (Node / Cloudflare Workers)
       │
       ├── /api/supabase         ← 代理：获取项目列表
       ├── /api/supabase/query   ← 代理：执行 SQL (DDL/DML)
       └── /api/supabase/variables ← 代理：获取 API Keys
            │
            ▼
  Supabase 云服务
       ├── Management API (PAT Token)   ← 元数据 / schema 变更
       └── PostgREST + JS Client (anonKey) ← 应用数据读写
```

两条完全不同的链路：
- **服务端 → Supabase Management API**：用 Personal Access Token，操作 schema（建表、改表）
- **客户端生成代码 → Supabase JS SDK**：用 anon Key，操作应用数据（增删改查）

---

## 二、客户端存储的内容

### 2.1 localStorage（持久化）

客户端通过 `updateSupabaseConnection()` 将状态持久化到 localStorage。
代码位置：`app/lib/stores/supabase.ts:134-144`

#### Key 1：`supabase_connection`（`STORAGE_KEY_SUPABASE_CONNECTION`）

存储位置定义：`app/lib/persistence/storageKeys.ts:138`

```typescript
// 存入内容（完整结构）
{
  user: {
    email: 'Connected',    // 注意：这是硬编码的假值！见 api.supabase.ts
    role: 'Admin',         // 同上，并非真实用户信息
  },
  token: 'sbp_xxxx...',   // 用户的 Supabase Personal Access Token（真实）
  stats: {
    totalProjects: 3,
    projects: [
      {
        id: 'abcdef123',
        name: 'my-project',
        region: 'ap-southeast-1',
        status: 'ACTIVE_HEALTHY',
        organization_id: 'org_xxx',
        created_at: '2024-01-01T00:00:00Z',
        stats: { database: { tables: 5, size_mb: 12 }, ... }
      },
      // ...
    ]
  },
  selectedProjectId: 'abcdef123',
  isConnected: true,
  project: { /* 当前选中的 project 完整对象 */ },
  credentials: {
    supabaseUrl: 'https://abcdef123.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
}
```

> ⚠️ **关键问题**：`user.email` 和 `user.role` 是服务端硬编码的占位符（见下方服务端章节），并非真实 Supabase 用户信息。

---

#### Key 2：`supabaseCredentials`（`STORAGE_KEY_SUPABASE_CREDENTIALS`）

存储位置定义：`app/lib/persistence/storageKeys.ts:145`

```typescript
// 存入内容
{
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',  // 项目的匿名公钥
  supabaseUrl: 'https://abcdef123.supabase.co'           // 项目访问地址
}
```

这是**最核心的数据** —— AI 生成的代码需要这两个值才能连接 Supabase。它会同时存入 `supabase_connection.credentials` 和这个独立 key，防止丢失。

---

#### Key 3：`supabase-project-{chatId}`（per-chat）

存储位置定义：`app/lib/persistence/storageKeys.ts:174-178`，读取位置：`app/components/chat/SupabaseConnection.tsx:46`

```typescript
// Key 格式
`supabase-project-${chatId}`

// 存入内容（纯字符串）
'abcdef123'  // 当前对话选中的 project ID
```

每个对话独立记录选择了哪个项目，互不干扰。

---

### 2.2 nanostores 内存状态

代码位置：`app/lib/stores/supabase.ts:84-88`

```typescript
export const supabaseConnection = atom<SupabaseConnectionState>(initialState); // 连接完整状态
export const isConnecting = atom(false);       // 连接中标志
export const isFetchingStats = atom(false);    // 拉取项目列表中标志
export const isFetchingApiKeys = atom(false);  // 拉取 API Keys 中标志
```

内存状态在页面刷新后从 localStorage 恢复，初始化逻辑在 `app/lib/stores/supabase.ts:58-83`。

---

### 2.3 客户端初始化 Token 的来源

代码位置：`app/lib/stores/supabase.ts:147-155`（`initializeSupabaseConnection`）

```typescript
// 优先级：Vite 编译时环境变量（客户端可访问）
const envToken = import.meta.env?.VITE_SUPABASE_ACCESS_TOKEN;
```

使用的是 **Vite 编译时注入的客户端环境变量**（`import.meta.env`），不是 `process.env`。

---

## 三、服务端存储 / 操作的内容

服务端不维护持久化状态，所有 API 路由都是**无状态代理**，代表客户端向 Supabase 发起请求。

### 3.1 `/api/supabase` — 读取项目列表

代码位置：`app/routes/api.supabase.ts`

```typescript
// 接收：客户端 POST body 中的 token
const { token } = await request.json();

// 调用：Supabase Management API
fetch('https://api.supabase.com/v1/projects', {
  headers: { Authorization: `Bearer ${token}` }
})

// 返回给客户端（注意 user 是硬编码的！）
{
  user: { email: 'Connected', role: 'Admin' },  // ← 假数据
  stats: {
    projects: [ ...去重、按创建时间排序后的项目列表... ],
    totalProjects: N
  }
}
```

> ⚠️ **重要**：Supabase Management API 没有"获取当前用户信息"的接口，因此这里的 `user` 是写死的占位符。最终存入 localStorage 的 `user.email` 字段值永远是 `'Connected'`。

---

### 3.2 `/api/supabase/variables` — 读取 API Keys

代码位置：`app/routes/api.supabase.variables.ts`

```typescript
// 接收
const { projectId, token } = await request.json();

// 调用：Supabase Management API 获取项目 API Keys
fetch(`https://api.supabase.com/v1/projects/${projectId}/api-keys`, {
  headers: { Authorization: `Bearer ${token}` }
})

// 返回给客户端
{
  apiKeys: [
    { name: 'anon', api_key: 'eyJ...' },
    { name: 'service_role', api_key: 'eyJ...' }
  ]
}
```

客户端拿到 `anon` key 后，构造 `credentials` 并存入 localStorage（见 `app/lib/stores/supabase.ts:190-234`）。

---

### 3.3 `/api/supabase/query` — 执行 SQL（核心写入操作）

代码位置：`app/routes/api.supabase.query.ts`

```typescript
// 接收，注意 token 在 Header 中，不在 body
Authorization: Bearer {connection.token}
body: { projectId: string, query: string }

// 调用：Supabase Management API 数据库查询接口
fetch(`https://api.supabase.com/v1/projects/${projectId}/database/query`, {
  method: 'POST',
  headers: { Authorization: authHeader },
  body: JSON.stringify({ query })  // 任意 SQL
})
```

**这是唯一真正向 Supabase 数据库写入数据的服务端入口。** SQL 内容由 AI 生成，经用户在 `SupabaseChatAlert` 组件中确认后触发。

---

### 3.4 `/api/supabase-user` — "测试连接"按钮专用

代码位置：`app/routes/api.supabase-user.ts`

```typescript
// Token 来源（服务端自己找，不接受客户端传入）
const supabaseToken =
  apiKeys.VITE_SUPABASE_ACCESS_TOKEN          // Cookie 中
  || context?.cloudflare?.env?.VITE_SUPABASE_ACCESS_TOKEN  // Cloudflare env
  || process.env.VITE_SUPABASE_ACCESS_TOKEN   // Node process env
```

这就是"测试连接"失败但面板显示"Connected"的根本原因：
- Token 是客户端手动输入的 → 只在 nanostores/localStorage 中
- 服务端从 env/Cookie 中找 → 什么都找不到 → 报错

---

## 四、AI 生成代码写入 Supabase 数据库的完整流程

这是**真正向 Supabase 写数据**的完整链路：

```
AI 生成 boltAction（两种）
  │
  ├── operation="migration"
  │     → action-runner.ts:484-504
  │     → 在本地项目创建 /supabase/migrations/xxx.sql 文件
  │     → 不执行，只写文件
  │
  └── operation="query"
        → action-runner.ts:507-518
        → 触发 onSupabaseAlert 回调
        → SupabaseChatAlert 组件显示确认弹窗
        → 用户点击"Apply"
        → 发送 POST /api/supabase/query
        → 服务端代理执行 SQL
        → 真正写入 Supabase 数据库
```

SQL 安全限制（由 system prompt 强制，`app/lib/common/prompts/prompts.ts:103-111`）：
- 禁止：`DROP`、`DELETE`（防数据丢失）
- 禁止：`BEGIN`/`COMMIT`/`ROLLBACK`（事务控制）
- 必须：每张新表都要开启 RLS

---

## 五、.env 文件注入（生成代码的配置）

代码位置：`app/lib/common/prompts/prompts.ts:89-98`

当用户已连接 Supabase 且选择了项目时，system prompt 会要求 AI 在生成的项目中创建 `.env` 文件：

```bash
VITE_SUPABASE_URL=https://abcdef123.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

这两个值来自 localStorage 的 `credentials` 字段，最终被注入到 AI 生成的应用代码里供 `@supabase/supabase-js` 使用。

---

## 六、两种写入方式的本质区别

| 维度 | 服务端写入（`/api/supabase/query`） | 客户端生成代码写入（JS SDK） |
|---|---|---|
| **使用的 Token** | Personal Access Token（管理员级） | anon Key（普通用户级） |
| **调用的 API** | Supabase Management API | PostgREST（REST API） |
| **操作类型** | DDL（CREATE TABLE、ALTER TABLE） | DML（INSERT、UPDATE、SELECT、DELETE） |
| **权限范围** | 可修改 schema、数据库结构 | 受 RLS 策略限制，只能操作数据 |
| **触发方式** | 用户确认 AI 生成的 SQL | 应用运行时自动触发 |
| **代码位置** | `app/routes/api.supabase.query.ts` | AI 生成的 `src/lib/supabase.ts` |
| **谁在调用** | bolt.diy 框架本身 | 用户的应用程序 |

---

## 七、数据流总结图

```
用户输入 Token
  │
  ▼
handleConnect() → POST /api/supabase（token 在 body）
  │                   └── Supabase: GET /v1/projects
  │
  ▼
updateSupabaseConnection()
  ├── nanostores: supabaseConnection atom
  └── localStorage: supabase_connection

用户选择项目
  │
  ▼
fetchProjectApiKeys() → POST /api/supabase/variables（token 在 body）
  │                         └── Supabase: GET /v1/projects/{id}/api-keys
  │
  ▼
updateSupabaseConnection({ credentials: { anonKey, supabaseUrl } })
  ├── localStorage: supabase_connection.credentials
  └── localStorage: supabaseCredentials（独立备份）

AI 生成数据库代码
  │
  ├─ migration action → 本地写文件 /supabase/migrations/xxx.sql
  │
  └─ query action → SupabaseChatAlert 弹窗 → 用户确认
                        │
                        ▼
                    POST /api/supabase/query（token 在 Header）
                        └── Supabase: POST /v1/projects/{id}/database/query
                                            ↑
                                    真正写入数据库 ✓
```
