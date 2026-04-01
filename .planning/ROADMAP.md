# Roadmap: lifeBegins for bolt.diy-pro

## Overview

This roadmap delivers builder-growth capabilities in dependency order: intent grounding first, then decision quality, then failure learning, then session narrative, and finally measurable growth analytics. Each phase completes a user-verifiable outcome while preserving the existing chat/workbench flow.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Intent Anchor + Event Integrity** - Users anchor sessions with goals/non-goals while growth events stay joinable.
- [ ] **Phase 2: Decision Branching with Rationale** - Users compare branches and commit with explicit reasons.
- [ ] **Phase 3: Failure Museum + Playbooks** - Users convert execution failures into searchable, reusable recovery knowledge.
- [ ] **Phase 4: Timeline + Session Recap** - Users get a navigable growth narrative and evidence-backed recommendations.
- [ ] **Phase 5: GSR + Adoption Analytics** - Product metrics become experiment-ready and tied to growth outcomes.

## Phase Details

### Phase 1: Intent Anchor + Event Integrity
**Goal**: Users can define and maintain clear session intent with visible drift guardrails, and anchor events are reliably linked for downstream growth features.
**Depends on**: Nothing (first phase)
**Requirements**: ANCH-01, ANCH-02, ANCH-03, ANCH-04, METR-03
**Success Criteria** (what must be TRUE):
  1. User can define session goal, target audience, and milestone objective before major execution begins.
  2. User can define explicit non-goals and view them during execution.
  3. User sees continue-or-correct choices when major output drift is detected.
  4. User can revise or reset the intent anchor during a session and review revision history.
  5. Anchor actions are recorded with canonical, joinable IDs so later growth records stay traceable.
**Plans**: TBD
**UI hint**: yes

### Phase 2: Decision Branching with Rationale
**Goal**: Users can compare viable implementation paths and commit decisions with explicit reasoning that remains reviewable.
**Depends on**: Phase 1
**Requirements**: BRCH-01, BRCH-02, BRCH-03, BRCH-04
**Success Criteria** (what must be TRUE):
  1. User can create A/B implementation branches from current context at decision points.
  2. User can view a standardized six-dimension tradeoff comparison across branches.
  3. User can select a branch only after entering an explicit decision reason.
  4. User can later review both selected and rejected branch rationales in retrospective context.
**Plans**: TBD
**UI hint**: yes

### Phase 3: Failure Museum + Playbooks
**Goal**: Users can capture, curate, and reuse failure knowledge so interruptions become faster recoveries.
**Depends on**: Phase 2
**Requirements**: FAIL-01, FAIL-02, FAIL-03, FAIL-04
**Success Criteria** (what must be TRUE):
  1. Interruption-grade errors from preview, terminal, and tool actions are auto-captured into failure records.
  2. User can annotate failures and merge or dismiss noisy records to keep signal quality high.
  3. User can search and filter failure records by category, context, and recurrence.
  4. User receives reusable playbook suggestions generated from repeated failure patterns.
**Plans**: TBD
**UI hint**: yes

### Phase 4: Timeline + Session Recap
**Goal**: Users can understand their full session trajectory and act on transparent, evidence-backed recommendations.
**Depends on**: Phase 3
**Requirements**: TIME-01, TIME-02, TIME-03
**Success Criteria** (what must be TRUE):
  1. User can view a timeline containing key nodes for goals, decisions, failures, and milestone outcomes.
  2. User receives an end-of-session recap summarizing completed goals, key decisions, and unresolved risks.
  3. User can inspect concise evidence context explaining why each recommendation was made.
**Plans**: TBD
**UI hint**: yes

### Phase 5: GSR + Adoption Analytics
**Goal**: Product and growth signals are measurable, interpretable, and ready for experiment-driven iteration.
**Depends on**: Phase 4
**Requirements**: METR-01, METR-02
**Success Criteria** (what must be TRUE):
  1. System computes Growth Session Rate (GSR) using anchor, decision, and retrospective signals for each session.
  2. Product team can view feature-level adoption metrics for anchor, branching, failure, and timeline flows.
  3. Product team can view outcome metrics that connect feature usage to growth signals for experimentation baselines.
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Intent Anchor + Event Integrity | 0/TBD | Not started | - |
| 2. Decision Branching with Rationale | 0/TBD | Not started | - |
| 3. Failure Museum + Playbooks | 0/TBD | Not started | - |
| 4. Timeline + Session Recap | 0/TBD | Not started | - |
| 5. GSR + Adoption Analytics | 0/TBD | Not started | - |
