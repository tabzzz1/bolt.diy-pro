---
phase: 01-governance-safe-rollout
plan: 03
subsystem: ui
tags: [governance, settings, features, vitest, regression]
requires:
  - phase: 01-governance-safe-rollout
    provides: domain-level governance switches and settings wiring from Plan 01
provides:
  - lifebegins switch-list contract that always returns five domains
  - features tab rendering fix so disabled flags do not hide governance switches
  - automated regression coverage for UAT Test 6 visibility and toggle behavior
affects: [METR-02, governance-mainflow, features-tab, lifebegins]
tech-stack:
  added: []
  patterns:
    - extract stable list-building logic into pure helper for deterministic visibility behavior
    - keep enabled as checked-state only, never as render filter for governance controls
key-files:
  created:
    - app/components/@settings/tabs/features/lifebeginsFeatures.ts
    - app/components/@settings/tabs/features/lifebeginsFeatures.spec.ts
  modified:
    - app/components/@settings/tabs/features/FeaturesTab.tsx
    - app/routes/__tests__/governance-mainflow.spec.ts
key-decisions:
  - "Use buildLifeBeginsFeatures pure helper to stabilize 5-switch rendering contract."
  - "Run FeaturesTab UI regression in Node tests with manual JSDOM mounting to keep server-only imports valid."
patterns-established:
  - "Governance switch visibility contracts are tested independently from UI event plumbing."
  - "FeaturesTab renders governance domains from helper output without enabled-based filtering."
requirements-completed: [METR-02]
duration: 5min
completed: 2026-04-01
---

# Phase 1 Plan 3: Governance Safe Rollout Summary

**Fixed LifeBegins governance switch visibility regression so all five toggles remain operable even when defaults are all off.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-01T13:26:57Z
- **Completed:** 2026-04-01T13:32:07Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Added `buildLifeBeginsFeatures` pure builder and locked the non-filtering visibility contract with dedicated tests.
- Refactored `FeaturesTab` to consume helper output and removed enabled-based visibility filtering.
- Added governance regression tests that verify all-false rendering plus existing setter/toast behavior remains intact.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add visibility-regression contract for LifeBegins switch list** - `3dd89a1` (test), `031916e` (feat)
2. **Task 2: Refactor FeaturesTab to render all LifeBegins switches regardless of enabled state** - `38f3e70` (test), `2d3ea72` (fix)

**Plan metadata:** pending final docs commit

## Files Created/Modified
- `app/components/@settings/tabs/features/lifebeginsFeatures.ts` - pure 5-item domain switch builder.
- `app/components/@settings/tabs/features/lifebeginsFeatures.spec.ts` - contract tests for visibility and enabled-state mapping.
- `app/components/@settings/tabs/features/FeaturesTab.tsx` - switched to helper-based lifebegins rendering and removed visibility filter.
- `app/routes/__tests__/governance-mainflow.spec.ts` - added UI regression coverage for all-false rendering and toggle wiring.

## Decisions Made
- Keep governance control visibility deterministic by moving list assembly to a pure helper function.
- Preserve existing toggle handler semantics (`setLifeBegins*` + toast) while changing only rendering visibility logic.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Resolved jsdom/client-mode conflict with server-only imports in governance regression test**
- **Found during:** Task 2 (RED test setup)
- **Issue:** `@vitest-environment jsdom` caused Remix to treat the test file as client-side and reject `*.server` imports already used by existing governance tests.
- **Fix:** Kept Node test mode and mounted JSDOM manually in the new UI regression describe block.
- **Files modified:** `app/routes/__tests__/governance-mainflow.spec.ts`
- **Verification:** `pnpm test -- app/components/@settings/tabs/features/lifebeginsFeatures.spec.ts app/routes/__tests__/governance-mainflow.spec.ts`
- **Committed in:** `38f3e70` (part of Task 2 TDD RED commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** No scope creep; fix was required to keep existing governance tests and add the new UI regression in the same suite.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- UAT Test 6 regression condition is now covered by automated tests.
- Settings > Features keeps all five LifeBegins governance toggles visible and operable when defaults are all off.

---
*Phase: 01-governance-safe-rollout*
*Completed: 2026-04-01*
## Self-Check: PASSED
- FOUND: .planning/phases/01-governance-safe-rollout/01-governance-safe-rollout-03-SUMMARY.md
- FOUND COMMIT: 3dd89a1
- FOUND COMMIT: 031916e
- FOUND COMMIT: 38f3e70
- FOUND COMMIT: 2d3ea72
