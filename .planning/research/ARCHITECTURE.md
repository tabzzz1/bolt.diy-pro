# Architecture Patterns

**Domain:** LifeBegins 增长记忆（growth-memory）与决策支持（decision-support）在 bolt.diy-pro 的增量集成  
**Researched:** 2026-04-01  
**Overall confidence:** HIGH（基于现有代码结构与已读项目文档）

## Recommended Architecture

推荐采用 **“主链路零侵入 + 旁路采集 + 分阶段闭环”** 架构：  
保留现有 `Chat -> api.chat -> streamText -> parser/action-runner -> workbench` 主执行链路不变，把成长能力作为独立 bounded context 挂在旁路，先采集再建议，最后才做受控联动。

```text
UI (Chat/BaseChat/Messages)
   |                \
   |                 \-- Growth Panel (Anchor/Fork/Timeline/Museum)
   v
api.chat (existing) -------------------------------> LLM + MCP + Runtime (existing)
   |
   +--> Growth Ingestion (new, non-blocking)
            |
            +--> Growth Event Store (IndexedDB first, optional remote sync later)
            +--> Decision Snapshot Store
            +--> Failure Cases Store
            +--> Projection Read Models (timeline, DNA, GSR)
                        |
                        +--> Decision Support Engine (advisory only in Phase II)
```

核心原则：
- 不在 `api.chat` 主响应路径增加强依赖 I/O（所有 growth 写入异步、可丢弃、可重试）。
- 不修改 `ActionRunner` 执行语义；失败博物馆先“观察”动作结果，不“控制”动作执行。
- 先本地单用户数据闭环（IndexedDB），后续再加远端同步，避免提前引入鉴权/多租户复杂度。

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `app/components/lifebegins/*` (new) | 锚点、分岔、人生线、失败样本 UI | `growthStore`、`decisionSupportService`、现有 Chat 组件 |
| `app/lib/stores/growth.ts` (new) | 前端成长状态聚合（anchor/fork/timeline stats） | `growthRepository`、`logStore` |
| `app/lib/lifebegins/events.ts` (new) | 统一 domain event schema（anchor_set, fork_created, action_failed...） | `api.chat`、`useChatHistory`、`ActionRunner` 观察器 |
| `app/lib/lifebegins/repository.ts` (new) | Growth 数据读写接口（先 IndexedDB） | `app/lib/persistence/db.ts`（扩展 object stores） |
| `app/lib/lifebegins/projections.ts` (new) | 事件到读模型投影（timeline/museum/GSR） | `repository.ts`、UI 查询层 |
| `app/lib/lifebegins/decision-support.ts` (new) | 决策建议生成（规则优先，LLM 可选） | `projections.ts`、`api.llmcall.ts`（可选） |
| `app/routes/api.growth.*.ts` (new) | Growth 查询/回放 API（如导出、统计） | `repository.ts`、`projections.ts` |
| `app/routes/api.chat.ts` (existing, minimal change) | 在 `onFinish`/关键节点发出 growth 事件 | `events.ts`（fire-and-forget） |

边界建议：
- `app/lib/persistence/db.ts` 只做存储适配，不承载业务规则。
- Growth 业务规则都放在 `app/lib/lifebegins/*`，避免污染 `runtime/*` 与 `modules/llm/*`。

## Incremental Integration Plan (Risk-Minimized)

### Phase 1: Passive Capture Layer（最低风险）

目标：先“看见”行为，不影响现有行为。

实施：
- 扩展 IndexedDB（例如 `growth_events`, `growth_decisions`, `growth_failures` store）。
- 新增 `GrowthEvent` schema 与 `emitGrowthEvent()`。
- 在以下位置只做旁路埋点：
  - `api.chat.ts`：会话开始、总结生成、上下文选择完成、回答结束。
  - `useChatHistory.ts`：snapshot take/restore、fork。
  - `ActionRunner`：action complete/failed（仅记录，不拦截）。

风控：
- 失败降级：growth 写入异常仅 `logStore.logError`，不抛回主链路。
- Feature Flag：`lifebeginsGrowthEnabled`（默认可灰度）。

### Phase 2: Read Models + Advisory Decision Support

目标：把事件转成可用资产，但仍不自动改写主流程。

实施：
- 加 projection 层，产出：
  - Timeline 事件流。
  - Failure Museum 聚合（错误签名、复发次数、最近修复路径）。
  - GSR 计算视图（按会话是否完成“锚点->行动->复盘”）。
- 决策支持引擎只输出建议卡片（A/B 路径比较、风险提示、历史相似案例）。

风控：
- 建议与执行分离：用户必须显式确认，才写回会话或触发动作。
- 先规则引擎，后 LLM 推断，降低不稳定性。

### Phase 3: Controlled Workflow Coupling

目标：在可观测基础上引入“轻耦合自动化”。

实施：
- 在会话开始插入 Intent Anchor 引导（可跳过）。
- 在关键节点（如 fork/rewind、连续失败）触发决策提醒。
- Builder DNA 使用历史读模型生成个性化默认建议，不直接改变底层执行参数。

风控：
- 所有自动化都通过策略开关 + 用户确认。
- 保留“一键退回纯 bolt 模式”。

## Data Flow

### 1) Anchor + Decision Capture

1. 用户在 Growth UI 设置 Intent Anchor。  
2. 触发 `anchor_set` 事件写入 `growth_events`。  
3. `projections` 更新会话目标状态。  
4. `decision-support` 读取状态给出“是否分岔”建议（仅展示）。

### 2) Failure Museum Build-up

1. `ActionRunner` 出现 `failed` 状态。  
2. 发出 `action_failed` + 错误摘要事件。  
3. 聚合器按错误签名（命令+错误类型+文件上下文）归并。  
4. UI 展示“复发率/最近修复路径”。

### 3) Timeline Projection

1. `api.chat` 与 `useChatHistory` 连续发出会话事件。  
2. `projections` 生成按时间排序的 timeline items。  
3. Life Timeline 页面按 chatId 或时间窗回放。

## Patterns to Follow

### Pattern 1: Event-First, Projection-Later
**What:** 先统一事件模型，再派生多个视图。  
**When:** 需求不稳定、后续还会扩展 Growth 功能时。  
**Example:**
```typescript
type GrowthEvent =
  | { type: 'anchor_set'; chatId: string; payload: { goal: string; successCriteria: string[] }; ts: string }
  | { type: 'decision_forked'; chatId: string; payload: { fromMessageId: string; branchId: string }; ts: string }
  | { type: 'action_failed'; chatId: string; payload: { actionType: string; error: string }; ts: string };
```

### Pattern 2: Fire-and-Forget Sidecar
**What:** 主链路执行后异步提交 growth 事件。  
**When:** 不能接受增长功能拖慢聊天响应时。  
**Example:**
```typescript
void growthService.emit(event).catch((err) => logStore.logError('growth emit failed', err));
```

### Pattern 3: Advisory-Only Decision Engine
**What:** 决策模块只给建议，不直接执行。  
**When:** Phase II 之前，验证建议质量与采纳率阶段。

## Anti-Patterns to Avoid

### Anti-Pattern 1: 在 `api.chat` 主流式路径同步写库
**Why bad:** 直接增加首 token 延迟与超时风险。  
**Instead:** 异步旁路写入 + 批处理/重试。

### Anti-Pattern 2: 把 Growth 状态塞进 `workbenchStore`
**Why bad:** 工作台状态已复杂，继续耦合会放大回归面。  
**Instead:** 独立 `growthStore`，仅通过明确 selector 与 UI 通信。

### Anti-Pattern 3: 过早远端化（先做多端同步）
**Why bad:** 提前引入 auth、冲突合并、迁移风险。  
**Instead:** 本地闭环验证价值后再做 remote sync。

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| 事件写入量 | 纯本地 IndexedDB 足够 | 增加按 chatId/time 分片索引 | 需服务端事件管道与冷热分层 |
| Projection 成本 | 前端实时重算可接受 | 改为增量投影 + 缓存快照 | 后端离线物化视图 |
| 决策建议延迟 | 规则引擎本地毫秒级 | 引入异步建议任务 | 分层模型路由 + 预算控制 |
| 风险回滚 | Feature flag 关闭即可 | 灰度发布 + A/B 回滚 | 多租户策略控制 + kill switch |

## Phase Ordering and Dependencies (for Roadmap)

建议 roadmap 依赖顺序：
1. **事件模型与旁路采集**（所有功能地基）  
2. **失败博物馆与人生线读模型**（先资产沉淀）  
3. **分岔决策支持（建议态）**（建立可感知价值）  
4. **Builder DNA 与个性化策略**（基于已有资产做复利）

依赖理由：
- 决策支持必须依赖历史事件与投影数据，否则只能“空建议”。
- Builder DNA 必须依赖稳定事件样本与反馈闭环，否则会产生高噪音画像。

## Sources

- `.planning/PROJECT.md`（2026-04-01）
- `.planning/codebase/ARCHITECTURE.md`（2026-04-01）
- `.planning/codebase/STRUCTURE.md`（2026-04-01）
- `notes/product-plan-lifebegins/09-分阶段路线图与执行清单.md`
- `app/routes/api.chat.ts`
- `app/lib/runtime/action-runner.ts`
- `app/lib/runtime/message-parser.ts`
- `app/lib/persistence/db.ts`
- `app/lib/persistence/useChatHistory.ts`
- `app/components/chat/Chat.client.tsx`
- `app/components/chat/Messages.client.tsx`
- `app/types/context.ts`
