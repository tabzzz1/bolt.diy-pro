---
phase: 1
slug: governance-safe-rollout
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-01
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `package.json` (`scripts.test`) |
| **Quick run command** | `pnpm test -- --runInBand` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~90 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- --runInBand`
- **After every plan wave:** Run `pnpm test`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | METR-02 | unit/integration | `pnpm test` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 1 | METR-03 | integration | `pnpm test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/governance/feature-flags.spec.ts` — stubs for METR-02
- [ ] `tests/governance/data-rights.spec.ts` — stubs for METR-03
- [ ] Existing infrastructure covers framework installation

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Feature disabled UX fallback keeps chat-workbench flow uninterrupted | METR-02 | Needs end-to-end user interaction validation | Disable all growth flags, attempt entry from UI and direct API, verify non-blocking fallback and preserved input/context |
| Export/delete scope is limited to growth domain only | METR-03 | Requires domain-level data inspection in runtime state | Seed mixed legacy+growth data, run export/delete, confirm output and deletion only touch growth namespace |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
