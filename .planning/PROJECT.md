# LifeBegins on bolt.diy-pro

## What This Is

LifeBegins 是构建在 `bolt.diy-pro` 现有 AI 开发工作台之上的“开发者成长平台”升级项目。它在保留多模型代码生成、工作台执行、预览调试与部署能力的基础上，新增“目标锚定、方案分岔、失败沉淀、成长轨迹”能力。目标用户是希望既提升交付效率、又形成长期方法论与个人资产的独立开发者与小团队。

## Core Value

每次会话都应同时提升交付进展与成长资产沉淀，避免“写完即丢失”的一次性价值。

## Requirements

### Validated

- ✓ 多 Provider/模型切换的 AI 编程对话能力 — existing
- ✓ 对话输出到 Artifact/Action 并驱动工作台执行 — existing
- ✓ 内置终端、文件编辑、预览、Diff 的开发闭环 — existing
- ✓ Cloudflare Pages + Electron 双端运行与发布能力 — existing
- ✓ MCP/Git/Supabase 等外部能力接入基础 — existing

### Active

- [ ] 引入“初心锚点（Intent Anchor）”流程，让每次会话具备目标、边界与成功标准
- [ ] 提供“分岔人生（Fork Futures）”A/B 路径对比，支持关键决策记录与回看
- [ ] 构建“失败博物馆（Failure Museum）”，自动沉淀关键报错、修复路径与复发情况
- [ ] 构建“人生线（Life Timeline）”可视化，串联目标、决策、错误与里程碑节点
- [ ] 建立“Builder DNA”偏好模型，用于个性化建议与持续校正
- [ ] 建立 GSR（有效成长会话率）相关埋点与最小实验闭环

### Out of Scope

- 复杂团队协作与权限系统（本轮不做） — 当前优先验证单用户成长闭环，避免过早进入高耦合协作设计
- 重视觉包装但无数据沉淀的“炫技功能” — 不符合“效率 + 资产”双目标
- 全量重构现有 LLM/执行引擎 — 当前路线应在既有底座上增量演进，控制风险与节奏

## Context

当前代码库已经是成熟的 brownfield：Remix + Vite + Cloudflare Pages Functions + Electron 多运行时架构，核心能力位于 `app/routes`、`app/lib/.server/llm`、`app/lib/runtime` 与 `app/lib/stores/workbench`。现有产品具备强“生产力底座”，但在用户心智层面仍易被归类为通用 AI coding assistant。

`notes/product-plan-lifebegins` 已明确提出差异化方向：从“帮你写代码”升级为“帮你形成成长轨迹”，并给出四个核心方案（初心锚点、分岔人生、失败博物馆、人生线/Builder DNA）与三阶段节奏。当前最关键的是先跑通“价值感知 -> 数据沉淀 -> 留存提升”的可验证闭环，而不是同时扩展过多外围能力。

## Constraints

- **Tech stack**: 基于 Remix/Vite/Cloudflare/Electron 现有架构增量实现 — 降低重构风险与迁移成本
- **Delivery**: 采用阶段化 MVP（先轻量闭环，后强化） — 确保每阶段可交付、可验证
- **Data**: 新能力需可埋点、可回看、可复盘 — 支撑 GSR 与留存判断
- **Compatibility**: 不破坏现有聊天-工作台执行主链路 — 保证现有用户体验与社区贡献连续性
- **Maintainability**: 新模块需保持职责边界清晰，避免把业务状态耦合进核心执行引擎 — 便于后续演化

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 采用 brownfield 增量路线，而非重做新产品 | 已有底座能力强，重做成本高且风险大 | — Pending |
| 差异化主线先聚焦四个成长功能 | 与产品方案文档和阶段路线一致，且可形成复利数据资产 | — Pending |
| 北极星采用 GSR（有效成长会话率）导向 | 比时长/活跃更贴近真实价值沉淀 | — Pending |
| 阶段一优先做初心锚点 + 分岔人生 MVP | 最快建立“方向感 + 决策感知”的差异化体验 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-01 after initialization*
