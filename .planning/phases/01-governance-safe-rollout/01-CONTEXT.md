# Phase 1: Governance & Safe Rollout - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

本阶段仅交付“新能力可安全灰度/回滚 + 数据权利边界最小闭环”。
不新增成长业务能力本身（Anchor/Fork/Failure/Timeline/DNA），只建立这些能力未来上线所需的治理与安全底座。

</domain>

<decisions>
## Implementation Decisions

### 发布开关模型
- **D-01:** 采用“双层开关”模型：服务端强制开关（kill switch）+ 前端可见性开关。
- **D-02:** 服务端开关按能力域分组（`lifebegins.anchor / fork / failure / timeline / dna`），不采用单总开关。
- **D-03:** 开关配置优先级为 `env > 持久化配置 > 默认值`，保证事故时可环境变量硬切。
- **D-04:** 默认发布策略为“全关”，通过分能力域逐步灰度开启。

### 关闭时降级策略
- **D-05:** 前端在能力关闭时隐藏入口（而非灰显或只读展示）。
- **D-06:** 服务端对被关闭能力请求明确拒绝（统一错误语义，如 `feature_disabled`），不静默忽略。
- **D-07:** 客户端收到拒绝后使用轻提示反馈，并引导回主链路；保留用户输入与上下文。
- **D-08:** 开关实时生效，不支持“会话级豁免继续可用”。

### 数据导出/删除边界
- **D-09:** Phase 1 数据权利仅覆盖新增 growth 域数据（不含既有全量聊天/设置域）。
- **D-10:** 导出格式采用 JSON 单文件（Phase 1 不扩展 markdown/csv 复合包）。
- **D-11:** 删除策略采用即时硬删除，不保留可恢复副本。
- **D-12:** 删除执行采用同步结果反馈；保留最小匿名审计元数据（时间/动作/结果），不保留业务内容。

### the agent's Discretion
- `feature_disabled` 的具体 HTTP 状态码（403 vs 409）与错误响应字段命名。
- 前端轻提示的具体文案与交互样式（toast/inline banner 组合方式）。
- 分能力域开关在配置文件中的命名细节与组织结构。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and requirements
- `.planning/ROADMAP.md` — Phase 1 目标、边界、成功标准（Governance & Safe Rollout）
- `.planning/REQUIREMENTS.md` — `METR-02`, `METR-03` 的强约束来源
- `.planning/PROJECT.md` — 全局约束：brownfield 增量、主链路不受损、数据最小化

### Existing implementation anchors
- `app/components/@settings/tabs/features/FeaturesTab.tsx` — 现有前端 Feature 开关 UI 与交互模式
- `app/lib/hooks/useSettings.ts` — 设置开关状态管理入口
- `app/lib/stores/settings.ts` — 本地持久化与开关默认值实践
- `app/lib/security.ts` — 现有 API 安全包装、限流、错误处理基线
- `app/components/@settings/tabs/data/DataTab.tsx` — 现有数据操作入口（导出/删除）可复用交互框架
- `app/routes/api.export-api-keys.ts` — 导出类接口的实现参考

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `FeaturesTab` + `useSettings` + `settingsStore`: 可复用为“前端可见性开关层”。
- `withSecurity`（`app/lib/security.ts`）: 可复用为服务端治理接口的统一包装。
- `DataTab` + `useDataOperations`: 可复用为数据权利操作（导出/删除）的 UI 流程框架。

### Established Patterns
- 设置类能力主要走前端 store + localStorage 的模式。
- API 层已有“统一安全包装 + JSON 错误返回”模式，可承接 `feature_disabled` 语义。
- 代码库倾向增量扩展现有模块，而非大范围重构。

### Integration Points
- 新增服务端能力开关检查：`app/routes/api.*`（growth 相关路由）入口处。
- 新增前端能力可见性控制：`app/components/@settings/tabs/features/FeaturesTab.tsx` 与相关入口组件。
- 新增数据权利 API 与执行链路：沿 `DataTab` 入口挂接 growth 域导出/删除动作。

</code_context>

<specifics>
## Specific Ideas

- 事故处置时必须“环境变量可一键硬切”，避免仅依赖应用内配置导致回滚不确定。
- 关闭能力时优先“用户无噪音”策略（隐藏入口 + 轻提示），不做复杂解释型阻断。

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-governance-safe-rollout*
*Context gathered: 2026-04-01*
