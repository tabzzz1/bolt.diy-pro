---
status: diagnosed
phase: 01-governance-safe-rollout
source: [01-01-SUMMARY.md, 01-02-SUMMARY.md]
started: 2026-04-01T12:46:07Z
updated: 2026-04-01T13:10:48Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Stop all app processes, start the app from a clean state, and verify startup succeeds without boot errors while the homepage or a basic health/API request responds normally.
result: pass

### 2. Governance Flags API Defaults
expected: GET /api/governance/flags returns defaults, persisted, and effective values for lifebegins.anchor/fork/failure/timeline/dna with precedence env>persisted>default.
result: pass

### 3. Governance Flag Update Validation
expected: PATCH /api/governance/flags accepts only the five lifebegins boolean keys; invalid keys return 400 and non-GET/PATCH methods return 405.
result: pass

### 4. Disabled Feature Contract
expected: When a lifebegins domain is disabled, guarded calls return HTTP 403 with { error: feature_disabled, feature, message }.
result: pass

### 5. Mainflow Safety with All Growth Off
expected: With all growth flags disabled, the core chat-workbench flow still works and is not blocked by feature_disabled.
result: pass

### 6. FeaturesTab LifeBegins Visibility Toggles
expected: Settings > Features shows five lifebegins toggles and toggling them updates state/feedback without breaking other settings behavior.
result: issue
reported: "没有五个开关，只有LifeBegins Growth domains controlled by governance flags. 下面是空白。"
severity: major

### 7. Growth Export JSON Contract
expected: Export Growth Data downloads one file named lifebegins-growth-data.json containing schema lifebegins.growth.v1 with growth-scoped data only.
result: pass

### 8. Growth Delete Sync Contract
expected: Delete Growth Data completes in one request and returns completed, deletedCount, durationMs, and result; subsequent export shows growth data removed.
result: pass

### 9. Minimal Anonymous Audit
expected: Growth delete audit records only timestamp, action, result, and featureDomain, without any business payload content.
result: pass

## Summary

total: 9
passed: 8
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Settings > Features shows five lifebegins toggles and toggling them updates state/feedback without breaking other settings behavior."
  status: failed
  reason: "User reported: 没有五个开关，只有LifeBegins Growth domains controlled by governance flags. 下面是空白。"
  severity: major
  test: 6
  root_cause: "FeaturesTab 在渲染前对 lifebegins 列表执行 .filter((feature) => feature.enabled)，而五个开关默认值都为 false，导致区块标题显示但开关列表为空。"
  artifacts:
    - path: "app/components/@settings/tabs/features/FeaturesTab.tsx"
      issue: "lifebegins 项按 enabled 过滤，默认 false 被全部隐藏"
    - path: "app/lib/stores/settings.ts"
      issue: "lifebegins 五个开关默认值均为 false"
    - path: "app/lib/hooks/useSettings.ts"
      issue: "状态与 setter 已正确暴露，用于排除接线缺失假设"
  missing:
    - "移除 lifebegins 渲染前的 enabled 过滤，确保五个开关始终可见"
    - "仅使用 enabled 控制 Switch 的 checked 状态，不作为可见性条件"
  debug_session: ".planning/debug/DEBUG-features-tab-lifebegins-switches-missing.md"
