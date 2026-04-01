---
phase: 01-governance-safe-rollout
plan: 02
subsystem: api
tags: [governance, data-rights, remix, vitest]
requires:
  - phase: 01-governance-safe-rollout-01
    provides: feature-gate and security wrapper baseline
provides:
  - growth-domain export service with schema-stable JSON payload
  - synchronous growth hard-delete API with minimal anonymous audit metadata
  - settings UI wiring for growth-specific export/delete actions
affects: [phase-02, data-governance, settings-ui]
tech-stack:
  added: []
  patterns: [growth allowlist serialization, synchronous hard-delete contract, minimal audit metadata]
key-files:
  created:
    - app/lib/governance/growthDataRights.server.ts
    - app/lib/governance/audit.server.ts
    - app/lib/governance/__tests__/growth-export.spec.ts
    - app/routes/api.growth.export.ts
    - app/routes/api.growth.delete.ts
    - app/routes/__tests__/api.growth.delete.spec.ts
  modified:
    - app/components/@settings/tabs/data/DataTab.tsx
    - app/lib/hooks/useDataOperations.ts
key-decisions:
  - "Keep growth data rights isolated by explicit allowlist keys, excluding chats/settings/providers."
  - "Use synchronous delete response with completed flag and minimal audit fields only."
patterns-established:
  - "Growth export payload contract: { schema: lifebegins.growth.v1, exportDate, data }"
  - "Growth delete contract: single-request hard delete + anonymous audit append"
requirements-completed: [METR-03]
duration: 6min
completed: 2026-04-01
---

# Phase 01 Plan 02: Growth Data Rights Summary

**Growth-scoped JSON export and synchronous hard-delete pipeline with minimal anonymous governance audit, wired into Settings DataTab actions**

## Performance

- **Duration:** 6min
- **Started:** 2026-04-01T12:04:23Z
- **Completed:** 2026-04-01T12:10:23Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- Implemented `growthDataRights.server.ts` with strict growth-only allowlist and schema marker `lifebegins.growth.v1`.
- Implemented synchronous hard delete with result summary and anonymous audit append (`timestamp/action/result/featureDomain`).
- Added secure growth export/delete routes and connected Settings `DataTab` + `useDataOperations` to growth-specific endpoints.
- Added regression tests for export scope, delete sync contract, and anonymous audit metadata requirements.

## Task Commits

Each task was committed atomically:

1. **Task 1: Build growth-domain data rights service with strict scope allowlist** - `adc5f94` (test), `c3fe857` (feat)
2. **Task 2: Implement growth export/delete routes with synchronous hard-delete contract** - `4e90b69` (test), `f75a8ed` (feat)
3. **Task 3: Wire DataTab and useDataOperations to growth-specific export/delete actions** - `72292ab` (feat)

## Files Created/Modified
- `app/lib/governance/growthDataRights.server.ts` - growth-domain export/delete service and sync delete summary.
- `app/lib/governance/audit.server.ts` - minimal anonymous governance audit event append/list/reset helpers.
- `app/lib/governance/__tests__/growth-export.spec.ts` - growth export + delete contract tests.
- `app/routes/api.growth.export.ts` - secured GET route for growth-only export.
- `app/routes/api.growth.delete.ts` - secured POST route for synchronous growth hard delete.
- `app/routes/__tests__/api.growth.delete.spec.ts` - route-level sync delete and audit metadata tests.
- `app/lib/hooks/useDataOperations.ts` - growth export/delete handlers hitting `/api/growth/export` and `/api/growth/delete`.
- `app/components/@settings/tabs/data/DataTab.tsx` - `Growth Data Rights` UI block with dedicated actions.

## Decisions Made
- Kept growth data rights scoped to explicit allowlist keys to avoid leaking legacy domains.
- Kept delete synchronous and explicit (`completed/deletedCount/durationMs/result`) to satisfy D-11/D-12 contract.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- METR-03 contract is established with tests and UI entry points.
- Ready to consume growth-domain data rights behavior from subsequent growth feature domains.

---
*Phase: 01-governance-safe-rollout*
*Completed: 2026-04-01*

## Self-Check: PASSED
FOUND: .planning/phases/01-governance-safe-rollout/01-governance-safe-rollout-02-SUMMARY.md
FOUND: app/lib/governance/growthDataRights.server.ts
FOUND: app/lib/governance/audit.server.ts
FOUND: app/lib/governance/__tests__/growth-export.spec.ts
FOUND: app/routes/api.growth.export.ts
FOUND: app/routes/api.growth.delete.ts
FOUND: app/routes/__tests__/api.growth.delete.spec.ts
FOUND: commit adc5f94
FOUND: commit c3fe857
FOUND: commit 4e90b69
FOUND: commit f75a8ed
FOUND: commit 72292ab
