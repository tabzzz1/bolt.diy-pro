---
phase: 01-governance-safe-rollout
plan: 04
subsystem: testing
tags: [governance, vitest, jsdom, regression, settings]
requires:
  - phase: 01-governance-safe-rollout
    provides: "Plan 03 中的 FeaturesTab 可见性与 setter/toast 回归断言基础"
provides:
  - "Node 测试模式可复用的 JSDOM 全局引导与清理工具"
  - "governance-mainflow 在同文件混合 server-only + UI 断言下稳定通过"
  - "METR-02 的治理开关可操作回归具备 4/4 自动化证据"
affects: [METR-02, governance-mainflow, features-tab, lifebegins]
tech-stack:
  added: []
  patterns:
    - "在 Node Vitest 套件中按 describe 粒度手动安装/卸载 JSDOM，而非整文件切换 jsdom 环境"
    - "测试工具统一快照并恢复全局对象，避免跨用例污染"
key-files:
  created:
    - app/routes/__tests__/helpers/jsdom-bootstrap.ts
  modified:
    - app/routes/__tests__/governance-mainflow.spec.ts
key-decisions:
  - "保持 governance-mainflow.spec.ts 运行在 Node 模式，避免破坏 server-only 导入断言。"
  - "仅在 UI describe 中引入 beforeAll/afterAll 的 DOM bootstrap，最小化测试环境影响面。"
patterns-established:
  - "governance 混合回归测试采用 scoped JSDOM 挂载方式保障 server + UI 共存。"
  - "测试辅助工具通过 install/teardown 明确生命周期，避免隐式全局状态残留。"
requirements-completed: [METR-02]
duration: 4min
completed: 2026-04-02
---

# Phase 1 Plan 4: Governance Safe Rollout Summary

**通过 Node 模式下可复用 JSDOM 引导，修复 governance 主链路回归中 UI 断言 `document is not defined`，恢复 4/4 自动化通过。**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-02T08:04:05Z
- **Completed:** 2026-04-02T08:05:56Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- 新增 `jsdom-bootstrap` 测试工具，支持显式安装/恢复 `window`、`document` 等关键全局对象。
- 在 `governance-mainflow.spec.ts` 的 UI describe 中接入 `beforeAll/afterAll`，保持服务端断言继续运行于 Node 模式。
- 重新跑通治理主回归与五开关契约测试：`governance-mainflow.spec.ts` 4/4 通过，`lifebeginsFeatures.spec.ts` 3/3 通过。

## Task Commits

Each task was committed atomically:

1. **Task 1: Add deterministic JSDOM bootstrap helper for Node-mode governance tests** - `855772b` (feat)
2. **Task 2: Wire governance-mainflow UI assertions to JSDOM bootstrap and keep setter/toast coverage** - `8dc808a` (fix)

**Plan metadata:** pending final docs commit

## Files Created/Modified
- `app/routes/__tests__/helpers/jsdom-bootstrap.ts` - Node 环境下安装与卸载 JSDOM 全局对象的测试工具。
- `app/routes/__tests__/governance-mainflow.spec.ts` - 在 UI 回归 describe 中挂载/清理 DOM，保留 setter 与 toast 关键断言。

## Decisions Made
- 保持同一测试文件的服务端断言不变，避免切换 `@vitest-environment jsdom` 导致 server-only 导入约束冲突。
- 使用 describe 级别生命周期（`beforeAll/afterAll`）隔离 UI DOM 依赖，使影响仅限回归断言所在块。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 1 唯一验证阻塞项（`document is not defined`）已关闭。
- `METR-02` 的治理开关可操作回归已具备稳定自动化证据闭环，可继续推进下一阶段。

---
*Phase: 01-governance-safe-rollout*
*Completed: 2026-04-02*

## Self-Check: PASSED
- FOUND: .planning/phases/01-governance-safe-rollout/01-governance-safe-rollout-04-SUMMARY.md
- FOUND COMMIT: 855772b
- FOUND COMMIT: 8dc808a
