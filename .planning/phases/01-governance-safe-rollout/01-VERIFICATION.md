---
phase: 01-governance-safe-rollout
verified: 2026-04-01T15:21:40Z
status: gaps_found
score: 8/9 must-haves verified
gaps:
  - truth: "切换任一 lifebegins 开关仍能走既有 setter 与 toast 反馈，不破坏其他设置项。"
    status: failed
    reason: "`app/routes/__tests__/governance-mainflow.spec.ts` 在默认 Node 环境执行 React 渲染断言时报 `document is not defined`，该行为无法通过自动化回归确认。"
    artifacts:
      - path: "app/routes/__tests__/governance-mainflow.spec.ts"
        issue: "同一测试文件混合 server-only 导入与 DOM 渲染断言，当前测试命令下 UI 断言不可运行。"
    missing:
      - "将 UI 渲染断言拆分到可运行的 jsdom 测试文件，或在该文件内建立稳定 DOM bootstrap。"
      - "确保 `pnpm test -- app/routes/__tests__/governance-mainflow.spec.ts` 全量通过并覆盖 setter + toast 行为。"
---

# Phase 1: Governance & Safe Rollout Verification Report

**Phase Goal:** 新能力在不破坏主链路前提下可被灰度启停，并具备最小数据治理边界  
**Verified:** 2026-04-01T15:21:40Z  
**Status:** gaps_found  
**Re-verification:** No — initial-mode refresh (previous verification had no `gaps` section)

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | 运营可按能力域独立启停 lifebegins.anchor/fork/failure/timeline/dna，并默认全关。 | ✓ VERIFIED | `app/lib/governance/featureFlags.server.ts:14-27,101-130` 定义五域与默认全关，`app/routes/api.governance.flags.ts:50-95` 提供 GET/PATCH。 |
| 2 | 服务端在功能关闭时返回一致的 feature_disabled 拒绝语义，不静默放行。 | ✓ VERIFIED | `app/lib/governance/errors.ts:3-25` 与 `app/lib/governance/featureFlags.server.ts:133-136`；断言见 `app/routes/__tests__/api.governance.flags.spec.ts:54-76`。 |
| 3 | 即使所有 growth 开关关闭，原有聊天-工作台主链路仍可正常使用。 | ✓ VERIFIED | `app/routes/__tests__/governance-mainflow.spec.ts:76-86` 非 growth 主链路断言通过（同次测试运行中该用例通过）。 |
| 4 | 用户可导出 growth 域数据，导出格式为单个 JSON 文件。 | ✓ VERIFIED | API: `app/routes/api.growth.export.ts:5-23`；下载文件名: `app/lib/hooks/useDataOperations.ts:1053-1081` (`lifebegins-growth-data.json`)；入口: `app/components/@settings/tabs/data/DataTab.tsx:640-679`。 |
| 5 | 用户可同步删除 growth 域数据，删除后不保留业务可恢复副本。 | ✓ VERIFIED | API 同步返回: `app/routes/api.growth.delete.ts:28-36`；服务端清空所有 growth key: `app/lib/governance/growthDataRights.server.ts:75-79`；路由测试 `app/routes/__tests__/api.growth.delete.spec.ts:36-66`。 |
| 6 | 删除流程仅记录最小匿名审计元数据（时间、动作、结果、域），不记录业务内容。 | ✓ VERIFIED | 审计结构: `app/lib/governance/audit.server.ts:3-18`；删除调用: `app/lib/governance/growthDataRights.server.ts:92-96`；无 payload 断言: `app/routes/__tests__/api.growth.delete.spec.ts:83-93`。 |
| 7 | Settings > Features 的 LifeBegins 区域在默认全关时仍显示 5 个开关。 | ✓ VERIFIED | `buildLifeBeginsFeatures` 固定输出 5 项 `app/components/@settings/tabs/features/lifebeginsFeatures.ts:17-60`，并在 `FeaturesTab` 使用 `app/components/@settings/tabs/features/FeaturesTab.tsx:295-334`；契约测试通过 `lifebeginsFeatures.spec.ts:5-15`。 |
| 8 | 开关的 on/off 仅影响 Switch checked 状态，不再影响开关卡片是否渲染。 | ✓ VERIFIED | `FeaturesTab` 已移除 enabled 过滤，直接 `features.map(...)` 渲染 `app/components/@settings/tabs/features/FeaturesTab.tsx:107-111,295-301`；混合 true/false 仍返回 5 项见 `lifebeginsFeatures.spec.ts:36-49`。 |
| 9 | 切换任一 lifebegins 开关仍能走既有 setter 与 toast 反馈，不破坏其他设置项。 | ✗ FAILED | 目标断言位于 `app/routes/__tests__/governance-mainflow.spec.ts:136-150`，但执行 `pnpm test -- app/routes/__tests__/governance-mainflow.spec.ts` 时失败：`document is not defined`（UI 断言未实际执行）。 |

**Score:** 8/9 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `app/lib/governance/featureFlags.server.ts` | env > persisted > default resolver | ✓ VERIFIED | 存在、逻辑完整、被路由与测试使用。 |
| `app/routes/api.governance.flags.ts` | Governance flags read/write API | ✓ VERIFIED | GET/PATCH + withSecurity + allowlist。 |
| `app/components/@settings/tabs/features/FeaturesTab.tsx` | LifeBegins 开关渲染与切换入口 | ✓ VERIFIED | 使用 `useSettings` 与 `buildLifeBeginsFeatures`，无 enabled 可见性过滤。 |
| `app/routes/__tests__/api.governance.flags.spec.ts` | METR-02 route/contract regression | ✓ VERIFIED | 7 个测试全部通过。 |
| `app/routes/api.growth.export.ts` | Growth-only export API | ✓ VERIFIED | 路由调用 growth 服务并返回 JSON。 |
| `app/routes/api.growth.delete.ts` | Sync hard-delete API | ✓ VERIFIED | POST 同步完成并返回 completed/deletedCount/durationMs/result。 |
| `app/lib/governance/growthDataRights.server.ts` | Growth scope export/delete service | ⚠️ HOLLOW | 连线完整，但数据源为内存 `growthDataStore`（`line 22`），非持久层。 |
| `app/routes/__tests__/api.growth.delete.spec.ts` | METR-03 delete/audit regression | ✓ VERIFIED | 4 个测试通过。 |
| `app/components/@settings/tabs/features/lifebeginsFeatures.ts` | 固定五开关构造契约 | ✓ VERIFIED | 纯函数固定返回五域。 |
| `app/components/@settings/tabs/features/lifebeginsFeatures.spec.ts` | 默认全关仍显示五项回归测试 | ✓ VERIFIED | 3 个测试通过。 |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `app/routes/api.governance.flags.ts` | `app/lib/governance/featureFlags.server.ts` | `resolveGrowthFeatureFlags/assertGrowthFeatureEnabled` | ✓ WIRED | `api.governance.flags.ts:8-11,51,85` 直接调用。 |
| `app/components/@settings/tabs/features/FeaturesTab.tsx` | `app/lib/hooks/useSettings.ts` | LifeBegins capability switches state binding | ✓ WIRED | `FeaturesTab.tsx:5,118-139,206-233` + `useSettings.ts:101-105,171-194,250-259`。 |
| `app/routes/api.growth.export.ts` | `app/lib/governance/growthDataRights.server.ts` | `exportGrowthDomainData` | ✓ WIRED | `api.growth.export.ts:2,7`。 |
| `app/routes/api.growth.delete.ts` | `app/lib/governance/audit.server.ts` | `appendGovernanceAuditEvent` | ✓ WIRED (indirect) | 路由调用 `deleteGrowthDomainData` (`api.growth.delete.ts:2,29`)，服务再写审计 (`growthDataRights.server.ts:92-96`)。 |
| `app/components/@settings/tabs/data/DataTab.tsx` | `app/routes/api.growth.export.ts + api.growth.delete.ts` | `useDataOperations` growth actions | ✓ WIRED | DataTab 挂载 handlers (`DataTab.tsx:124-125,659,700`)；hook 调用 API (`useDataOperations.ts:1057,1104`)。 |
| `app/components/@settings/tabs/features/FeaturesTab.tsx` | `app/components/@settings/tabs/features/lifebeginsFeatures.ts` | `buildLifeBeginsFeatures` | ✓ WIRED | `FeaturesTab.tsx:10,295-301`。 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `app/components/@settings/tabs/features/FeaturesTab.tsx` | `features.lifebegins[].enabled` | `useSettings` -> nanostore/localStorage (`useSettings.ts`, `settings.ts`) | Yes | ✓ FLOWING |
| `app/components/@settings/tabs/data/DataTab.tsx` | `handleExportGrowthData/handleDeleteGrowthData` | `useDataOperations` fetch `/api/growth/export` + `/api/growth/delete` | Yes | ✓ FLOWING |
| `app/lib/governance/growthDataRights.server.ts` | `growthDataStore` | module-level in-memory store | No persistent source | ⚠️ STATIC |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Governance precedence + feature_disabled contract | `pnpm test -- app/routes/__tests__/api.governance.flags.spec.ts` | 7/7 passed | ✓ PASS |
| Growth export/delete service contract | `pnpm test -- app/lib/governance/__tests__/growth-export.spec.ts` | 3/3 passed | ✓ PASS |
| Growth delete route + minimal audit | `pnpm test -- app/routes/__tests__/api.growth.delete.spec.ts` | 4/4 passed | ✓ PASS |
| LifeBegins 5-switch visibility contract | `pnpm test -- app/components/@settings/tabs/features/lifebeginsFeatures.spec.ts` | 3/3 passed | ✓ PASS |
| Governance mainflow + UI toggle regression | `pnpm test -- app/routes/__tests__/governance-mainflow.spec.ts` | 2 passed / 2 failed (`document is not defined`) | ✗ FAIL |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| METR-02 | `01-01-PLAN.md`, `01-03-PLAN.md` | 新能力通过 feature flag 控制，支持快速回滚 | ✗ BLOCKED | 核心开关与路由实现存在；但用于验证开关可操作回归的 `governance-mainflow.spec.ts` 当前执行失败，自动化闭环未成立。 |
| METR-03 | `01-02-PLAN.md` | 用户数据支持最小化采集与导出/删除能力边界 | ✓ SATISFIED | Growth 导出/删除路由、最小审计结构与测试均通过（`api.growth.export.ts`, `api.growth.delete.ts`, `growthDataRights.server.ts`, `api.growth.delete.spec.ts`, `growth-export.spec.ts`）。 |

Orphaned requirements check (Phase 1): none. `REQUIREMENTS.md` 对应 `Phase 1` 的 ID 仅 `METR-02`、`METR-03`，且均在 plan frontmatter 中声明。

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `app/routes/__tests__/governance-mainflow.spec.ts` | 127 | 在 Node 测试环境直接执行 RTL `render`（缺少 DOM） | 🛑 Blocker | 造成 `document is not defined`，阻断回归测试可执行性。 |
| `app/lib/governance/growthDataRights.server.ts` | 22 | `growthDataStore` 为内存态数据源 | ⚠️ Warning | 导出/删除契约可用，但非持久化，不适合长期数据留存。 |

### Human Verification Required

### 1. Features Toggle Runtime Check

**Test:** 进入 `Settings > Features`，确认 LifeBegins 五开关默认全关时可见并可切换。  
**Expected:** 五个开关均显示；切换后有成功提示且其他设置项行为不受影响。  
**Why human:** 当前自动化回归套件该用例因测试环境问题失败，需人工补充确认。

### Gaps Summary

Phase 1 大部分 must_haves 已落地并连线完成；`METR-03` 自动化证据完整。当前唯一阻塞缺口是 gap-closure 回归测试文件 `governance-mainflow.spec.ts` 的执行环境不一致（Node 下跑 DOM 断言），导致关键“开关切换行为”无法被自动化验证。该问题优先级高，修复后应重新运行本 phase 验证。

---

_Verified: 2026-04-01T15:21:40Z_  
_Verifier: Claude (gsd-verifier)_
