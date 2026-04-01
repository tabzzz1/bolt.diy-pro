# Domain Pitfalls

**Domain:** Builder-growth AI coding platform (growth-memory + decision-assist loop)  
**Researched:** 2026-04-01

## Critical Pitfalls

### Pitfall 1: 把“互动热闹”当作“成长结果”（Vanity Metrics Drift）
**What goes wrong:** 团队把点击、停留时长、功能触发次数当核心成功信号，导致 `goal -> decision -> retrospective` 闭环看似活跃但无实际成长。  
**Why it happens:** 指标体系没有区分“过程指标”与“结果指标”；GSR 定义落地不完整。  
**Warning signs:**  
- “分岔使用率上升”，但周留存/月留存无改善  
- 会话时长增加，但任务完成率下降  
- 复盘条目数量增加，但重复错误率不降  
**Consequences:** 路线图被假阳性数据误导，团队持续优化低价值体验。  
**Prevention strategy:**  
- 强制采用三层指标树：`North Star(GSR/留存)` -> `Leading(锚点/分岔/复盘覆盖)` -> `Guardrail(流失率/任务完成率)`  
- 每个实验必须绑定“行为 + 结果”成对指标（只看点击率禁止上线结论）  
- 设立“指标审查门”：没有结果指标的需求不进入开发  
**Detection:** 月度指标评审中，任何“行为上涨但结果不动/变差”自动标记为红灯。  
**Which phase should address it:** `Phase: Metrics Foundation & GSR Baseline`（最早阶段处理）

### Pitfall 2: 事件埋点无统一语义，导致闭环不可计算（Unjoinable Loop Data）
**What goes wrong:** `goal / decision / retrospective` 各自埋点，缺少统一 `session_id / decision_id / goal_id / actor / source`，后续无法串联闭环。  
**Why it happens:** 先做功能再补数据，或每个模块自行命名事件。  
**Warning signs:**  
- 分析时大量 “unknown / null / other”  
- 同一行为在不同端命名不一致  
- 需要手工 SQL 拼接才能还原会话路径  
**Consequences:** GSR 不稳定、A/B 结果不可复现、复盘报告不可信。  
**Prevention strategy:**  
- 先定义 Tracking Plan（事件字典 + 属性 schema + 版本）再开发  
- 用统一语义约定（事件名、属性名、状态码）并在 CI 做埋点校验  
- 对关键链路做端到端事件回放测试（session 级）  
**Detection:** 每周出埋点质量报告：覆盖率、schema 违规率、关键字段缺失率。  
**Which phase should address it:** `Phase: Instrumentation Contract & Data Quality`

### Pitfall 3: 决策辅助“替你做决定”，引发自动化偏置（Automation Bias）
**What goes wrong:** 分岔人生输出“推荐方案”但不给证据边界，用户把建议当结论执行。  
**Why it happens:** 团队追求“看起来聪明”的助手体验，忽略人类最终决策责任。  
**Warning signs:**  
- 用户几乎总是点击“采用推荐”，但事后返工率上升  
- 决策理由文本趋同（模板化）  
- 用户无法解释为什么选了某方案  
**Consequences:** 决策质量下降，产品背负“误导决策”风险。  
**Prevention strategy:**  
- 建议输出必须包含：证据来源、置信度、关键假设、反例场景  
- 默认展示至少两条可行路径与 trade-off，而非单一路径  
- 对高影响决策设置“确认门”（需要用户写下选择理由）  
**Detection:** 追踪“推荐采纳后返工率/回滚率”；高于人工基线即降级推荐强度。  
**Which phase should address it:** `Phase: Decision-Assist UX & Safety Rails`

### Pitfall 4: 失败复盘停留在“记录”，没有进入产品决策（Retrospective Dead End）
**What goes wrong:** 失败博物馆收集了大量错误案例，但没有转化为规则、模板、实验假设。  
**Why it happens:** 复盘流程无 owner、无 action item、无验收时间点。  
**Warning signs:**  
- 复盘文档数量增长，但同类故障重复发生  
- 复盘条目没有明确 owner / due date  
- 周会只复述问题，不跟踪改进动作完成率  
**Consequences:** 用户感知“写报告负担”，平台被视为额外流程工具。  
**Prevention strategy:**  
- 复盘模板强制包含：根因、可执行行动、负责人、完成日期、验证指标  
- 每条高频失败模式必须沉淀为“恢复 playbook”或“预防提示规则”  
- 建立“复盘 -> 产品 backlog”自动映射机制  
**Detection:** 统计“复盘闭环率”（有 action 且按时验证）与“重复错误率”。  
**Which phase should address it:** `Phase: Failure Museum -> Playbook Pipeline`

### Pitfall 5: 增长记忆无生命周期治理，陈旧记忆持续污染建议（Stale Memory Poisoning）
**What goes wrong:** Builder DNA / 人生线把历史决策长期保留，但不区分时效、上下文和可信来源，导致旧结论反复影响新决策。  
**Why it happens:** 把 memory 当日志仓库，而不是“可治理的决策资产”。  
**Warning signs:**  
- 用户反馈“系统总提旧项目背景”  
- 新目标与旧 DNA 冲突时，建议明显跑偏  
- 相同问题在不同阶段给出矛盾建议  
**Consequences:** 决策噪声增大，用户对成长层信任下降。  
**Prevention strategy:**  
- 记忆分层：`immutable facts / hypotheses / expired assumptions`  
- 每条记忆存储 `source, timestamp, confidence, last-validated-at`  
- 引入 TTL 与“验证后续命”机制，过期假设默认降权  
- 人生线视图明确标注“当前有效/历史参考/已失效”  
**Detection:** 监控“建议引用过期记忆占比”与“用户手动纠正记忆频次”。  
**Which phase should address it:** `Phase: Memory Model & Governance`

## Moderate Pitfalls

### Pitfall 6: A/B 实验在样本不足和提前窥探下被误判（Underpowered + Peeking）
**What goes wrong:** 样本很小就下结论，或中途反复看显著性并提前停止。  
**Why it happens:** 交付压力大，实验设计与统计门槛缺失。  
**Warning signs:**  
- 实验运行天数频繁被临时缩短  
- 同一个功能多次“显著”但线上效果不稳定  
- 不报告最小样本量与实验前假设  
**Consequences:** 错误方向被“数据”背书，反复返工。  
**Prevention strategy:**  
- 立项时固定 MDE、样本量、最短观察窗口  
- 默认启用 SRM 检查与数据质量告警  
- 禁止“只看 p-value”，同时审查 effect size 与 guardrail  
**Detection:** 实验报告必须包含 SRM 结果、功效与停表规则；缺任一项不得归档成功。  
**Which phase should address it:** `Phase: Experimentation Governance`

### Pitfall 7: 对所有开发者采用单一闭环策略（No Segmentation by Builder Maturity）
**What goes wrong:** 新手与资深开发者看到同样密度的锚点、分岔和复盘要求，导致一端觉得啰嗦，另一端觉得浅。  
**Why it happens:** 为了快，上线统一流程而不做分层策略。  
**Warning signs:**  
- 新用户流失高，老用户复访也下降  
- 反馈两极化：“太打断” vs “不够深”  
- 功能触发集中在单一人群  
**Consequences:** 成长闭环只对少数人有效，整体留存改善有限。  
**Prevention strategy:**  
- 按 builder maturity 分层：`Starter / Shipping / Scaling`  
- 对不同层级配置不同提示频率与复盘深度  
- 对比“成长功能用户 vs 非成长功能用户”时强制分群分析  
**Detection:** 看分群 GSR、分群留存和分群任务完成率，而非全量均值。  
**Which phase should address it:** `Phase: Adaptive Loop Personalization`

### Pitfall 8: 过早商业化切断价值感知路径（Premature Gating）
**What goes wrong:** 在用户尚未体验到“成长价值”前就把关键闭环能力锁进 Pro。  
**Why it happens:** 收入压力下把“最核心差异化”直接做成硬门槛。  
**Warning signs:**  
- 首次会话到付费页路径很短，但激活率/留存下滑  
- 用户反馈“看不到价值就要付费”  
- Free 用户几乎无法完成最小闭环  
**Consequences:** 用户增长与口碑受损，品牌叙事变空。  
**Prevention strategy:**  
- Free 层保留“可感知完整闭环最小版”（至少一次 goal->decision->retrospective）  
- Pro 强化深度能力（历史、导出、跨会话 DNA），而非基础可用性  
- 把付费触发点放在“已证明价值后”  
**Detection:** 跟踪“首次成长闭环完成率 -> 付费转化率”的漏斗健康度。  
**Which phase should address it:** `Phase: Packaging & Monetization Design`

## Minor Pitfalls

### Pitfall 9: 叙事与功能入口脱节（Narrative-Feature Disconnect）
**What goes wrong:** 品牌讲“builder evolve”，但产品入口仍是“快速生成代码”。  
**Warning signs:** 首页文案强调成长，实际首屏 CTA 不触发成长功能。  
**Prevention strategy:** 每个叙事句都绑定可点击入口与可量化事件。  
**Which phase should address it:** `Phase: Growth Narrative Activation`

### Pitfall 10: 只做季度回顾，不做周级学习循环（Slow Learning Cadence）
**What goes wrong:** 实验和复盘只在季度复盘时集中处理，学习速度慢于产品迭代速度。  
**Warning signs:** 高优先级问题持续 3+ 周无人跟踪。  
**Prevention strategy:** 固定周节奏：实验审查、复盘闭环审查、指标异常审查三会合并。  
**Which phase should address it:** `Phase: Operating Rhythm & Governance`

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Metrics Foundation & GSR Baseline | Vanity Metrics Drift | 指标树 + 行为/结果成对指标 + guardrail 强制 |
| Instrumentation Contract & Data Quality | Unjoinable Loop Data | Tracking Plan、schema 校验、session 回放测试 |
| Decision-Assist UX & Safety Rails | Automation Bias | 证据/置信度/反例展示 + 人类确认门 |
| Failure Museum -> Playbook Pipeline | Retrospective Dead End | 复盘强制 action item 与 owner，闭环率考核 |
| Memory Model & Governance | Stale Memory Poisoning | 记忆分层 + TTL + 来源与时效元数据 |
| Experimentation Governance | Underpowered + Peeking | MDE/样本量前置，SRM 与停表规则强制 |
| Adaptive Loop Personalization | No Segmentation | Builder 分层策略与分群指标 |
| Packaging & Monetization Design | Premature Gating | Free 最小闭环可体验，Pro 提供深度能力 |

## Sources

- Internal product context:  
  - `.planning/PROJECT.md`  
  - `notes/product-plan-lifebegins/07-指标体系与实验设计.md`  
  - `notes/product-plan-lifebegins/08-商业化路径与品牌叙事.md`
- Microsoft Research:  
  - https://www.microsoft.com/en-us/research/articles/diagnosing-sample-ratio-mismatch-in-a-b-testing/  
  - https://www.microsoft.com/en-us/research/articles/patterns-of-trustworthy-experimentation-post-experiment-stage  
  - https://www.microsoft.com/en-us/research/publication/trustworthy-experimentation-under-telemetry-loss/
- Statsig docs (SRM + experiment diagnostics):  
  - https://docs.statsig.com/guides/srm/  
  - https://docs.statsig.com/stats-engine/methodologies/srm-checks/
- Google SRE (postmortem culture):  
  - https://sre.google/sre-book/postmortem-culture/  
  - https://sre.google/workbook/postmortem-culture/
- Tracking plan / data quality governance:  
  - https://www.twilio.com/docs/segment/protocols/tracking-plan/create  
  - https://www.twilio.com/docs/segment/protocols
- Event semantics standardization:  
  - https://opentelemetry.io/docs/specs/semconv/general/events/  
  - https://opentelemetry.io/docs/concepts/semantic-conventions/
- Human oversight risk framing (decision-assist governance):  
  - https://www.nist.gov/itl/ai-risk-management-framework
