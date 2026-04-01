# lifeBegins for bolt.diy-pro

## What This Is

`bolt.diy-pro` is evolving from a multi-model AI coding assistant into a builder growth platform. It keeps strong code-generation and execution workflows, while adding product-level capabilities that help developers make better decisions, capture lessons, and build long-term growth assets. The primary users are indie builders, small technical teams, and AI-assisted developers who need both delivery speed and strategic clarity.

## Core Value

Every meaningful session should leave the builder with clearer direction and reusable growth assets, not just generated code.

## Requirements

### Validated

- ✓ Multi-provider model orchestration with dynamic model selection — existing
- ✓ Chat-to-artifact runtime that executes file/shell/build actions in a workbench — existing
- ✓ Integrated preview, terminal, diff, and deployment workflows — existing
- ✓ Electron desktop packaging with web/runtime parity — existing
- ✓ MCP and external-tool integration surface for extended workflows — existing

### Active

- [ ] Add "初心锚点" to enforce goal, audience, and explicit non-goals at session start
- [ ] Add "分岔人生" to compare implementation paths with tradeoffs before committing
- [ ] Add "失败博物馆" to capture failure patterns and reusable recovery playbooks
- [ ] Add "人生线" to generate a navigable timeline of goal, decisions, actions, and outcomes
- [ ] Add Growth Session Rate (GSR) instrumentation and experiment-ready analytics baselines
- [ ] Add end-of-session growth recap with next-step recommendations

### Out of Scope

- Enterprise-heavy project governance modules in v1 — low alignment with current user archetypes
- Large-scale multi-role collaboration orchestration in v1 — dependency-heavy and weak short-term differentiation
- Visual-only branding refresh without data/decision loops — does not create durable moat

## Context

The current codebase is a brownfield Remix + Cloudflare + Electron platform with robust LLM execution infrastructure and mature provider coverage. Product planning artifacts under `notes/product-plan-lifebegins/` define a strategic direction: shift user value from "code output" to "builder evolution." Priority order is clear: 初心锚点, 分岔人生, 失败博物馆, then 人生线/Builder DNA.

The target quarter strategy emphasizes value perception -> data accumulation -> retention lift. The product must preserve existing developer velocity while layering structured decision support and long-term memory capabilities.

## Constraints

- **Tech Stack**: Remix + React + Cloudflare + Electron baseline must be preserved — reduce migration risk and protect shipping velocity
- **Compatibility**: New growth features must integrate with current chat/workbench flow — avoid parallel UX tracks that fragment usage
- **Observability**: GSR and feature usage metrics are mandatory for new capability rollout — decisions must be data-backed
- **Delivery Strategy**: Incremental rollout in phases (MVP-first for each growth capability) — control scope and validate quickly
- **Performance**: Additional decision/growth logic cannot degrade core chat/workbench responsiveness — preserve baseline user trust

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Reposition product narrative from "AI coding assistant" to "builder growth platform" | Defends against feature parity competition and builds long-term retention moat | — Pending |
| Start with decision-support layer before full growth-memory layer | Lower implementation cost and faster user-perceived differentiation | — Pending |
| Use existing runtime and route architecture for growth features | Maximizes reuse and reduces architecture disruption in brownfield codebase | — Pending |
| Measure success via Growth Session Rate (GSR) instead of session length | Better reflects user outcomes and repeat value | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check - still the right priority?
3. Audit Out of Scope - reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-01 after initialization*
