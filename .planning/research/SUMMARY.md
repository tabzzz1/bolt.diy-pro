# Project Research Summary

**Project:** LifeBegins on bolt.diy-pro  
**Domain:** Developer growth platform layered on an existing AI coding workbench  
**Researched:** 2026-04-01  
**Confidence:** HIGH

## Executive Summary

LifeBegins should be built as a brownfield upgrade to `bolt.diy-pro`, not a platform rewrite. The strongest expert consensus across stack, feature, and architecture research is to keep the current Remix/React/Cloudflare/Electron foundation and add growth capabilities as an event-first sidecar domain: capture behavior first, project into Timeline/Failure/DNA views second, and only then introduce advisory decision intelligence. This preserves existing delivery performance while creating compounding user memory assets.

The recommended approach is phased and dependency-driven: start with data/event governance plus safe release controls, then ship table-stakes growth experiences (Intent Anchor, Fork A/B, Failure Museum MVP, Life Timeline MVP), then expand to differentiators (post-hoc fork evaluation, failure family recurrence, DNA-driven adaptation), and finally monetization/export flows. This sequencing matches technical dependencies (event schema -> projections -> advice/personalization) and reduces rework.

The biggest risks are metric misalignment, memory drift, noisy failure ingestion, automation bias, and privacy leakage. Mitigation is explicit: three-layer metric gates (usage + outcome + retention), memory TTL and user-auditable controls, “critical failure only” ingestion with normalization, advisory-only recommendations with confidence/assumptions, and strict data minimization plus route-level access control.

## Key Findings

### Recommended Stack

Research strongly supports continuing the existing runtime model and extending it with typed domain persistence and async processing. Use D1 as the only source of truth, KV only as cache, R2 for export artifacts, and Queues for heavy/offline growth jobs.

**Core technologies:**
- `Remix 2.15.x` + `React 18` + `TypeScript 5.7+ strict`: lowest-risk extension path with strong domain typing.
- `Cloudflare D1`: canonical relational store for anchors, forks, failures, timeline events, and DNA records.
- `Cloudflare Queues`: async enrichment/recalculation to keep chat latency stable.
- `Cloudflare KV` / `R2`: read cache and export artifact storage, not primary business source.
- `drizzle-orm` + `zod`: typed schema evolution and runtime boundary validation.

**Critical version/implementation constraints:**
- Keep compatibility with future React Router v7 migration, but do not block feature delivery on migration.
- Preserve one API surface (`/api/lifebegins/*` style) shared by Web and Electron.
- Keep fork scoring deterministic in server logic; LLM only explains/suggests.

### Expected Features

**Must have (table stakes):**
- Intent Anchor lightweight capture + persistent context summary + gentle drift reminders.
- Fork Futures A/B comparison with fixed dimensions and decision rationale recording.
- Failure Museum MVP: critical-interrupt failures only, searchable with base categories.
- Life Timeline MVP: unified goal/decision/failure/milestone nodes.
- Builder DNA v1: preference labels only, transparent basis, opt-out supported.
- Session-end growth summary (what was achieved/decided/learned/next).

**Should have (major differentiators):**
- Closed loop from goal -> decision -> failure -> timeline (shared IDs across modules).
- Fork post-hoc evaluation (decision quality learns from outcomes).
- Failure family clustering and recurrence tracking.
- DNA-driven suggestion style adaptation (advisory, not hard control).
- One-click growth story export (starting with structured Markdown).

**Defer (v2+):**
- Team collaboration/permission complexity.
- Unlimited fork trees and heavy visual-only interactions.
- Full intelligent failure prediction before high-quality normalized data exists.
- Deep engine rewrite or separate microservice backend.

### Architecture Approach

Adopt “main-path non-intrusive + sidecar ingestion + phased coupling”: do not block `api.chat` streaming path with synchronous growth writes, keep growth state separate from `workbenchStore`, and build an event-first schema with projections for timeline/museum/GSR before automation.

**Major components:**
1. `lifebegins` UI modules: Anchor/Fork/Timeline/Museum surfaces.
2. Growth event/repository/projection layer: capture domain events and build read models.
3. Advisory decision service: rule-first recommendations using projected history.
4. Minimal chat integration points: fire-and-forget event emission at key lifecycle hooks.

### Critical Pitfalls

1. **Metric optimization drift** — enforce usage/outcome/retention triple-gate + guardrails before scaling experiments.  
2. **Memory drift and wrong long-term personalization** — memory layering, confidence thresholds, TTL, user edit/reset/audit controls.  
3. **Failure Museum noise collapse** — ingest only interrupting errors, normalize/deduplicate, allow user merge/delete feedback.  
4. **Automation bias in decision support** — show evidence, assumptions, confidence, and “when not to choose this”; require explicit user confirmation for high-impact decisions.  
5. **Privacy/security leakage across memory/logs/events** — data minimization, sensitive-field filtering, route-level auth, export/delete rights, and injection-aware sanitization.

## Implications for Roadmap

Based on combined research, the recommended build order is:

### Phase 1: Foundation & Governance
**Rationale:** All later phases depend on consistent events, safe rollout, and data safety.  
**Delivers:** event dictionary/schema versioning, feature flags + kill switch, auth baseline, telemetry guardrails, D1/KV/R2/Queues wiring.  
**Addresses:** GSR-ready instrumentation and reliable release control.  
**Avoids:** metric drift, unrecoverable rollout failures, privacy boundary gaps.

### Phase 2: Passive Capture + Table Stakes MVP
**Rationale:** Value must be visible quickly without touching core chat execution semantics.  
**Delivers:** Intent Anchor MVP, Fork A/B + decision record, critical-error Failure Museum ingestion + search, Timeline core nodes, session growth summary.  
**Addresses:** all minimum table-stakes growth capabilities.  
**Avoids:** main-path latency regressions and failure-noise overload.

### Phase 3: Read Models & Advisory Intelligence
**Rationale:** Differentiators require historical projections, not raw event streams.  
**Delivers:** timeline/failure/GSR projections, advisory decision engine, initial DNA preference calibration with transparency controls.  
**Implements:** event-first projection pattern and advisory-only decision pattern.  
**Avoids:** premature automation and opaque recommendation behavior.

### Phase 4: Differentiator Hardening
**Rationale:** After stable baseline and sufficient data density, invest in compounding moat features.  
**Delivers:** fork post-hoc evaluation, failure family clustering + recurrence alerts, DNA-driven style adaptation improvements, richer narrative exports.  
**Addresses:** major product differentiation and retention loops.  
**Avoids:** weak-signal personalization and false-confidence intelligence.

### Phase 5: Growth Loops & Commercial Surfaces
**Rationale:** Monetization/sharing features are highest-risk for trust/compliance and should follow core-value proof.  
**Delivers:** export/share/pro-tier packaging, rights-management flows (delete/export/disable personalization), experiment scale-up.  
**Addresses:** growth and business packaging around validated core behavior.  
**Avoids:** trust debt and compliance regressions.

### Phase Ordering Rationale

- Dependencies force this order: schema/instrumentation -> capture -> projections -> intelligence -> monetization.
- Architecture guidance favors sidecar/non-blocking integration before any workflow coupling.
- Pitfall research shows early governance and privacy controls are prerequisite, not “later hardening.”

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3:** Decision-support scoring calibration and confidence communication UX.
- **Phase 4:** Failure clustering quality thresholds and recurrence-detection strategy.
- **Phase 5:** Compliance and secure share/export policy by region and user segment.

Phases with standard patterns (can skip dedicated research-phase):
- **Phase 1:** Feature flagging, schema governance, Cloudflare binding setup are well-established.
- **Phase 2:** Event capture + MVP CRUD/projection-lite patterns are mature and well-documented.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Strong alignment with existing codebase and official Cloudflare/Remix/Electron docs. |
| Features | HIGH | Directly grounded in project docs and detailed product-plan artifacts. |
| Architecture | HIGH | Derived from current code structure and explicit integration constraints. |
| Pitfalls | MEDIUM-HIGH | Strong internal relevance + credible external frameworks; some threat scenarios still need product-specific validation. |

**Overall confidence:** HIGH

### Gaps to Address

- Fork 6-dimension scoring weights need empirical calibration criteria before broad rollout.
- DNA update cadence and decay policy (TTL/re-evaluation thresholds) needs explicit product policy.
- Failure normalization signature quality needs benchmark dataset and precision/recall acceptance thresholds.
- Export/share governance needs final legal/security review before default-on launch.

## Sources

### Primary (HIGH confidence)
- `.planning/research/STACK.md`
- `.planning/research/FEATURES.md`
- `.planning/research/ARCHITECTURE.md`
- `.planning/research/PITFALLS.md`
- `.planning/PROJECT.md`

### Secondary (MEDIUM confidence)
- Cloudflare Docs (D1/KV/R2/Queues/Pages Functions bindings)
- Remix / React Router framework docs
- Electron security and release references
- AI SDK docs
- OpenTelemetry semantic conventions
- OWASP Top 10 for LLM Applications
- NIST AI RMF

---
*Research completed: 2026-04-01*  
*Ready for roadmap: yes*
