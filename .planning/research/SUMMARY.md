# Project Research Summary

**Project:** lifeBegins for bolt.diy-pro  
**Domain:** Builder-growth AI coding platform (brownfield Remix + Electron)  
**Researched:** 2026-04-01  
**Confidence:** HIGH

## Executive Summary

This product should be built as a growth-intelligence layer on top of the existing coding runtime, not as a parallel product. Research converges on an event-driven architecture where chat/workbench remains the execution backbone, while growth capabilities (intent anchor, decision branching, failure museum, timeline, recap, GSR) run through an append-only event spine with async projections.

Recommended implementation is incremental and data-first: establish canonical growth events, durable ingest, and read models before heavy UX. This allows shipping visible user value early (goal anchoring and decision quality) while preserving responsiveness and auditability.

The main risks are measurement drift, broken event semantics, automation bias in recommendations, and stale memory poisoning. Mitigation is explicit: unified tracking contract, guardrail metrics, human-in-the-loop decision confirmation, and memory lifecycle governance (confidence, freshness, TTL, revalidation).

## Key Findings

### Stack Recommendation

- `TypeScript 5.x`: strict contracts for event schemas, IPC boundaries, and decision payloads.
- `React Router 7.x + existing Remix runtime`: lowest-risk evolution path for brownfield routes/actions.
- `Electron 41.x`: desktop parity and local-first capture.
- `PostgreSQL 17/18 + pgvector`: canonical relational + semantic memory in one system.
- `Drizzle ORM/Kit`: type-safe schema and migrations with explicit SQL control.
- `LangGraph + Postgres checkpointer`: deterministic decision workflows with durable state.
- `Temporal (phased)`: reliable long-running recap/digest jobs.
- `OpenTelemetry + PostHog (+ Sentry)`: decision-quality tracing, product analytics, reliability monitoring.
- `SQLite (better-sqlite3) + Zod`: offline buffer + runtime schema validation at Electron boundary.

Critical recommendation: start with dual-store (`Postgres` canonical, `SQLite` local buffer) and avoid separate vector DB or graph DB in v1.

### Table Stakes

- Structured instruction scopes (global/workspace/repo)
- Plan-before-execute with editable plans
- Checkpoints/rollback for safe recovery
- Cross-session persistent memory with scope controls
- Searchable failure/error history
- End-of-session recap

### Differentiators

- Intent Anchor with explicit non-goals and drift guardrails
- Decision Branching with fixed tradeoff matrix and explicit choice rationale
- Failure Museum with recurrence analytics and playbook extraction
- Growth Timeline linking goals, decisions, failures, outcomes
- Builder DNA (adaptive, transparent, opt-out)
- GSR-driven coaching loop and experimentation baseline

### Anti-Features

- Heavy mandatory onboarding before coding
- Opaque AI scores without evidence
- Fixed personality labels for users
- Infinite noisy error logging with no curation
- Branching without mandatory closure/reason
- Growth dashboards disconnected from coding flow

### Top Risks

1. Vanity metrics drift: optimize activity, not growth outcomes.
2. Unjoinable event data: no shared IDs/schema, no computable loop.
3. Automation bias: assistant recommendations accepted without evidence.
4. Retrospective dead end: failures logged but not converted to actions/playbooks.
5. Stale memory poisoning: expired assumptions still influencing decisions.

## Suggested Phase Ordering

### Phase 1: Metrics + Event Contract Foundation

**Why first:** All growth features depend on trustworthy, joinable telemetry.  
**Delivers:** Tracking plan, canonical growth event schema, idempotent ingest spine, baseline GSR tree (north-star/leading/guardrail).  
**Covers:** Table-stakes observability and recap prerequisites.  
**Avoids:** Vanity metrics drift, unjoinable loop data.

### Phase 2: Intent Anchor Lite + Drift Guardrails

**Why second:** Fastest user-visible differentiation with moderate complexity and clear UX value.  
**Delivers:** Session goal/audience/non-goals capture, low-noise drift reminders, anchor retrieval in chat context.  
**Covers:** Differentiator: 初心锚点.  
**Avoids:** Narrative-feature disconnect, prompt drift.

### Phase 3: Decision Branching v1 + Safety Rails

**Why third:** Builds on anchor context and event spine; high impact on decision quality.  
**Delivers:** A/B branch compare, fixed six-dimension matrix, mandatory decision reason, commit log.  
**Covers:** Differentiator: 分岔人生.  
**Avoids:** Automation bias, branch sprawl.

### Phase 4: Failure Museum v1 -> Playbook Pipeline

**Why fourth:** Requires stable decision/session IDs and quality failure events from earlier phases.  
**Delivers:** Failure capture, normalization, recurrence analytics, playbook extraction, retrieval hints for next sessions.  
**Covers:** Differentiator: 失败博物馆.  
**Avoids:** Retrospective dead end.

### Phase 5: Timeline + Recap + GSR Analytics

**Why fifth:** Depends on accumulated anchor/decision/failure projections.  
**Delivers:** 人生线 read model, end-session growth recap, GSR contribution tags, experiment-ready dashboards.  
**Covers:** Differentiators: 人生线 + coaching loop.  
**Avoids:** Vanity-only dashboarding.

### Phase 6: Memory Governance + Adaptive Personalization

**Why sixth:** Needs sufficient high-quality historical data; premature rollout risks mis-personalization.  
**Delivers:** Memory lifecycle model (confidence/freshness/TTL), stale-memory controls, Builder DNA opt-in adaptation by maturity tier.  
**Covers:** Differentiator: Builder DNA.  
**Avoids:** Stale memory poisoning, one-size-fits-all loops.

## Research Flags

- Needs deeper phase research:
  - Phase 3 (decision-assist safety UX and evidence framing)
  - Phase 6 (memory governance policies and personalization strategy)
  - Any Temporal rollout phase (operational model and migration cutover)
- Standard patterns, likely no extra deep research:
  - Phase 1 instrumentation contract and schema validation
  - Phase 2 anchor capture/retrieval
  - Phase 4 basic failure ingest and projection pipeline

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Mostly official docs and stable brownfield fit; version guidance is concrete. |
| Features | HIGH | Strong cross-product signals from Copilot/Replit/Windsurf patterns. |
| Architecture | HIGH | Directly grounded in existing codebase flow and CQRS/event best practices. |
| Pitfalls | MEDIUM-HIGH | High practical relevance; some governance guidance is inference-heavy. |

**Overall confidence:** HIGH

## Gaps to Address

- Define precise GSR formula and target thresholds before experimentation starts.
- Lock canonical event dictionary (`goal_id`, `decision_id`, `session_id`, actor/source) in CI checks.
- Decide when to switch from BullMQ bridge to full Temporal ownership.
- Set memory TTL/revalidation policy and user-facing controls before Builder DNA rollout.

## Sources

- `.planning/research/STACK.md`
- `.planning/research/FEATURES.md`
- `.planning/research/ARCHITECTURE.md`
- `.planning/research/PITFALLS.md`
- `.planning/PROJECT.md`

---
*Research completed: 2026-04-01*  
*Ready for roadmap: yes*
