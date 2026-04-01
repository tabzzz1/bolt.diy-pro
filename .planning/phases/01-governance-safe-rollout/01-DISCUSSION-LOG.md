# Phase 1: Governance & Safe Rollout - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-01
**Phase:** 01-governance-safe-rollout
**Areas discussed:** 发布开关模型, 关闭时降级策略, 数据导出/删除边界

---

## 发布开关模型

| Option | Description | Selected |
|--------|-------------|----------|
| 双层开关 | 服务端强制开关 + 前端可见性开关 | ✓ |
| 仅前端开关 | 沿用设置页 Switch 显示/隐藏 | |
| 仅服务端开关 | 前端不暴露任何开关入口 | |

**User's choice:** 双层开关
**Notes:** 需要真实 kill switch 能力。

| Option | Description | Selected |
|--------|-------------|----------|
| 按能力域分组 | anchor/fork/failure/timeline/dna 分组开关 | ✓ |
| 单总开关 | lifebegins.enabled 全关全开 | |
| 总开关 + 分组开关 | 两级并存 | |

**User's choice:** 按能力域分组
**Notes:** Phase 1 即建立分域治理能力。

| Option | Description | Selected |
|--------|-------------|----------|
| env 优先 | env > 持久化配置 > 默认值 | ✓ |
| 持久化优先 | 优先应用内配置 | |
| 仅 env | 不做持久化 | |

**User's choice:** env 优先
**Notes:** 事故场景下需可硬切。

| Option | Description | Selected |
|--------|-------------|----------|
| 默认全关 | 新能力默认禁用，逐步灰度开启 | ✓ |
| 默认全开 | 仅异常再关闭 | |
| 预发全开生产全关 | 环境差异策略 | |

**User's choice:** 默认全关
**Notes:** 与 safe rollout 目标一致。

---

## 关闭时降级策略

| Option | Description | Selected |
|--------|-------------|----------|
| 隐藏入口 | 能力关闭时前端不展示入口 | ✓ |
| 显示禁用 | 灰显并提示未启用 | |
| 只读历史 | 可看不可新建 | |

**User's choice:** 隐藏入口
**Notes:** 降低认知噪音。

| Option | Description | Selected |
|--------|-------------|----------|
| 明确拒绝 | 返回 `feature_disabled` 错误语义 | ✓ |
| 静默忽略 | 返回成功但不执行 | |
| 自动降级 | 回退到通用链路 | |

**User's choice:** 明确拒绝
**Notes:** 服务端语义清晰、可观测。

| Option | Description | Selected |
|--------|-------------|----------|
| 轻提示 | toast + 保留上下文，提示回主链路 | ✓ |
| 强弹窗 | 阻断式确认 | |
| 不提示 | 仅日志 | |

**User's choice:** 轻提示
**Notes:** 不打断用户主流程。

| Option | Description | Selected |
|--------|-------------|----------|
| 实时生效 | 不做会话豁免 | ✓ |
| 会话豁免 | 已开启会话继续可用 | |
| 管理员可选豁免 | 手动控制 | |

**User's choice:** 实时生效
**Notes:** 语义一致，减少复杂边界。

---

## 数据导出/删除边界

| Option | Description | Selected |
|--------|-------------|----------|
| 仅 growth 域 | 仅覆盖新增成长数据 | ✓ |
| 全量产品数据 | 覆盖聊天/设置等全部 | |
| 仅导出不删除 | 先不做删除权 | |

**User's choice:** 仅 growth 域
**Notes:** 限定范围，降低 Phase 1 风险。

| Option | Description | Selected |
|--------|-------------|----------|
| JSON 单文件 | 结构化导出 | ✓ |
| JSON + Markdown | 机读 + 人读组合 | |
| CSV 多文件 | 面向分析导出 | |

**User's choice:** JSON 单文件
**Notes:** 先满足最小可用权利闭环。

| Option | Description | Selected |
|--------|-------------|----------|
| 硬删除 | 即时彻底删除 | ✓ |
| 软删除 30 天 | 支持恢复 | |
| 混合模式 | 用户可选 | |

**User's choice:** 硬删除
**Notes:** 策略清晰，避免恢复边界复杂化。

| Option | Description | Selected |
|--------|-------------|----------|
| 同步结果+最小审计 | 返回成功/失败 + 匿名元数据审计 | ✓ |
| 异步受理 | 稍后通知结果 | |
| 无审计 | 只删除不留痕 | |

**User's choice:** 同步结果+最小审计
**Notes:** 平衡权利可执行性与审计需要。

## the agent's Discretion

- `feature_disabled` 的具体 status code 与响应字段。
- 轻提示组件组合与具体文案。
- 分域开关的配置命名与存储实现细节。

## Deferred Ideas

None.
