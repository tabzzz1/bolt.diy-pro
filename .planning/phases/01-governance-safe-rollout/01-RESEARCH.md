# Phase 1: Governance & Safe Rollout - Research

**Researched:** 2026-04-01  
**Domain:** Feature flag governance, safe rollback, and minimal data-rights boundary on Remix/Cloudflare brownfield stack  
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### 发布开关模型
- **D-01:** 采用“双层开关”模型：服务端强制开关（kill switch）+ 前端可见性开关。
- **D-02:** 服务端开关按能力域分组（`lifebegins.anchor / fork / failure / timeline / dna`），不采用单总开关。
- **D-03:** 开关配置优先级为 `env > 持久化配置 > 默认值`，保证事故时可环境变量硬切。
- **D-04:** 默认发布策略为“全关”，通过分能力域逐步灰度开启。

### 关闭时降级策略
- **D-05:** 前端在能力关闭时隐藏入口（而非灰显或只读展示）。
- **D-06:** 服务端对被关闭能力请求明确拒绝（统一错误语义，如 `feature_disabled`），不静默忽略。
- **D-07:** 客户端收到拒绝后使用轻提示反馈，并引导回主链路；保留用户输入与上下文。
- **D-08:** 开关实时生效，不支持“会话级豁免继续可用”。

### 数据导出/删除边界
- **D-09:** Phase 1 数据权利仅覆盖新增 growth 域数据（不含既有全量聊天/设置域）。
- **D-10:** 导出格式采用 JSON 单文件（Phase 1 不扩展 markdown/csv 复合包）。
- **D-11:** 删除策略采用即时硬删除，不保留可恢复副本。
- **D-12:** 删除执行采用同步结果反馈；保留最小匿名审计元数据（时间/动作/结果），不保留业务内容。

### Claude's Discretion
- `feature_disabled` 的具体 HTTP 状态码（403 vs 409）与错误响应字段命名。
- 前端轻提示的具体文案与交互样式（toast/inline banner 组合方式）。
- 分能力域开关在配置文件中的命名细节与组织结构。

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| METR-02 | 新能力通过 feature flag 控制，支持快速回滚 | 双层开关架构（服务端 kill switch + 前端可见性）、`env > persisted > default` 解析器、统一 `feature_disabled` 错误语义、默认全关 |
| METR-03 | 用户数据支持最小化采集与导出/删除能力边界 | Growth 域独立存储、JSON 单文件导出、同步硬删除、最小匿名审计元数据、设置页可见可执行入口 |
</phase_requirements>

## Summary

Phase 1 should be implemented as a strict governance layer, not as business feature delivery. The current repo already has reusable pieces for this: settings UI and storage (`FeaturesTab`, `useSettings`, `settingsStore`), API safety wrapper (`withSecurity`), and a mature data-operation interaction model (`DataTab`, `useDataOperations`, `ImportExportService`). The critical gap is that feature-flag logic is still mock-level (`app/lib/api/features.ts`) and there is no server-side authoritative flag resolver for LifeBegins domains.

The best planning strategy is to add a small, explicit governance module that centralizes flag resolution and denial semantics, then wire it into future growth-domain APIs and settings surfaces. Keep phase scope tight: deliver the enforcement and data-rights boundary scaffolding only, with default-off behavior and deterministic rollback through environment variables.

For error semantics, using `403 Forbidden` for disabled features is more aligned with HTTP semantics (“understood but refuses to fulfill”) than `409 Conflict`; keep `409` available for true state conflicts. For data rights, implement an isolated growth-domain storage path so export/delete can be fulfilled without touching existing full chat/settings domains.

**Primary recommendation:** Build a server-authoritative `growthFeatureFlags` resolver and a growth-domain-only data rights API surface, then bind both to existing Settings UI patterns.

## Explicit Implementation Recommendations

1. Create `app/lib/governance/featureFlags.server.ts` with:
- Domain keys: `lifebegins.anchor|fork|failure|timeline|dna`.
- Resolution order: `env > persisted config > defaults`.
- Default values: all `false`.
- Helpers: `isFeatureEnabled(key, context)` and `assertFeatureEnabled(key)` returning a standardized error payload.

2. Add governance API routes:
- `app/routes/api.governance.flags.ts` for reading/updating persisted flag config.
- `app/routes/api.growth.export.ts` and `app/routes/api.growth.delete.ts` for METR-03 boundary actions.
- Wrap with `withSecurity` and enforce `allowedMethods`.

3. Enforce at service edge:
- For each growth-domain route, call `assertFeatureEnabled(domainKey)` before business logic.
- Return unified disabled payload:
  - `status: 403`
  - body: `{ error: "feature_disabled", feature: "<domain>", message: "<stable i18n key or text>" }`

4. Frontend behavior:
- Extend settings feature controls to show LifeBegins domain switches.
- Hide disabled domain entries/entrypoints (`D-05`), do not render read-only placeholders.
- On `feature_disabled`, show lightweight toast/banner and route user back to main chat-workbench flow while preserving current input state.

5. Data governance boundary:
- Introduce dedicated growth-domain store namespace (separate from existing full chat/settings exports).
- Export only growth-domain records as one JSON file (metadata + payload).
- Delete synchronously and hard-delete growth records.
- Write only minimal anonymous audit trail (`timestamp`, `action`, `result`, `featureDomain`), no business content.

## Risk Register

| Risk | Impact | Likelihood | Mitigation | Owner |
|------|--------|------------|------------|-------|
| Frontend-only flags cause bypass via direct API calls | High | High | Server-side enforcement mandatory on all growth APIs | Backend |
| Flag precedence implemented inconsistently across routes | High | Medium | Single resolver module; forbid ad-hoc flag checks | Backend |
| Disabled flow accidentally breaks existing chat-workbench UX | High | Medium | Integration test for “all growth flags off” happy path | FE + QA |
| Growth export/delete accidentally touches legacy chat/settings | High | Medium | Dedicated growth store namespace + allowlist-based export/delete | Backend |
| localStorage/cookie edge conditions break settings persistence | Medium | Medium | Graceful fallback + defensive parse + explicit error toasts | FE |
| Wrangler local runtime unavailable on current Node (v18) | Medium | Medium | Use Vitest/unit integration in Node 18; defer wrangler local validation until Node upgrade | DevOps |

## Planning Inputs for Downstream Planner

- Locked architecture decision: dual-layer flags with server authority.
- Must-have deliverables:
  - Flag resolver module (authoritative, default-off, precedence).
  - Governance routes for flags + growth data rights.
  - UI controls and disabled-flow UX.
  - Growth-only export/delete with sync hard delete.
  - Minimal audit metadata.
- Non-goals in this phase:
  - No Anchor/Fork/Failure/Timeline/DNA business feature implementation.
  - No full historical chat/settings data-rights overhaul.
- Gate condition:
  - With all growth flags off, core chat-workbench flow remains functional and unchanged.

## Project Constraints (from CLAUDE.md)

- Brownfield incremental delivery only: keep Remix/Vite/Cloudflare/Electron architecture unchanged.
- Do not break existing chat-workbench main flow.
- Maintain clean module boundaries; avoid coupling growth state into core execution engine.
- Prefer structured logging (`createScopedLogger`) over new raw `console.*` in runtime paths.
- Keep route-layer API behavior consistent with existing `withSecurity` and JSON error patterns.
- Workflow requirement: modifications should be executed through GSD flow commands (already aligned with phase-op research flow).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@remix-run/cloudflare` | repo: `2.15.2` (npm latest `2.17.4`, 2026-01-12) | Route/action boundary, API responses | Existing production route layer and typing basis |
| `nanostores` + `@nanostores/react` | repo: `0.10.3` / `0.7.3` (npm latest `1.2.0`) | Settings/flags reactive state | Already used in `useSettings` and settings stores |
| `react-toastify` | repo: `10.0.6` | Lightweight user feedback on deny/fallback | Existing UX pattern in settings/data tabs |
| `js-cookie` | repo: `3.0.5` (latest `3.0.5`) | Existing cookie persistence paths | Already integrated in settings/security flows |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zod` | repo: `3.24.1` (npm latest `4.3.6`) | Request payload validation for governance routes | Use on all new POST bodies |
| `vitest` | repo: `2.1.7` | Phase-level verification and regressions | Route/unit tests for flags and data-rights boundary |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| In-repo resolver module | Full OpenFeature SDK integration | OpenFeature is excellent as standard model but adds integration overhead for Phase 1 MVP governance |

**Installation:**
```bash
# No mandatory new dependency for Phase 1.
# Optional if route payload schema typing is expanded:
pnpm add zod
```

**Version verification:** verified via `npm view` on 2026-04-01.

## Architecture Patterns

### Recommended Project Structure
```
app/
├── lib/governance/                 # feature flag resolution and policy helpers
│   ├── featureFlags.server.ts
│   ├── errors.ts
│   └── types.ts
├── routes/
│   ├── api.governance.flags.ts     # manage/read flag config
│   ├── api.growth.export.ts        # growth-domain export only
│   └── api.growth.delete.ts        # growth-domain hard delete
└── components/@settings/tabs/
    ├── features/                   # domain switch UI
    └── data/                       # growth data rights actions
```

### Pattern 1: Server-Authoritative Flag Gate
**What:** Gate each growth API route before business logic with a single resolver.  
**When to use:** Any growth-domain endpoint or action.  
**Example:**
```typescript
// Source: /Users/zhouxiaopeng/Desktop/lifeBegins/bolt.diy-pro/app/lib/security.ts
export const action = withSecurity(async ({ request, context }) => {
  const flags = resolveGrowthFlags(context); // env > persisted > defaults

  if (!flags["lifebegins.anchor"]) {
    return Response.json(
      { error: "feature_disabled", feature: "lifebegins.anchor" },
      { status: 403 },
    );
  }

  // continue business logic
  return Response.json({ ok: true });
}, { allowedMethods: ["POST"] });
```

### Pattern 2: Hide-Then-Recover UX
**What:** Disabled features are hidden from entry; stale calls show light feedback and recover to primary flow.  
**When to use:** Any frontend entry to growth modules.
**Example:**
```typescript
// Source: /Users/zhouxiaopeng/Desktop/lifeBegins/bolt.diy-pro/app/components/@settings/tabs/features/FeaturesTab.tsx
if (apiError?.error === "feature_disabled") {
  toast.info(t("featureTemporarilyDisabled"));
  navigate("/"); // preserve user input/context in local state
}
```

### Pattern 3: Growth-Scoped Data Rights
**What:** Export/delete operations operate on growth namespace only.  
**When to use:** METR-03 endpoints and settings actions.
**Example:**
```typescript
// Source pattern reference:
// /Users/zhouxiaopeng/Desktop/lifeBegins/bolt.diy-pro/app/lib/hooks/useDataOperations.ts
// /Users/zhouxiaopeng/Desktop/lifeBegins/bolt.diy-pro/app/lib/services/importExportService.ts
return Response.json({
  exportDate: new Date().toISOString(),
  schema: "lifebegins.growth.v1",
  data: growthRecords, // no legacy chat/settings payload
});
```

### Anti-Patterns to Avoid
- **Frontend-only flag checks:** Direct API calls bypass UI toggles.
- **Single global kill switch:** Violates locked decision D-02 and blocks controlled rollout by domain.
- **Mixing growth and legacy export/delete scopes:** Breaks METR-03 “minimal boundary”.
- **Silent ignore when feature disabled:** Must return explicit `feature_disabled` (`D-06`).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Route security wrappers | New ad-hoc middleware framework | Existing `withSecurity` wrapper | Already handles methods, rate limits, headers, and error wrapping |
| Full data import/export platform rewrite | New generic backup subsystem | Existing `ImportExportService` + scoped growth serializers | Reuse mature user interaction and persistence behaviors |
| Distributed feature-flag control plane | Custom remote config infra in Phase 1 | Local server resolver + env override + persisted config | Phase goal is safe rollout baseline, not flag SaaS |

**Key insight:** Phase 1 needs deterministic governance primitives, not platform-scale reinvention.

## Common Pitfalls

### Pitfall 1: Kill Switch Not Truly Immediate
**What goes wrong:** Flag reads are cached too aggressively; rollback appears delayed.  
**Why it happens:** Resolver not designed for request-time precedence check.  
**How to avoid:** Evaluate flags per request with precedence logic, keep persistence read cheap and deterministic.  
**Warning signs:** Disabling env var does not take effect on next request.

### Pitfall 2: Wrong HTTP Semantics for Disabled Features
**What goes wrong:** Inconsistent 403/409 usage confuses clients and error handling.  
**Why it happens:** No explicit semantic contract.  
**How to avoid:** Use `403` for disabled feature access refusal; reserve `409` for state conflicts.  
**Warning signs:** Client retries disabled requests as if resolvable conflict.

### Pitfall 3: Data-Right Boundary Creep
**What goes wrong:** Export/delete includes unrelated legacy datasets.  
**Why it happens:** Reusing broad existing export logic without strict scope filters.  
**How to avoid:** Growth namespace + allowlist fields + schema versioned payload.  
**Warning signs:** Export file includes `chats` or unrelated settings blobs.

### Pitfall 4: localStorage/Cookie Failure Paths Unhandled
**What goes wrong:** Private mode or storage restrictions break toggle persistence silently.  
**Why it happens:** Assuming storage always available.  
**How to avoid:** Defensive storage access + fallback defaults + user-visible non-blocking notice.  
**Warning signs:** Switch appears toggled but reverts on refresh.

## Code Examples

Verified patterns from repo and official docs:

### Security-Wrapped Route Pattern
```typescript
// Source:
// /Users/zhouxiaopeng/Desktop/lifeBegins/bolt.diy-pro/app/routes/api.github-user.ts
export const loader = withSecurity(githubUserLoader, {
  rateLimit: true,
  allowedMethods: ["GET"],
});
```

### No-Provider Safe Default Concept (Flag Evaluation)
```typescript
// Source: https://openfeature.dev/specification/sections/flag-evaluation/
// In absence of provider, evaluation returns supplied default value.
const enabled = evaluateBoolean("lifebegins.anchor", false);
```

### HTTP Conflict vs Forbidden Semantics Anchor
```text
// Source: https://www.rfc-editor.org/rfc/rfc9110
// 403: understood request, refuses to fulfill.
// 409: request conflicts with current target resource state.
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-only/mock feature listing (`app/lib/api/features.ts`) | Server-authoritative flag evaluation at route edge | Planned in Phase 1 | Enables real rollback and policy enforcement |
| Broad data tooling centered on chats/settings | Growth-domain scoped rights boundary | Planned in Phase 1 | Meets METR-03 without destabilizing legacy data plane |
| Implicit toggle behavior | Explicit contract (`env > persisted > default`, default-off) | Planned in Phase 1 | Predictable operations and safer incident response |

**Deprecated/outdated:**
- Mock feature-flag API behavior for governance-critical rollout controls.

## Open Questions

1. **Persisted flag config storage medium**
   - What we know: Must be lower-priority than env, and editable by operations.
   - What's unclear: Store location (KV/DB/local persisted config file) in this repo runtime topology.
   - Recommendation: Phase 1 use smallest viable persisted config (single JSON-backed route store), keep interface stable for later migration.

2. **Audit metadata sink**
   - What we know: Must keep anonymous minimal metadata only.
   - What's unclear: whether to store audit in localStorage, IndexedDB, or server-side table.
   - Recommendation: Use server-side lightweight append log if available; else isolated local store with schema version.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build/test tooling | ✓ | `v18.20.8` | — |
| pnpm | Script execution | ✓ | `9.8.0` | npm scripts |
| Vitest | Validation architecture | ✓ (repo devDependency) | `2.1.7` | — |
| Wrangler local runtime | Cloudflare local route simulation | ✗ (requires Node >= 20) | — | Validate with unit/integration tests on Node 18; upgrade Node for full local Cloudflare simulation |

**Missing dependencies with no fallback:**
- None blocking for this phase’s code+test scope.

**Missing dependencies with fallback:**
- Wrangler runtime on current Node; fallback is test-first validation without local wrangler execution.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest `2.1.7` |
| Config file | none — CLI defaults (no `vitest.config.ts`) |
| Quick run command | `pnpm test -- app/lib/runtime/message-parser.spec.ts` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| METR-02 | Disabled domain is blocked server-side with deterministic error contract | integration | `pnpm test -- app/routes/__tests__/api.governance.flags.spec.ts` | ❌ Wave 0 |
| METR-02 | All flags off still preserves chat-workbench core flow | integration | `pnpm test -- app/routes/__tests__/governance-mainflow.spec.ts` | ❌ Wave 0 |
| METR-03 | Growth-only export payload excludes legacy chat/settings | unit | `pnpm test -- app/lib/governance/__tests__/growth-export.spec.ts` | ❌ Wave 0 |
| METR-03 | Growth delete is synchronous hard delete + anonymous audit metadata only | integration | `pnpm test -- app/routes/__tests__/api.growth.delete.spec.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test -- <changed-spec-files>`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `app/routes/__tests__/api.governance.flags.spec.ts` — METR-02 server gate and status semantics.
- [ ] `app/routes/__tests__/governance-mainflow.spec.ts` — core flow regression when all growth flags off.
- [ ] `app/lib/governance/__tests__/growth-export.spec.ts` — METR-03 scoped export correctness.
- [ ] `app/routes/__tests__/api.growth.delete.spec.ts` — sync hard delete + audit metadata contract.

## Sources

### Primary (HIGH confidence)
- Repo code anchors:
  - [/Users/zhouxiaopeng/Desktop/lifeBegins/bolt.diy-pro/app/components/@settings/tabs/features/FeaturesTab.tsx](/Users/zhouxiaopeng/Desktop/lifeBegins/bolt.diy-pro/app/components/@settings/tabs/features/FeaturesTab.tsx)
  - [/Users/zhouxiaopeng/Desktop/lifeBegins/bolt.diy-pro/app/lib/hooks/useSettings.ts](/Users/zhouxiaopeng/Desktop/lifeBegins/bolt.diy-pro/app/lib/hooks/useSettings.ts)
  - [/Users/zhouxiaopeng/Desktop/lifeBegins/bolt.diy-pro/app/lib/stores/settings.ts](/Users/zhouxiaopeng/Desktop/lifeBegins/bolt.diy-pro/app/lib/stores/settings.ts)
  - [/Users/zhouxiaopeng/Desktop/lifeBegins/bolt.diy-pro/app/lib/security.ts](/Users/zhouxiaopeng/Desktop/lifeBegins/bolt.diy-pro/app/lib/security.ts)
  - [/Users/zhouxiaopeng/Desktop/lifeBegins/bolt.diy-pro/app/components/@settings/tabs/data/DataTab.tsx](/Users/zhouxiaopeng/Desktop/lifeBegins/bolt.diy-pro/app/components/@settings/tabs/data/DataTab.tsx)
  - [/Users/zhouxiaopeng/Desktop/lifeBegins/bolt.diy-pro/app/lib/hooks/useDataOperations.ts](/Users/zhouxiaopeng/Desktop/lifeBegins/bolt.diy-pro/app/lib/hooks/useDataOperations.ts)
  - [/Users/zhouxiaopeng/Desktop/lifeBegins/bolt.diy-pro/app/lib/services/importExportService.ts](/Users/zhouxiaopeng/Desktop/lifeBegins/bolt.diy-pro/app/lib/services/importExportService.ts)
  - [/Users/zhouxiaopeng/Desktop/lifeBegins/bolt.diy-pro/app/lib/api/features.ts](/Users/zhouxiaopeng/Desktop/lifeBegins/bolt.diy-pro/app/lib/api/features.ts)
- RFC 9110 HTTP Semantics: https://www.rfc-editor.org/rfc/rfc9110
- OpenFeature specification (flag evaluation/provider): https://openfeature.dev/specification/sections/flag-evaluation/ and https://openfeature.dev/specification/sections/providers/
- Cloudflare Workers env/secrets guidance: https://developers.cloudflare.com/workers/configuration/environment-variables/

### Secondary (MEDIUM confidence)
- MDN 403 semantics: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/403
- MDN 409 semantics: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/409
- MDN localStorage exceptions and limitations: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - derived from current repo implementation + npm registry verification.
- Architecture: HIGH - directly anchored in existing code paths and locked decisions.
- Pitfalls: MEDIUM - mostly anchored in repo behavior, with some forward-looking operational inference.

**Research date:** 2026-04-01  
**Valid until:** 2026-04-30
