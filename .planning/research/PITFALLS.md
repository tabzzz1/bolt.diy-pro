# Domain Pitfalls

**Domain:** 面向编码助手的行为分析、长期记忆与决策支持（LifeBegins）
**Researched:** 2026-04-01

## Critical Pitfalls

### Pitfall 1: 指标驱动错位（优化点击率，牺牲成长结果）
**What goes wrong:** 团队为了抬高“功能使用率/点击率”，引入强打断流程，短期数据上升但会话完成率、留存与真实成长质量下降。  
**Why it happens:** 把埋点当目标本身；缺少“使用指标 + 效果指标 + 留存指标”的联动判读。  
**Consequences:** 方向误判，产品看似“更活跃”但用户感知变差，后续需要回滚交互。  
**Prevention:**  
- 统一采用三层指标闸门：`使用率`、`结果质量`、`留存/复访`必须同时过线。  
- 所有实验提前定义 guardrail（流失率、完成率、会话时长异常）。  
- 在 roadmap 中先建设事件字典与口径治理，再扩实验数量。  
**Detection (warning signs):**  
- 初心填写率上升但任务完成率下降。  
- 分岔功能使用率上升但“决策清晰度”主观评分下降。  
- GSR 上升但 7/30 天留存没有同步改善。  

### Pitfall 2: 记忆污染与错误固化（Memory Drift）
**What goes wrong:** 系统把临时偏好、错误结论、过时上下文写入长期记忆，后续建议持续偏航。  
**Why it happens:** 缺少记忆分层（短期/长期）、置信度与过期策略；缺少用户可审计与一键修正入口。  
**Consequences:** 用户信任快速下降；“个性化”变成“持续误导”；后期清洗成本很高。  
**Prevention:**  
- 记忆分层：会话记忆、项目记忆、用户偏好记忆分开存储与加载。  
- 仅写入“高置信、重复出现”的偏好信号；低置信信号先缓冲不固化。  
- 提供可见记忆面板（查看、编辑、禁用、重置），并记录变更审计日志。  
- 为每条记忆配置 TTL/过期重评机制。  
**Detection (warning signs):**  
- 用户频繁手动纠正“我不是这样偏好”。  
- 同类任务中建议风格长期与用户选择相反。  
- 记忆命中率上升但接受率/采纳率下降。  

### Pitfall 3: 失败博物馆噪声失控（Signal-to-Noise Collapse）
**What goes wrong:** 所有日志都被归档，失败库迅速膨胀为“垃圾堆”，检索命中率和复用价值下降。  
**Why it happens:** 没有“关键失败”定义；没有去重、归一化与合并策略。  
**Consequences:** 用户不再使用失败库；系统提示误报增多；后续模型训练样本被污染。  
**Prevention:**  
- 只收录“导致中断”的关键错误，非阻断日志默认不入库。  
- 建立错误规范化 pipeline：去动态字段（路径、行号、时间戳）后聚类。  
- 支持用户合并/删除记录并反馈“误归档”。  
- 每周做“高噪声来源”巡检，持续下调低价值采集源。  
**Detection (warning signs):**  
- 错误归档量快速增长但检索点击率下滑。  
- “重复错误率”指标不降反升。  
- 用户主动清理记录比例上升。  

### Pitfall 4: 决策支持过度自动化（Automation Bias）
**What goes wrong:** 用户盲目采纳系统推荐方案，忽略关键约束（成本、风险、可维护性），导致错误决策被放大。  
**Why it happens:** 推荐结果缺少不确定性表达、证据链与备选解释；界面暗示“唯一正确答案”。  
**Consequences:** 关键架构决策质量下降，返工成本上升，产品需承担“误导责任”争议。  
**Prevention:**  
- 决策卡必须展示：评分依据、权重、假设边界、置信度。  
- 默认同时呈现 A/B 方案及“何时不该选我”的反例。  
- 对高影响决策增加“人工确认 + 复核问题清单”。  
**Detection (warning signs):**  
- 单一路径被压倒性选择，但事后重构率上升。  
- 用户在复盘中无法解释“为什么当时这样选”。  
- 系统建议采纳率高，但目标达成率不升反降。  

### Pitfall 5: 隐私与安全边界缺失（行为数据+记忆+日志串联泄露）
**What goes wrong:** 行为埋点、错误日志和记忆内容交叉后泄露敏感信息（密钥、业务数据、个人偏好），或被提示注入利用。  
**Why it happens:** 默认全量采集；缺少脱敏策略、字段级访问控制与跨边界注入防护。  
**Consequences:** 合规风险、信任危机、上线受阻；严重时触发安全事件。  
**Prevention:**  
- 数据最小化：默认不采集秘密值与正文原文，敏感字段先哈希/脱敏。  
- 路由级鉴权与最小权限访问（尤其导出、查询、分享端点）。  
- 记忆写入前执行安全过滤（PII、密钥模式、注入 payload 特征）。  
- 建立“可删除/可导出/可关闭个性化”用户权利通道。  
**Detection (warning signs):**  
- 日志中出现 token、邮箱、私有 URL 等明文。  
- 导出接口调用异常增长或来源异常。  
- 安全扫描出现 prompt injection / data exfiltration 告警。  

### Pitfall 6: 发布治理缺失（无可靠 feature flag + kill switch）
**What goes wrong:** 新能力无法按人群/环境灰度发布，出问题时无法秒级熔断，只能回滚整包。  
**Why it happens:** Feature flag 仅 mock；缺失持久化、审计、owner、过期治理。  
**Consequences:** 实验可信度低；事故恢复慢；功能债务累积。  
**Prevention:**  
- 先补齐真正可用的 flag 平台（环境、用户、实验组、百分比发布）。  
- 每个 flag 强制 owner、到期时间、清理任务。  
- CI 覆盖 flag on/off 双路径。  
**Detection (warning signs):**  
- 同一功能在不同环境表现不一致且无法解释。  
- 事故时无法快速关闭单一风险功能。  
- 长期存在“永不删除”的实验开关。  

## Moderate Pitfalls

### Pitfall 1: 事件模型碎片化（命名口径不统一）
**What goes wrong:** 同一概念多种事件名/属性格式，跨模块无法串联用户旅程。  
**Prevention:** 建立事件字典与版本化 schema，新增事件必须过评审。  

### Pitfall 2: 高基数埋点导致可观测性成本失控
**What goes wrong:** 把会话全文、路径、错误原文直接作为标签维度，存储与查询成本暴涨。  
**Prevention:** 高基数字段仅作为日志正文或 opt-in 属性，不进入核心聚合维度。  

### Pitfall 3: 解释层与执行层耦合
**What goes wrong:** 决策解释逻辑直接嵌入工作台执行状态机，后续迭代易引入回归。  
**Prevention:** 拆分“执行事实采集”与“解释生成”边界，通过事件总线解耦。  

## Minor Pitfalls

### Pitfall 1: 复盘交互负担过重
**What goes wrong:** 每次错误后都要求完整复盘输入，用户疲劳并跳过。  
**Prevention:** 默认一句话备注 + 周末批量补记模式。

### Pitfall 2: 品牌叙事脱离功能入口
**What goes wrong:** 宣传“成长平台”但界面无可感知证据链，用户认为是包装。  
**Prevention:** 每条叙事必须绑定对应功能入口与可见结果。

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Warning Signs | Mitigation |
|-------------|---------------|---------------|------------|
| Phase 1: Data/Foundation（埋点、鉴权、feature flag） | 指标口径漂移 + 发布不可控 | 指标看板口径频繁变更；无法按 cohort 灰度 | 先做 schema registry、flag 持久化、路由鉴权基线 |
| Phase 2: Failure Museum MVP | 噪声归档压垮可用性 | 归档量暴涨、检索命中下降 | 只收录关键中断错误 + 归一化聚类 + 用户合并删除 |
| Phase 3: Builder DNA / Memory | 记忆污染与隐私风险 | 用户频繁纠偏、投诉“被误解” | 分层记忆、TTL、可审计/可重置、敏感信息过滤 |
| Phase 4: Fork Futures / 决策支持 | 自动化偏见导致错误决策 | 推荐采纳率高但重构率上升 | 展示置信度与反例，关键决策强制人工确认 |
| Phase 5: Growth & Monetization（导出/分享/Pro） | 合规与信任赤字 | 导出接口异常调用、分享后投诉 | 数据最小化、权限隔离、可撤回与审计日志 |

## Sources

Internal (HIGH):
- `.planning/PROJECT.md`
- `.planning/codebase/CONCERNS.md`
- `notes/product-plan-lifebegins/05-功能方案C-失败博物馆.md`
- `notes/product-plan-lifebegins/07-指标体系与实验设计.md`
- `notes/product-plan-lifebegins/08-商业化路径与品牌叙事.md`

External:
- NIST AI Risk Management Framework 1.0 (HIGH): https://www.nist.gov/itl/ai-risk-management-framework
- OpenTelemetry Semantic Conventions: attribute requirement levels / high-cardinality guidance (HIGH): https://opentelemetry.io/docs/specs/semconv/general/attribute-requirement-level/
- OWASP Top 10 for LLM Applications 2025 (MEDIUM-HIGH): https://genai.owasp.org/
- EchoLeak (CVE-2025-32711) zero-click prompt injection case study (MEDIUM): https://arxiv.org/abs/2509.10540
- EU AI Act timeline and GPAI obligations (MEDIUM): https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai
- Claude Code memory model and scope controls (MEDIUM): https://code.claude.com/docs/en/memory

