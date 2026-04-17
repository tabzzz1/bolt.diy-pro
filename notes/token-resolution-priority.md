# Provider Token 读取优先级规范

## 目标
统一所有第三方 Provider（Vercel / GitHub / Netlify / Supabase 等）的 Token 解析顺序，避免“前端已连接但后端测试失败”的错配问题。

## 统一优先级（从高到低）
1. `Authorization` 请求头中的 `Bearer token`
2. Provider 独立 Cookie（例如 `VITE_VERCEL_ACCESS_TOKEN`、`githubToken`）
3. `apiKeys` Cookie 中的对应 Key
4. `context.cloudflare.env`
5. `process.env`

## 设计原则
- 请求级优先：用户当前请求显式携带的 Token 必须优先于环境变量。
- 用户态优先：当前会话/当前连接态（Cookie）优先于服务端默认配置。
- 环境变量兜底：`env` 只做 fallback，不应覆盖用户显式输入。
- 空值忽略：空字符串、纯空白字符串按无效 Token 处理。

## 适用范围
- 所有 `app/routes/api.*` 中需要读取 Provider Token 的接口。
- 特别是“测试连接”和“拉取当前用户信息”类接口，必须严格遵守本顺序。

## 推荐实现
- 使用统一方法：`app/lib/api/providerToken.ts` 中的 `resolveProviderToken(...)`。
- 禁止在各路由内重复手写不同顺序的 Token 查找逻辑。

## 备注
- 该规范用于保证“连接测试”行为与用户预期一致：测试的是“当前正在使用的 Token”，而不是某个历史或环境默认 Token。
