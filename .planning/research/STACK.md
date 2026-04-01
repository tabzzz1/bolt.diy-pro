# Technology Stack

**Project:** lifeBegins (builder-growth layer on bolt.diy-pro)
**Researched:** 2026-04-01
**Context:** Brownfield TypeScript Remix + Cloudflare + Electron

## Recommended Stack (2026, prescriptive)

### Core App Layer
| Technology | Version Family | Purpose | Why (Brownfield Rationale) | Confidence |
|------------|----------------|---------|-----------------------------|------------|
| React Router / Remix runtime | React Router 7.x + existing Remix app (incremental migration path) | Keep current route/action/loader model while evolving framework surface | Lowest migration risk for existing Remix code; enables feature layering without re-platforming | HIGH |
| TypeScript | 5.x | Strong contracts for memory schemas, decision events, IPC boundaries | Growth memory introduces many structured payloads; strict typing prevents silent drift | HIGH |
| Electron | 41.x family | Desktop shell + local persistence + secure IPC | Existing app already ships desktop; growth features (timeline, failure memory) benefit from local-first buffering | HIGH |

### Canonical Memory + Decision Data Layer
| Technology | Version Family | Purpose | Why | Confidence |
|------------|----------------|---------|-----|------------|
| PostgreSQL | 17/18 | Source of truth for goals, decisions, failures, timelines, metrics | Mature relational model for auditable decision history; best fit for timeline and comparison queries | HIGH |
| `pgvector` extension | 0.8.x (DB ext) + JS client package family | Semantic memory retrieval for similar failures/decisions | Keep vectors in same Postgres as structured events; simpler ops than adding a separate vector DB on day 1 | HIGH |
| Drizzle ORM + Drizzle Kit | `drizzle-orm` 0.45.x, `drizzle-kit` 0.31.x | Type-safe schema/migrations in TS | Better fit than heavy ORM in edge/hybrid environments; explicit SQL control for performance-critical timeline queries | MEDIUM |
| JSONB + typed event tables | Postgres native | Event-sourced growth timeline (`goal_set`, `path_compared`, `failure_captured`, `outcome`) | Decision intelligence needs append-only traceability; event tables prevent overwrite of learning history | HIGH |

### Decision Intelligence / Agent Orchestration
| Technology | Version Family | Purpose | Why | Confidence |
|------------|----------------|---------|-----|------------|
| LangGraph (JS) | `@langchain/langgraph` 1.2.x | Deterministic decision workflows (goal anchoring, path comparison, recap) | Native graph/state model maps directly to multi-step decision flows; less brittle than ad-hoc prompt chains | HIGH |
| LangGraph Postgres Checkpointer | `@langchain/langgraph-checkpoint-postgres` 1.0.x | Durable conversation/decision state | Officially production-oriented checkpointer; aligns with single Postgres strategy | HIGH |
| Temporal (TypeScript SDK) | `@temporalio/workflow` 1.15.x | Long-running, retry-safe growth jobs (nightly recap, weekly growth digest, delayed follow-up) | Durable execution and replay semantics prevent lost background jobs in distributed runtime | HIGH |
| BullMQ + Redis (optional near-term) | BullMQ 5.71.x + ioredis 5.10.x | Lightweight queue for non-critical async work | Good bridge if Temporal rollout is phased; keep for low-criticality tasks only | MEDIUM |

### Observability, Experimentation, and Growth Metrics
| Technology | Version Family | Purpose | Why | Confidence |
|------------|----------------|---------|-----|------------|
| OpenTelemetry JS | `@opentelemetry/api` 1.9.x + SDK packages | Trace decision flows end-to-end (prompt -> comparison -> chosen path -> outcome) | Mandatory for debugging decision quality regressions and latency hotspots | HIGH |
| PostHog | `posthog-js` 1.364.x + `posthog-node` 5.28.x | GSR instrumentation, funnels, retention, experiments/flags | Fast path to product analytics + experiments without custom analytics platform work | MEDIUM |
| Sentry (Electron + server) | latest stable SDK family | Exception and performance monitoring across desktop + server | Failure memory quality depends on accurate error capture, not only user-reported failures | MEDIUM |

### Electron Local Memory Layer (privacy + offline resilience)
| Technology | Version Family | Purpose | Why | Confidence |
|------------|----------------|---------|-----|------------|
| SQLite local store | `better-sqlite3` 12.8.x | Local cache for drafts, pending timeline events, offline failure notes | Prevent data loss during unstable connectivity; sync to server canonical store asynchronously | HIGH |
| Zod | 4.3.x | Validate IPC payloads and growth event shapes | IPC is a security boundary in Electron; runtime validation is non-negotiable | HIGH |

## Architecture Choice (opinionated)

Use a **dual-store strategy**:
1. **Server canonical memory** in Postgres (`goals`, `decision_paths`, `failures`, `growth_events`, `session_recap`).
2. **Client local buffer** in Electron SQLite for offline-first capture and staged sync.

This gives auditability + resilience without introducing local-first sync complexity too early.

## What NOT to Use (for this milestone)

| Avoid | Why Not Now | Use Instead |
|------|-------------|-------------|
| Separate vector DB first (Pinecone/Weaviate/Qdrant as primary) | Adds ops and consistency overhead before retrieval scale proves it necessary | Start with Postgres + pgvector; split later only when recall/latency SLOs demand it |
| Full graph database as core memory (Neo4j-first) | Goal/decision/failure timeline is mostly event + relational, not graph-traversal heavy at current stage | Postgres relational + JSONB events |
| Pure prompt-chain orchestration without durable state | Hard to replay/debug; fragile under retries and long-running flows | LangGraph + Postgres checkpointer, Temporal for durable jobs |
| Building custom analytics warehouse in v1 | Slows feature delivery and experiment velocity | PostHog + OTel now, warehouse later if needed |

## Installation (recommended baseline packages)

```bash
# Data + schema
npm install drizzle-orm pg pgvector zod
npm install -D drizzle-kit

# Decision workflows
npm install @langchain/langgraph @langchain/langgraph-checkpoint-postgres
npm install @temporalio/client @temporalio/worker @temporalio/workflow

# Async bridge (optional while phasing Temporal)
npm install bullmq ioredis

# Observability + analytics
npm install @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
npm install posthog-js posthog-node

# Electron local persistence
npm install better-sqlite3
```

## Rollout Order (tailored to existing Remix + Electron)

1. Add Postgres event schema + pgvector memory tables.
2. Implement goal anchoring and path comparison as LangGraph flows with Postgres checkpoints.
3. Add Electron local SQLite buffer + sync worker.
4. Add failure memory ingestion pipeline (error telemetry + user annotation).
5. Add GSR events, PostHog experiments, and OTel traces for decision quality loops.
6. Introduce Temporal for long-running recap/timeline jobs; deprecate ad-hoc cron/queue code.

## Sources

- React Router upgrade docs (incl. Remix migration): https://reactrouter.com/upgrading/remix (HIGH)
- Electron official docs: https://www.electronjs.org/docs/latest (HIGH)
- PostgreSQL current release/support matrix: https://www.postgresql.org/docs/current/release.html (HIGH)
- pgvector official repository: https://github.com/pgvector/pgvector (HIGH)
- Supabase pgvector/vector columns guide: https://supabase.com/docs/guides/ai/vector-columns (MEDIUM)
- LangGraph persistence docs (checkpointer guidance): https://docs.langchain.com/oss/javascript/langgraph/persistence (HIGH)
- Temporal TypeScript SDK docs: https://docs.temporal.io/develop/typescript (HIGH)
- PostHog docs (JS/Electron/experiments): https://posthog.com/docs (MEDIUM)
- npm package registry versions validated on 2026-04-01 (MEDIUM)
