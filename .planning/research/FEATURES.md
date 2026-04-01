# Feature Landscape

**Domain:** Builder-growth AI coding platform (AI-assisted development with growth system layer)  
**Researched:** 2026-04-01

## Table Stakes

Features users now reasonably expect in mature AI coding products. Missing these will make growth features feel non-credible.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Structured project instructions (global/workspace/repo) | GitHub Copilot, Windsurf, and others already support instruction/rule layers; users expect controllable AI behavior instead of pure prompt luck | Medium | Baseline for your “初心锚点”; if instruction scope is weak, anchor cannot persist reliably |
| Plan-before-execute workflow | Replit Agent Plan mode and similar agent planning UX normalized the expectation that major changes should be previewed before execution | Medium | Must support editable plans, not read-only |
| Checkpoints / rollback in agent runs | Mature tools expose checkpoints/rewind so users can recover quickly from bad autonomous edits | Medium | Mandatory safety net before introducing decision branching |
| Persistent memory across sessions | Copilot Memory and Windsurf Memories indicate users now expect assistants to retain useful repo/project context | High | Need clear scope boundaries and memory curation to avoid stale context |
| Error capture + searchable history | Users expect repeated failures to become discoverable context, not transient chat noise | Medium | Minimum viable layer for “失败博物馆” first version |
| End-of-session recap | Productized agents increasingly summarize outcomes; users expect closure and next steps at session end | Low | Can be template-driven in v1 |

## Differentiators

Features that can make `bolt.diy-pro` meaningfully different from “better code generation tools”.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Intent Anchor with non-goals + success criteria + drift guardrails (初心锚点) | Converts vague prompting into goal-bounded execution; reduces mid-session drift and rework anxiety | Medium | Differentiator only if drift detection is actionable (`continue` vs `correct`) and not noisy |
| Decision Branching with standardized tradeoff matrix + explicit choice log (分岔人生) | Upgrades fork/rewind from technical recovery into decision intelligence; user sees future cost before committing | High | Must unify dimensions (time, complexity, maintenance, risk, scalability, learning) and preserve rationale |
| Failure Museum with recurrence analytics + playbook extraction (失败博物馆) | Turns failures into personal compounding asset; improves speed and confidence over time | High | Key moat if recurrence rate and time-to-fix visibly improve |
| Growth Timeline linking goals, decisions, failures, outcomes (人生线) | Makes long-term builder progress legible and reviewable; supports storytelling/export | Medium | Strong retention driver when linked to real project milestones, not vanity timeline |
| Builder DNA (adaptive preference model with opt-out) | Produces truly personalized guidance style (speed vs robustness, MVP vs maintainability) from behavior, not static profile setup | High | Needs transparent controls and “why this recommendation” explanations |
| Growth Session Rate (GSR) + coaching loop | Shifts success metric from output volume to growth outcomes; enables product learning and controlled experiments | Medium | Critical for roadmap prioritization and proving business impact |

## Anti-Features

Features to explicitly avoid because they damage trust, adoption, or long-term product defensibility.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Heavy mandatory onboarding form before any coding | High drop-off risk; advanced users will bypass growth features entirely | Progressive capture: one-line intent first, then contextual enrichment |
| Opaque “AI score” without evidence | Users cannot trust recommendations they cannot inspect | Every score must include concise evidence sentences and source context |
| Labeling users with fixed personality tags | Creates “judged by AI” feeling and weakens agency | Keep DNA as editable preference signals with explicit opt-out |
| Logging every error/noise event forever | Creates unusable “graveyard” and search fatigue | Curate only interruption-grade failures, support merge/delete/TTL |
| Branching without decision closure | Generates branch sprawl and no learning asset | Require decision resolution + reason before archiving alternatives |
| Growth dashboard disconnected from actual coding flow | Perceived as vanity analytics; low repeat usage | Inject growth moments directly into chat/workbench critical nodes |

## Feature Dependencies

```text
Instruction Scope (global/workspace/repo)
  -> Intent Anchor Schema
  -> Drift Detection
  -> Decision Branching Trigger

Checkpoints / Rollback
  -> Safe A/B Path Trials
  -> Decision Branching Adoption

Error Capture Pipeline
  -> Failure Classification
  -> Failure Museum Search
  -> Recurrence Analytics
  -> Proactive Similarity Warnings

Intent Anchor + Decision Logs + Failure Records
  -> Growth Timeline (Goal -> Decision -> Outcome chain)
  -> Builder DNA Inference

Unified Event Instrumentation (GSR baseline)
  -> Feature-level experimentability
  -> Weekly growth recap and next-step recommendations
```

## MVP Recommendation

Prioritize:
1. Intent Anchor Lite (`goal`, `audience`, `this-session target`, `non-goals`) + low-noise drift reminder.
2. Decision Branching v1 (A/B only) with fixed six-dimension comparison and mandatory choice reason.
3. Failure Museum v1 (key failure auto-capture + manual note + end-session failure summary).

Defer:
- Builder DNA auto-learning: requires enough high-quality behavioral data first, otherwise mis-personalization risk is high.
- Timeline export/story mode: build after goal/decision/failure chain quality is stable.

## Sources

- GitHub Docs — About agentic memory for GitHub Copilot (public preview; repository-scoped memory, retention, validation): https://docs.github.com/en/copilot/concepts/agents/copilot-memory (HIGH)
- GitHub Docs — Copilot feature matrix (agent mode, checkpoints, custom instructions, code review availability across IDEs): https://docs.github.com/en/copilot/reference/copilot-feature-matrix (HIGH)
- GitHub Docs — Adding repository custom instructions for GitHub Copilot: https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot (HIGH)
- GitHub Docs — Adding personal custom instructions for GitHub Copilot: https://docs.github.com/en/copilot/customizing-copilot/adding-personal-custom-instructions-for-github-copilot (HIGH)
- Replit Docs — Replit Agent (Plan mode, checkpoints, rollback workflow): https://docs.replit.com/core-concepts/agent (HIGH)
- Windsurf Docs — Memories and Rules (cross-conversation memory, global/workspace/system rule scopes): https://docs.windsurf.com/ro/plugins/cascade/memories (MEDIUM; localized page variant, capability semantics still clear)
- Cursor Changelog (automations + memory tool + agent operationalization, Mar 2026): https://cursor.com/changelog (MEDIUM; changelog evidence, not full behavior spec)
