# Roadmap: LifeBegins on bolt.diy-pro

## Overview

本路线图遵循 brownfield 增量策略：先建立可控发布与数据治理，再逐步交付 Anchor、Fork、Failure、Timeline、DNA 与 GSR 闭环，确保每一阶段都能被用户直接感知并为下一阶段提供稳定依赖。

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Governance & Safe Rollout** - 建立新能力的发布开关、回滚与数据权利边界
- [ ] **Phase 2: Intent Anchor Experience** - 交付会话级初心锚定、持续展示与偏移提醒
- [ ] **Phase 3: Fork Futures Decisions** - 交付 A/B 分岔对比、选择与复盘留痕
- [ ] **Phase 4: Failure Museum MVP** - 交付关键失败自动沉淀、检索与人工修订
- [ ] **Phase 5: Life Timeline MVP** - 交付目标/决策/错误/里程碑统一时间线与回跳
- [ ] **Phase 6: Builder DNA & GSR Loop** - 交付偏好模型最小闭环与有效成长会话统计

## Phase Details

### Phase 1: Governance & Safe Rollout
**Goal**: 新能力在不破坏主链路前提下可被灰度启停，并具备最小数据治理边界  
**Depends on**: Nothing (first phase)  
**Requirements**: METR-02, METR-03  
**Success Criteria** (what must be TRUE):
  1. 运营可通过 feature flag 对新能力进行启用/禁用，并在异常时快速回滚。
  2. 当功能被关闭时，用户仍可无感使用原有聊天-工作台主链路。
  3. 用户可在产品中明确看到并执行其数据导出/删除边界能力。  
**Plans**: 2 plans
Plans:
- [x] 01-governance-safe-rollout-01-PLAN.md — 双层开关治理主干、统一拒绝语义与主链路回归
- [x] 01-governance-safe-rollout-02-PLAN.md — growth 域导出/删除边界与最小匿名审计闭环

### Phase 2: Intent Anchor Experience
**Goal**: 用户在会话开始与执行过程中始终有清晰目标、边界与可追溯变更  
**Depends on**: Phase 1  
**Requirements**: ANCH-01, ANCH-02, ANCH-03, ANCH-04  
**Success Criteria** (what must be TRUE):
  1. 用户开始新会话时可在极速一句话与结构化表单两种模式间选择并完成锚定。
  2. 会话界面持续展示当前初心摘要与阶段边界，用户随时可见。
  3. 在方案建议或任务拆解前，系统会提示与初心偏移的风险。
  4. 用户可在会话内重设初心，且能回看变更记录。  
**Plans**: TBD
**UI hint**: yes

### Phase 3: Fork Futures Decisions
**Goal**: 用户可在同一上下文中完成可比较、可选择、可回看的 A/B 决策流程  
**Depends on**: Phase 2  
**Requirements**: FORK-01, FORK-02, FORK-03, FORK-04  
**Success Criteria** (what must be TRUE):
  1. 用户可从当前上下文创建两条候选路径并进入对比界面。
  2. 系统以统一六维（时间、复杂度、维护、风险、扩展、学习价值）展示 A/B 对比。
  3. 用户可明确选择一条路径并记录选择理由。
  4. 未被选择的路径会保留在历史中，用户可用于后续复盘。  
**Plans**: TBD
**UI hint**: yes

### Phase 4: Failure Museum MVP
**Goal**: 用户可沉淀与检索关键失败经验，形成可复用的问题修复资产  
**Depends on**: Phase 1  
**Requirements**: FAIL-01, FAIL-02, FAIL-03, FAIL-04  
**Success Criteria** (what must be TRUE):
  1. 预览、终端、工具调用中的关键中断类错误会被自动归档为失败记录。
  2. 每条失败记录都包含类型、触发背景、修复路径、耗时和复发标记。
  3. 用户可按分类与关键词快速检索目标失败记录。
  4. 用户可对记录进行手动补充、合并或删除备注。  
**Plans**: TBD
**UI hint**: yes

### Phase 5: Life Timeline MVP
**Goal**: 用户可在统一 timeline view 中理解一次成长闭环的关键节点与上下文  
**Depends on**: Phase 2, Phase 3, Phase 4  
**Requirements**: TIME-01, TIME-02, TIME-03  
**Success Criteria** (what must be TRUE):
  1. 用户可按时间顺序看到目标、决策、错误、里程碑四类节点。
  2. 用户点击任一时间线节点可跳回对应会话上下文。
  3. 每次会话结束后系统会自动生成成长摘要并写入时间线。  
**Plans**: TBD
**UI hint**: yes

### Phase 6: Builder DNA & GSR Loop
**Goal**: 用户可管理个人偏好并看到建议关系标注，系统可统计有效成长会话  
**Depends on**: Phase 5  
**Requirements**: DNA-01, DNA-02, DNA-03, METR-01  
**Success Criteria** (what must be TRUE):
  1. 用户可初始化、修改、重置或关闭 Builder DNA 偏好标签。
  2. 系统给出的建议会标注与当前偏好标签的关系，且仅作为建议不强制。
  3. 用户关闭 DNA 后，相关偏好引导会停止生效并可随时再次启用。
  4. 系统可按会话统计并标记“有效成长会话”，支持后续 GSR 分析。  
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Governance & Safe Rollout | 0/0 | Not started | - |
| 2. Intent Anchor Experience | 0/0 | Not started | - |
| 3. Fork Futures Decisions | 0/0 | Not started | - |
| 4. Failure Museum MVP | 0/0 | Not started | - |
| 5. Life Timeline MVP | 0/0 | Not started | - |
| 6. Builder DNA & GSR Loop | 0/0 | Not started | - |
