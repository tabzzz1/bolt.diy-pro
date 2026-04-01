# Technology Stack

**Project:** LifeBegins (on bolt.diy-pro)  
**Researched:** 2026-04-01  
**Scope:** Stack dimension for Intent Anchor, Fork Futures, Failure Museum, Life Timeline, Builder DNA

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Remix (current app baseline) | `2.15.x` now, keep aligned with upstream bolt.diy-pro | Existing full-stack routing/data APIs on Cloudflare + Electron | Fastest safe path is incremental extension, not framework migration mid-feature |
| React Router Framework mode (migration target, not immediate) | `v7` track | Future upgrade path as Remix ecosystem converges | Keep code organization compatible, but do not block feature delivery on migration |
| React | `18.x` | UI for Timeline, Fork compare panels, Anchor forms | Already integrated deeply; no rewrite cost |
| TypeScript | `5.7+` strict | Domain model integrity for growth events and decision records | Prevents schema drift across Web + Electron |

### Database
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Cloudflare D1 | Latest GA on current Cloudflare account | System of record for growth data (`anchors`, `forks`, `failures`, `timeline_events`, `builder_dna`) | Native to Cloudflare runtime, SQL fits relational timeline/decision queries |
| Cloudflare KV | Existing product runtime version | Cache small, frequently-read derived blobs (`builder_dna_snapshot`, `weekly_growth_summary`) | Reduces D1 read pressure for dashboard-like views |
| Cloudflare R2 | Existing product runtime version | Store large exported artifacts (timeline report JSON/PDF, failure bundle attachments) | Cheap object storage, keeps D1 rows lean |

### Infrastructure
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Cloudflare Queues | Existing product runtime version | Async enrichment pipeline (failure clustering, weekly digest generation, DNA recalculation) | Removes heavy/slow work from chat request path |
| Cloudflare Analytics Engine | Existing product runtime version | Product telemetry for GSR and feature adoption events | Native write path from Pages Functions, no third-party analytics dependency required for MVP |
| Cloudflare Pages Functions Bindings | Wrangler `4.x` | Bind D1/KV/R2/Queues/Analytics directly to Remix APIs | Keeps architecture single-backend on existing deployment model |
| Electron (secure bridge model) | `33.x` now, track current stable line | Desktop shell using same HTTP APIs and auth/session model | Avoid split-brain local DB; keep web/desktop behavior consistent |

### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `drizzle-orm` + `drizzle-kit` | latest stable 2026 major | D1 schema migrations + typed SQL | Required for all new LifeBegins domain tables |
| `zod` | keep current major in repo first | Runtime validation of Anchor/Fork/DNA payloads | Required at every new `/api/lifebegins/*` boundary |
| `ai` + existing `@ai-sdk/*` providers | keep current app baseline, update in batches | LLM-generated fork option narratives / failure summarization | Use as assistant layer only; keep deterministic scoring/rules server-side |
| Existing nanostores state layer | current | Client cache + optimistic updates for timeline/fork actions | Reuse existing app pattern; do not add Redux/MobX |

## Implementation Boundaries (Prescriptive)

1. **Single source of truth:** All growth-domain persistent data lives in D1 first. KV is cache only.  
2. **One API surface:** Add `app/routes/api.lifebegins.*.ts` endpoints under Remix; Electron calls same endpoints.  
3. **Async-by-default for heavy work:** Failure normalization, clustering, weekly report generation must go through Queues workers.  
4. **Deterministic scoring core:** Fork Futures 6-dimension score formula is rule-based in server code; LLM only generates explanations/alternatives.  
5. **Event-first timeline:** Write normalized `timeline_events` for Anchor/Fork/Failure/Milestone, then build projections for UI.

## Feature-to-Stack Mapping

| Feature | Synchronous path (request time) | Asynchronous path | Storage |
|---------|----------------------------------|-------------------|---------|
| Intent Anchor | Zod validate + persist anchor + compute alignment score | Optional alignment drift analytics rollup | D1 + Analytics Engine |
| Fork Futures | Persist fork decision + options + chosen rationale | Re-score outcomes after milestone completion | D1 + Queues |
| Failure Museum | Capture critical errors from runtime hooks | Error clustering/dedup + weekly anti-pattern tips | D1 + Queues (+R2 attachments if needed) |
| Life Timeline | Append canonical timeline event | Build export package/report snapshots | D1 + R2 |
| Builder DNA | Read/update preference vector + rule profile | Nightly/weekly recalibration jobs | D1 + KV cache |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| ORM | Drizzle + SQL migrations | Prisma | Prisma + Cloudflare edge/runtime friction and heavier client model than needed |
| Event backbone | Cloudflare Queues | Kafka/SQS + separate service | Overkill for current scale; adds ops burden and new infra boundary |
| Analytics | Analytics Engine + internal schema | PostHog/Amplitude first | Third-party lock-in before event semantics stabilize |
| Personalization store | D1 (+optional Vectorize later) | Immediate dedicated vector DB | Builder DNA V1 is structured preference data, not vector-search-first |
| Runtime coordination | Existing Remix APIs | New microservice (Nest/Fastify) | Premature split; increases latency and maintenance cost |

## What NOT to Introduce (Important)

- Do not add a second primary database for LifeBegins MVP.  
- Do not introduce separate backend service/repo for growth features.  
- Do not move decision scoring logic into prompts only.  
- Do not add complex stream processors/workflow engines before Queue-based jobs hit limits.  
- Do not create Electron-only local persistence fork of growth data model.

## Installation

```bash
# Core additions
pnpm add drizzle-orm drizzle-zod

# Dev dependencies
pnpm add -D drizzle-kit
```

## Sources

- React Router framework docs (installation, framework mode): https://reactrouter.com/start/framework/installation  
- Remix docs root (current official docs): https://remix.run/docs  
- Cloudflare Pages Functions bindings (D1/KV/R2/Queues/Analytics/Service bindings): https://developers.cloudflare.com/pages/functions/bindings/  
- Cloudflare product docs: D1 https://developers.cloudflare.com/d1/ ; Durable Objects https://developers.cloudflare.com/durable-objects/ ; Queues https://developers.cloudflare.com/queues/ ; Vectorize https://developers.cloudflare.com/vectorize/ ; Workers AI https://developers.cloudflare.com/workers-ai/  
- Cloudflare KV llms index (official docs index): https://developers.cloudflare.com/kv/llms.txt  
- Electron security tutorial (context isolation/process security baseline): https://www.electronjs.org/docs/latest/tutorial/security  
- Electron release history (version cadence reference): https://releases.electronjs.org/  
- AI SDK docs (multi-provider, tool/object/streaming capabilities): https://ai-sdk.dev/docs/introduction

