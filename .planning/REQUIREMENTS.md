# Requirements: LifeBegins on bolt.diy-pro

**Defined:** 2026-04-01
**Core Value:** 每次会话都应同时提升交付进展与成长资产沉淀

## v1 Requirements

### Intent Anchor

- [ ] **ANCH-01**: 用户在新会话开始前可用极速模式（一句话）或结构化模式填写初心锚点
- [ ] **ANCH-02**: 系统在会话内持续展示当前初心摘要与本阶段边界
- [ ] **ANCH-03**: 在关键节点（方案建议/任务拆解前）系统可提示与初心的偏移风险
- [ ] **ANCH-04**: 用户可在会话中重设初心锚点并保留变更记录

### Fork Futures

- [ ] **FORK-01**: 用户可在当前上下文创建 A/B 两条候选路径
- [ ] **FORK-02**: 系统按统一六维展示路径对比（时间、复杂度、维护、风险、扩展、学习价值）
- [ ] **FORK-03**: 用户可选择路径并记录选择理由
- [ ] **FORK-04**: 被放弃路径会被保留以供复盘查看

### Failure Museum

- [ ] **FAIL-01**: 系统可自动归档关键中断类错误（预览、终端、工具调用）
- [ ] **FAIL-02**: 每条失败记录包含类型、触发背景、修复路径、耗时与复发标记
- [ ] **FAIL-03**: 用户可按分类与关键词检索失败记录
- [ ] **FAIL-04**: 用户可手动补充、合并或删除失败记录备注

### Life Timeline

- [ ] **TIME-01**: 系统可按时间线展示目标、决策、错误、里程碑四类节点
- [ ] **TIME-02**: 时间线节点支持跳转到对应会话上下文
- [ ] **TIME-03**: 会话结束时系统生成成长摘要并写入时间线

### Builder DNA

- [ ] **DNA-01**: 用户可初始化个人偏好标签（如稳健/速度/极简/实验）
- [ ] **DNA-02**: 系统建议可标注与当前偏好标签的关系（仅建议，不强制）
- [ ] **DNA-03**: 用户可随时关闭、重置或修改 DNA 偏好

### Metrics & Governance

- [ ] **METR-01**: 系统可记录 GSR 所需事件并支持按会话统计“有效成长会话”
- [ ] **METR-02**: 新能力通过 feature flag 控制，支持快速回滚
- [ ] **METR-03**: 用户数据支持最小化采集与导出/删除能力边界

## v2 Requirements

### Differentiator Deepening

- **FORK-05**: 系统可对历史分岔决策做后验评估并给出改进建议
- **FAIL-05**: 系统可自动聚类失败家族并提示复发风险
- **TIME-04**: 时间线支持高级筛选、聚合视图与主题回放
- **DNA-04**: DNA 支持跨会话自动校正与透明依据展示增强

### Growth & Commercialization

- **GROW-01**: 支持一键导出可分享的成长故事（模板化）
- **GROW-02**: 支持面向 Pro 的成长价值包能力开关

## Out of Scope

| Feature | Reason |
|---------|--------|
| 复杂团队协作与权限体系 | 当前优先验证单用户成长闭环 |
| 无限分岔树与复杂可视化编辑器 | MVP 阶段聚焦 A/B 决策闭环，控制交互复杂度 |
| 重构核心 LLM/执行引擎 | 采用 brownfield 增量集成，保障现有主链路稳定 |
| 全量错误日志无差别收集 | 噪声过大，会降低 Failure Museum 质量 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ANCH-01 | Phase 2 | Pending |
| ANCH-02 | Phase 2 | Pending |
| ANCH-03 | Phase 2 | Pending |
| ANCH-04 | Phase 2 | Pending |
| FORK-01 | Phase 3 | Pending |
| FORK-02 | Phase 3 | Pending |
| FORK-03 | Phase 3 | Pending |
| FORK-04 | Phase 3 | Pending |
| FAIL-01 | Phase 4 | Pending |
| FAIL-02 | Phase 4 | Pending |
| FAIL-03 | Phase 4 | Pending |
| FAIL-04 | Phase 4 | Pending |
| TIME-01 | Phase 5 | Pending |
| TIME-02 | Phase 5 | Pending |
| TIME-03 | Phase 5 | Pending |
| DNA-01 | Phase 6 | Pending |
| DNA-02 | Phase 6 | Pending |
| DNA-03 | Phase 6 | Pending |
| METR-01 | Phase 6 | Pending |
| METR-02 | Phase 1 | Pending |
| METR-03 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-01*
*Last updated: 2026-04-01 after roadmap mapping*
