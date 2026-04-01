---
phase: 01-governance-safe-rollout
plan: 01
subsystem: api
tags: [governance, feature-flags, remix, vitest, settings]
requires:
  - phase: 01-governance-safe-rollout
    provides: phase context and rollout constraints (D-01~D-08)
provides:
  - server-authoritative growth feature flag resolver
  - governance flags API with security wrapper and key whitelist validation
  - lifebegins visibility switches in settings and mainflow safety regression
affects: [anchor, fork, failure, timeline, dna, rollout-safety]
tech-stack:
  added: []
  patterns:
    - env > persisted > default precedence for governance flags
    - centralized feature_disabled 403 semantics via governance module
    - security-wrapped GET/PATCH governance route contract
key-files:
  created:
    - app/lib/governance/types.ts
    - app/lib/governance/errors.ts
    - app/lib/governance/featureFlags.server.ts
    - app/routes/api.governance.flags.ts
    - app/routes/__tests__/governance-mainflow.spec.ts
  modified:
    - app/routes/__tests__/api.governance.flags.spec.ts
    - app/components/@settings/tabs/features/FeaturesTab.tsx
    - app/lib/hooks/useSettings.ts
    - app/lib/stores/settings.ts
key-decisions:
  - "Use explicit domain enum for lifebegins.* and default all domains to false"
  - "Adopt 403 feature_disabled as the single disabled-feature contract"
  - "Enforce governance flag updates through allowlist validation only"
patterns-established:
  - "Server resolver module is the only place for flag precedence evaluation"
  - "Governance route returns defaults/persisted/effective with explicit precedence metadata"
requirements-completed: [METR-02]
duration: 4min
completed: 2026-04-01
---

# Phase 1 Plan 1: Governance Safe Rollout Summary

**Governance kill-switch backbone shipped with default-off lifebegins domains, security-wrapped flag API, and regression safety for core mainflow.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-01T11:55:17Z
- **Completed:** 2026-04-01T11:59:09Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments
- Built `app/lib/governance/featureFlags.server.ts` as the single authoritative resolver for `lifebegins.anchor/fork/failure/timeline/dna` with `env > persisted > default` precedence.
- Added unified disabled response semantics via `403` + `{ error: "feature_disabled", feature, message }` contract and coverage in route tests.
- Implemented `app/routes/api.governance.flags.ts` with `withSecurity`, GET/PATCH support, key allowlisting, and precedence metadata in response.
- Wired five lifebegins visibility switches into settings store/hook/UI and added `governance-mainflow.spec.ts` regression to ensure core non-growth flow remains usable when all growth domains are off.

## Task Commits

Each task was committed atomically:

1. **Task 1: Build server-authoritative growth feature flag resolver and contracts** - `88ae965` (feat)
2. **Task 2: Implement governance flags route with withSecurity wrapper** - `b299e2d` (feat)
3. **Task 3: Wire front-end visibility switches and regression for main flow safety** - `84ed13b` (feat)

**Plan metadata:** pending final docs commit

## Files Created/Modified
- `app/lib/governance/types.ts` - domain enum and flag contracts.
- `app/lib/governance/errors.ts` - feature-disabled payload/response factory.
- `app/lib/governance/featureFlags.server.ts` - resolver, persisted state handlers, assertion helper.
- `app/routes/api.governance.flags.ts` - governance GET/PATCH route with security wrapper.
- `app/routes/__tests__/api.governance.flags.spec.ts` - resolver + route coverage (GET/PATCH/405/400/403).
- `app/lib/stores/settings.ts` - lifebegins switch persistence atoms and mutators.
- `app/lib/hooks/useSettings.ts` - switch bindings for UI and state updates.
- `app/components/@settings/tabs/features/FeaturesTab.tsx` - LifeBegins switch section and temporary-disabled toast copy.
- `app/routes/__tests__/governance-mainflow.spec.ts` - full-off mainflow safety regression.

## Decisions Made
- Selected explicit domain-level governance keys instead of global switch to match D-02 and enable per-capability rollout.
- Implemented `env > persisted > default` in one shared resolver and reused it in route response shape for deterministic operations.
- Kept disabled semantics stable at `403 feature_disabled` with fixed message for consistent client handling.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Governance baseline is ready for growth-domain API gate integration in subsequent plans.
- Core behavior is covered for precedence, disabled semantics, and full-off mainflow safety.

---
*Phase: 01-governance-safe-rollout*
*Completed: 2026-04-01*
## Self-Check: PASSED
- FOUND: .planning/phases/01-governance-safe-rollout/01-governance-safe-rollout-01-SUMMARY.md
- FOUND COMMIT: 88ae965
- FOUND COMMIT: b299e2d
- FOUND COMMIT: 84ed13b
