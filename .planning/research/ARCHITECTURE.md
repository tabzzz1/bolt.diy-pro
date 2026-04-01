# Architecture Patterns

**Domain:** Builder-growth AI coding platform (subsequent milestone integration)
**Researched:** 2026-04-01

## Recommended Architecture

Keep the current `chat -> api.chat -> stream -> parser -> action-runner -> workbench` path as the execution backbone, and add a parallel Growth Intelligence lane that is event-driven, append-only, and non-blocking.

Core principle: growth features must observe and enrich the coding runtime, not fork it.

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| Chat Runtime (existing) | Message streaming, artifact/action execution, workbench state | `api.chat`, `message-parser`, `action-runner`, `workbenchStore` |
| Growth Event Adapter (new, route-level) | Normalize chat/runtime/user signals into canonical growth events | `api.chat`, UI clients, Growth Ingest API |
| Growth Ingest API (new) | Validate event schema, dedupe/idempotency, append to event store | Event Store, Queue/Async projector |
| Event Store (new, append-only) | Source of truth for session timeline and audits | Growth Ingest API, Projectors |
| Projection Workers (new, async) | Build query-optimized read models from raw events | Decision Record Store, Failure Knowledge Store, Session Summary Store |
| Decision Record Service (new) | Persist branch options, rationale, expected tradeoffs, final choice | Projection Workers, Decision APIs, Timeline API |
| Failure Knowledge Service (new) | Convert repeated failure events into reusable patterns/playbooks | Projection Workers, Retrieval API, Recap API |
| Growth Context Retrieval (new) | Retrieve anchor/decision/failure context for next prompt/session | `api.chat` (system context), sidebar/timeline UI |
| GSR Analytics Service (new) | Compute growth metrics and experiment baselines from events/read models | Projection outputs, recap APIs, dashboards |
| Growth UI Surfaces (new) | 初心锚点, 分岔人生, 失败博物馆, 人生线, end-session recap | Chat runtime state, growth APIs |

## Data Flow

1. User and runtime actions happen in existing chat/workbench flow (`Chat.client.tsx` -> `/api/chat` -> stream/actions).
2. Growth Event Adapter emits canonical events for key moments:
   `session_started`, `anchor_set`, `branch_compared`, `decision_committed`, `action_failed`, `recovery_attempted`, `session_completed`.
3. Growth Ingest API validates schema/version/idempotency key and appends to Event Store.
4. Projectors consume events asynchronously and update read models:
   - `decision_records`
   - `failure_patterns`
   - `failure_playbooks`
   - `session_timeline`
   - `gsr_fact_table`
5. During chat generation, `api.chat` pulls Growth Context Retrieval output (current anchor + relevant prior failures + pending decisions) and injects compact context annotations.
6. End-of-session recap API reads projections and returns:
   - growth summary
   - decision quality notes
   - next-step recommendations
   - GSR contribution tags
7. Timeline UI (`人生线`) reads only read models, never raw event streams.

Direction rule: writes always go `runtime/UI -> ingest -> event store`; reads always go `UI/api -> read models`. No direct read from raw events in UI path.

## Patterns to Follow

### Pattern 1: Event-Carried State Transfer for Growth Signals
**What:** Carry enough context in each event (`sessionId`, `chatId`, `messageId`, `actionId`, `model/provider`, `artifactPath`) so downstream projectors are stateless and replay-safe.
**When:** All growth telemetry and decision/failure capture paths.
**Example:**
```typescript
type GrowthEvent = {
  eventId: string;          // UUID
  idempotencyKey: string;   // deterministic hash(sessionId + type + sourceRef)
  schemaVersion: '1.0';
  occurredAt: string;       // ISO timestamp
  sessionId: string;
  chatId: string;
  type:
    | 'session_started'
    | 'anchor_set'
    | 'branch_compared'
    | 'decision_committed'
    | 'action_failed'
    | 'recovery_attempted'
    | 'session_completed';
  payload: Record<string, unknown>;
};
```

### Pattern 2: CQRS Split (Append Store + Read Models)
**What:** Keep ingest immutable and fast; materialize decision/failure/timeline views asynchronously.
**When:** Any feature that requires both auditability and responsive UI.
**Example:**
```typescript
// Write path
await growthEventStore.append(event);
await growthQueue.enqueue(event);

// Read path
const timeline = await timelineReadModel.bySession(sessionId);
```

### Pattern 3: Non-Blocking Outbox from `api.chat`
**What:** `api.chat` should enqueue growth events after critical checkpoints without waiting for projector completion.
**When:** Streaming chat response and action execution callbacks.
**Example:**
```typescript
try {
  await ingestGrowthEvent(event); // durable append
} catch (err) {
  logger.warn('growth ingest failed, continue chat stream', { err });
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Growth Writes Inside UI-Only Stores
**What:** Saving decision/failure knowledge only in IndexedDB/cookies.
**Why bad:** No cross-device memory, no reliable analytics baseline, no replay for model improvements.
**Instead:** Treat local stores as cache; authoritative writes go to server-side event store.

### Anti-Pattern 2: Coupling Growth Computation to Streaming Latency
**What:** Running recap/failure clustering inline in `/api/chat` response path.
**Why bad:** Directly harms chat responsiveness and user trust.
**Instead:** Async projector + eventual consistency for heavy processing.

## Suggested Build Order

1. **Growth Event Contract + Ingest Spine**
   - Add canonical event schema/versioning/idempotency.
   - Add Growth Ingest API and append-only storage.
   - Instrument minimal events from `api.chat` + `action-runner`.
   - Outcome: data foundation without UX disruption.

2. **Decision Records (分岔人生)**
   - Add branch comparison write/read model.
   - Add decision commit events and API.
   - Add small in-chat decision panel first, full UI later.
   - Dependency: Step 1 event spine.

3. **Failure Knowledge (失败博物馆)**
   - Map runtime failures to normalized failure events.
   - Build pattern aggregation + playbook storage.
   - Expose top-N relevant failures in next-session context.
   - Dependency: Steps 1-2 (event and decision context).

4. **Timeline + Recap + GSR**
   - Build `人生线` from timeline read model.
   - Add end-session recap API and UI.
   - Compute GSR from materialized facts.
   - Dependency: all prior projections.

Build-order rationale: foundation first (event spine), then decision value, then reusable failure moat, then longitudinal timeline/metrics.

## Integration Notes for Existing Codebase

- Keep `/api/chat` as primary orchestration route; add growth emit hooks in:
  - request start
  - onStepFinish (tool calls)
  - action-runner failure/success transitions
  - onFinish
- Reuse existing logging style (`createScopedLogger`, `logStore`) for dual-write migration:
  local debug logs + server growth events.
- Keep existing IndexedDB chat history untouched for MVP; introduce server growth IDs (`sessionId`, `decisionId`, `failurePatternId`) as additive fields.

## Sources

- Existing project architecture baseline: `.planning/codebase/ARCHITECTURE.md` (HIGH)
- Existing stack/runtime constraints: `.planning/codebase/STACK.md`, `.planning/PROJECT.md` (HIGH)
- Remix technical model and route/action server flow: https://v2.remix.run/docs/discussion/introduction/ (MEDIUM)
- ADR practice for decision records: https://adr.github.io/ (MEDIUM)

