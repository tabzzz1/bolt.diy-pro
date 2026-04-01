# Feature Landscape

**Domain:** 开发者成长平台（LifeBegins on bolt.diy-pro）
**Researched:** 2026-04-01

## Table Stakes

这些是该方向下用户会默认期待的基础能力，缺失会直接削弱“成长平台”定位。

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Intent Anchor 基础采集（目标/受众/阶段目标/不做项/成功标准） | 不先定义目标就无法讨论“是否偏航” | Low | 需支持“极速模式”一句话输入，降低首次阻力 |
| Intent Anchor 常驻上下文摘要 | 用户需要随时看到当前边界，避免会话漂移 | Low | 会话内固定可见，不阻塞主链路 |
| 偏航提醒（轻提示） | 成长平台必须能指出“现在在偏离什么” | Med | 默认关键节点触发，避免提示轰炸 |
| Fork Futures A/B 对比卡片（统一维度） | 关键决策要可比，不是“再生成一次” | Med | MVP 先固定六维：时间、复杂度、维护、风险、扩展、学习价值 |
| Fork 决策记录（选了什么/为什么） | 无记录就无法复盘，也无法进入成长资产 | Low | 支持用户编辑理由，降低黑箱感 |
| Failure Museum 自动归档关键错误 | 报错是高频场景，若不沉淀则没有复利 | Med | 只收录“导致中断”的关键失败，先控噪声 |
| Failure 检索与基础分类 | 资产必须可回查才有价值 | Med | 分类建议：依赖/构建/运行时/权限/环境 |
| Life Timeline 关键节点时间线 | 用户需要“过程可见”，不只是最终代码结果 | Med | MVP 仅四类节点：目标/决策/错误/里程碑 |
| Builder DNA 初始化与可关闭 | 个性化是定位核心，但必须尊重用户选择 | Med | 仅偏好标签，不做能力判定；必须可关闭 |
| 会话成长摘要（收尾） | 会话结束应明确“今天沉淀了什么” | Low | 建议统一输出：目标达成、关键选择、失败沉淀、下一步 |

## Differentiators

这些能力是 LifeBegins 相比通用 AI coding assistant 的核心差异化，应优先打磨体验质量。

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| “目标-决策-失败-时间线”闭环串联 | 从一次会话升级为长期成长轨迹，形成迁移成本 | High | 五大模块需共享同一会话/节点标识，避免数据孤岛 |
| Fork 的后验评估（事后验证当初选择） | 把“选方案”从主观判断变成可学习系统 | High | 依赖上线后结果数据回流，建议二阶段落地 |
| Failure 家族聚类 + 复发监测 | 让用户看到“我总在哪些坑里循环” | High | 依赖错误规范化与相似度策略，先规则后智能 |
| DNA 驱动建议风格标注（稳健派/速度派） | 用户感知“工具懂我”，增强身份与归属 | Med | 必须明确为“偏好建议”，非硬约束 |
| 一键导出成长故事（复盘/周报/案例） | 过程可讲述，服务复盘、分享、求职/协作沟通 | Med | 先导出结构化 markdown，再扩展模板 |
| GSR 驱动的功能策略优化 | 把“成长结果”而非时长作为产品迭代方向 | Med | 需在每个核心功能埋点“使用+效果”双指标 |

## Anti-Features

这些方向应明确不做或延后，否则会稀释主线、提升复杂度、损害体验。

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| 强制重表单（每次会话都填完整锚点） | 前置负担过高，会直接抬高流失 | 保留可跳过/极速模式，逐步引导补全 |
| 仅炫技可视化（漂亮但不可回查/不可决策） | 不产生长期资产，违背“效率+沉淀”双目标 | 每个视图必须可追溯到真实节点与行动 |
| 无限分岔树（MVP） | 信息爆炸，决策成本反升 | MVP 固定 A/B 与统一维度，后续再扩展 |
| 全量错误日志收集 | 噪声过高，Failure Museum 会退化为垃圾堆 | 仅收录关键中断错误 + 用户标记高价值案例 |
| DNA 黑箱评分/能力标签 | 易引发被评判感与不信任 | 只做偏好标签，展示依据并提供关闭开关 |
| 复杂团队协作/权限系统（当前里程碑） | 偏离单用户成长闭环验证目标 | 先验证个人成长闭环，再评估团队层扩展 |
| 重构底层 LLM/执行引擎 | 风险高、周期长，影响现有主链路稳定 | 采用 brownfield 增量集成到现有工作台 |
| 为指标而指标（只看点击率） | 会优化错误目标，掩盖真实成长效果 | 统一使用“使用指标 + 效果指标 + 留存关联” |

## Feature Dependencies

```text
Intent Anchor(目标与边界)
  -> Fork Futures(关键路径对比与选择)
  -> Failure Museum(执行中的失败沉淀)
  -> Life Timeline(整合目标/决策/失败/里程碑)
  -> Builder DNA(基于长期行为的偏好校正)

Fork 决策记录 -> Timeline 决策节点 -> 后验评估
Failure 归档 -> Failure 聚类/复发率 -> Timeline 失败节点 -> DNA 校正信号
```

## MVP Recommendation

Prioritize:
1. Intent Anchor（轻量采集 + 会话常驻摘要 + 关键节点偏航提醒）
2. Fork Futures（A/B 对比卡片 + 决策记录）
3. Failure Museum（关键错误自动归档 + 基础检索）
4. Life Timeline（四类关键节点串联）
5. Builder DNA（4 个偏好标签 + 可关闭）

Defer:
- Fork 后验评估：依赖结果回流与更完整埋点，建议在首轮基线稳定后推进。
- Failure 智能预警：依赖高质量错误归一化数据，过早引入会误报。
- 团队 DNA/协作视图：当前目标是先跑通单用户增长闭环。

## Complexity & Dependency Notes for Requirements

| Capability | Complexity | Primary Dependencies | Requirement Hint |
|------------|------------|----------------------|------------------|
| Intent Anchor | Low-Med | 会话初始化入口、上下文注入、轻提醒组件 | 先保证“填得快 + 看得见 + 可纠偏” |
| Fork Futures | Med | 当前上下文快照、统一评估模板、决策持久化 | 要求字段标准化，避免各处口径不一 |
| Failure Museum | Med-High | 终端/预览/工具错误采集、错误分类、检索索引 | 先做关键错误，严控噪声与误收录 |
| Life Timeline | Med | 节点事件模型、跨模块事件聚合、时间线 UI | 先做只读时间线，后做导出与过滤 |
| Builder DNA | Med | 决策与行为事件、偏好模型、透明解释 UI | 必须包含“关闭/重置/解释依据” |

## Sources

- `.planning/PROJECT.md`（HIGH）
- `notes/product-plan-lifebegins/01-产品定位与差异化北极星.md`（HIGH）
- `notes/product-plan-lifebegins/02-用户分层与核心场景地图.md`（HIGH）
- `notes/product-plan-lifebegins/03-功能方案A-初心锚点.md`（HIGH）
- `notes/product-plan-lifebegins/04-功能方案B-分岔人生.md`（HIGH）
- `notes/product-plan-lifebegins/05-功能方案C-失败博物馆.md`（HIGH）
- `notes/product-plan-lifebegins/06-功能方案D-人生线与Builder-DNA.md`（HIGH）
- `notes/product-plan-lifebegins/07-指标体系与实验设计.md`（HIGH）
