/**
 * 项目中所有 localStorage key 的集中管理文件
 *
 * 使用规范：
 * - 新增 key 时必须在此处声明并添加注释
 * - 禁止在业务代码中直接写字符串 key，统一 import 此文件的常量
 * - 动态 key（含 chatId 等变量）使用工厂函数生成
 *
 * Key 分类：
 *   1. 应用配置与主题
 *   2. AI Provider 配置
 *   3. 第三方平台连接
 *   4. 部署项目绑定（动态 key）
 *   5. 文件系统状态
 *   6. 日志与调试
 *   7. 功能与更新通知
 *   8. 国际化
 */

// ─────────────────────────────────────────────
// 1. 应用配置与主题
// ─────────────────────────────────────────────

/**
 * 用户选择的 UI 主题
 * 值类型：'light' | 'dark'
 * 读写位置：app/lib/stores/theme.ts, app/root.tsx
 */
export const STORAGE_KEY_THEME = 'bolt_theme';

/**
 * 完整用户档案（用户名、头像、简介、语言、主题偏好等）
 * 值类型：JSON 对象 { username, bio, avatar, language, theme, ... }
 * 读写位置：app/lib/stores/theme.ts, app/lib/i18n/config.ts,
 *            app/components/@settings/tabs/settings/SettingsTab.tsx,
 *            app/lib/stores/i18n.ts
 */
export const STORAGE_KEY_USER_PROFILE = 'bolt_user_profile';

/**
 * 用户基础档案（历史字段，部分旧代码仍在使用）
 * 值类型：JSON 对象 { username, bio, avatar }
 * 读写位置：app/lib/stores/profile.ts
 * @deprecated 请优先使用 STORAGE_KEY_USER_PROFILE
 */
export const STORAGE_KEY_PROFILE = 'bolt_profile';

/**
 * 侧边栏/设置面板中各 Tab 的可见性与顺序配置
 * 值类型：JSON 对象，包含 Tab 布局信息
 * 读写位置：app/lib/stores/settings.ts
 */
export const STORAGE_KEY_TAB_CONFIGURATION = 'bolt_tab_configuration';

/**
 * 聊天面板（左侧）的宽度，单位 px
 * 值类型：数字字符串（如 '533'）
 * 读写位置：app/components/chat/BaseChat.tsx
 */
export const STORAGE_KEY_CHAT_PANEL_WIDTH = 'bolt_chat_panel_width';

/**
 * 聊天面板（左侧）是否处于收起状态
 * 值类型：'true' | 'false'
 * 读写位置：app/components/chat/BaseChat.tsx
 */
export const STORAGE_KEY_CHAT_PANEL_COLLAPSED = 'bolt_chat_panel_collapsed';

/**
 * 聊天输入区中“模型设置”区域是否处于收起状态
 * 值类型：'true' | 'false'
 * 读写位置：app/components/chat/BaseChat.tsx
 */
export const STORAGE_KEY_MODEL_SETTINGS_COLLAPSED = 'bolt_model_settings_collapsed';

// ─────────────────────────────────────────────
// 2. AI Provider 配置
// ─────────────────────────────────────────────

/**
 * 所有 AI Provider 的配置（API Key、选用模型、是否启用等）
 * 值类型：JSON 对象，key 为 provider 名称，value 为该 provider 的配置
 * 读写位置：app/lib/stores/settings.ts
 */
export const STORAGE_KEY_PROVIDER_SETTINGS = 'provider_settings';

/**
 * 已被自动启用的 Provider 列表（用于首次检测到环境变量时自动开启）
 * 值类型：JSON 数组，元素为 provider 名称字符串
 * 读写位置：app/lib/stores/settings.ts
 */
export const STORAGE_KEY_AUTO_ENABLED_PROVIDERS = 'auto_enabled_providers';

/**
 * MCP（Model Context Protocol）服务器配置及最大 LLM 步数设置
 * 值类型：JSON 对象 { servers, maxLlmSteps, ... }
 * 读写位置：app/lib/stores/mcp.ts
 */
export const STORAGE_KEY_MCP_SETTINGS = 'mcp_settings';

// ─────────────────────────────────────────────
// 3. 第三方平台连接
// ─────────────────────────────────────────────

/**
 * GitHub 账号连接信息（Token、用户信息、速率限制）
 * 值类型：JSON 对象 { user, token, tokenType, rateLimit }
 * 读写位置：app/lib/stores/github.ts, app/lib/stores/githubConnection.ts,
 *            app/lib/hooks/useGitHubConnection.ts, app/lib/hooks/useGitHubStats.ts,
 *            app/components/deploy/GitHubDeploymentDialog.tsx
 */
export const STORAGE_KEY_GITHUB_CONNECTION = 'github_connection';

/**
 * GitLab 账号连接信息（Token、用户信息、实例 URL）
 * 值类型：JSON 对象 { user, token, tokenType, gitlabUrl }
 * 读写位置：app/lib/stores/gitlabConnection.ts,
 *            app/lib/hooks/useGitLabConnection.ts,
 *            app/components/deploy/GitLabDeploymentDialog.tsx
 */
export const STORAGE_KEY_GITLAB_CONNECTION = 'gitlab_connection';

/**
 * Vercel 账号连接信息（Token、用户信息、部署统计）
 * 值类型：JSON 对象 { user, token, stats }
 * 读写位置：app/lib/stores/vercel.ts, app/lib/stores/github.ts
 */
export const STORAGE_KEY_VERCEL_CONNECTION = 'vercel_connection';

/**
 * Netlify 账号连接信息（Token、用户信息、部署统计）
 * 值类型：JSON 对象 { user, token, stats }
 * 读写位置：app/lib/stores/netlify.ts,
 *            app/components/@settings/tabs/netlify/NetlifyTab.tsx,
 *            app/components/@settings/tabs/netlify/components/NetlifyConnection.tsx
 */
export const STORAGE_KEY_NETLIFY_CONNECTION = 'netlify_connection';

/**
 * Supabase 账号连接信息（旧字段）
 * 值类型：JSON 对象（连接配置）
 * 读写位置：app/lib/hooks/useSupabaseConnection.ts
 * @deprecated 与 STORAGE_KEY_SUPABASE_CREDENTIALS 合并中，请关注后续清理
 */
export const STORAGE_KEY_SUPABASE_CONNECTION = 'supabase_connection';

/**
 * Supabase 访问凭证（Project URL、Anon Key 等）
 * 值类型：JSON 对象 { supabaseUrl, supabaseKey, ... }
 * 读写位置：app/lib/hooks/useSupabaseConnection.ts
 */
export const STORAGE_KEY_SUPABASE_CREDENTIALS = 'supabaseCredentials';

/**
 * GitHub 用户统计数据缓存（减少 API 调用次数）
 * 值类型：JSON 对象 { timestamp, data: { repos, stars, ... } }
 * 读写位置：app/lib/hooks/useGitHubStats.ts
 */
export const STORAGE_KEY_GITHUB_STATS_CACHE = 'github_stats_cache';

// ─────────────────────────────────────────────
// 4. 部署项目绑定（动态 key，含 chatId）
// ─────────────────────────────────────────────

/**
 * 生成某个聊天会话绑定的 Vercel 项目 ID 的 key
 * 值类型：字符串（Vercel project ID）
 * 读写位置：app/components/chat/integrations/deploy/VercelDeploymentLink.client.tsx,
 *            app/components/deploy/VercelDeploy.client.tsx
 */
export const storageKeyVercelProject = (chatId: string) => `vercel-project-${chatId}`;

/**
 * 生成某个聊天会话绑定的 Netlify 站点 ID 的 key
 * 值类型：字符串（Netlify site ID）
 * 读写位置：app/components/deploy/NetlifyDeploy.client.tsx
 */
export const storageKeyNetlifySite = (chatId: string) => `netlify-site-${chatId}`;

/**
 * 生成某个聊天会话绑定的 Supabase 项目 ID 的 key
 * 值类型：字符串（Supabase project ID）
 * 读写位置：app/components/chat/integrations/supabase/SupabaseConnection.tsx
 */
export const storageKeySupabaseProject = (chatId: string) => `supabase-project-${chatId}`;

// ─────────────────────────────────────────────
// 5. 文件系统状态
// ─────────────────────────────────────────────

/**
 * 当前会话中被锁定的文件/文件夹列表（防止 AI 意外修改）
 * 值类型：JSON 数组 [{ chatId, path, isFolder }]
 * 读写位置：app/lib/persistence/lockedFiles.ts
 */
export const STORAGE_KEY_LOCKED_FILES = 'bolt.lockedFiles';

/**
 * 用户手动删除的文件/文件夹路径集合（防止重新加载后复现）
 * 值类型：JSON 数组，元素为文件路径字符串
 * 读写位置：app/lib/stores/files.ts
 */
export const STORAGE_KEY_DELETED_PATHS = 'bolt-deleted-paths';

// ─────────────────────────────────────────────
// 6. 日志与调试
// ─────────────────────────────────────────────

/**
 * 应用运行时错误日志列表
 * 值类型：JSON 数组，元素为错误日志对象
 * 读写位置：app/lib/api/debug.ts
 */
export const STORAGE_KEY_ERROR_LOGS = 'error_logs';

/**
 * 用户已读的日志 ID 集合（用于显示未读徽章）
 * 值类型：JSON 数组，元素为日志 ID 字符串
 * 读写位置：app/lib/stores/logs.ts
 */
export const STORAGE_KEY_READ_LOGS = 'bolt_read_logs';

// ─────────────────────────────────────────────
// 7. 功能与更新通知
// ─────────────────────────────────────────────

/**
 * 用户已查看过的新功能 ID 列表（避免重复弹出功能介绍）
 * 值类型：JSON 数组，元素为功能 ID 字符串
 * 读写位置：app/lib/hooks/useFeatures.ts
 */
export const STORAGE_KEY_VIEWED_FEATURES = 'bolt_viewed_features';

/**
 * 用户已确认的连接问题类型（避免重复弹出警告）
 * 值类型：'disconnected' | 'high-latency' | null
 * 读写位置：app/lib/hooks/useConnectionStatus.ts
 */
export const STORAGE_KEY_ACKNOWLEDGED_CONNECTION_ISSUE = 'bolt_acknowledged_connection_issue';

/**
 * 用户最后一次确认（关闭）的更新版本号
 * 值类型：字符串（版本号，如 '1.2.3'）
 * 读写位置：app/lib/api/updates.ts
 */
export const STORAGE_KEY_LAST_ACKNOWLEDGED_UPDATE = 'last_acknowledged_update';
