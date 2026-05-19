# Architecture

## Overview

`bolt.diy-pro` is a Remix/Vite AI development workbench with multiple runtime targets:

```text
React UI
  -> Remix routes and API actions
  -> LLM/provider services, MCP and integrations
  -> streaming parser and WebContainer action runner
  -> browser preview, terminal, files, Git, export and deployment
```

The same application can run as a web app through Cloudflare Pages Functions and as a desktop app through Electron.

## Runtime Targets

### Web

Cloudflare Pages is the primary web deployment target. `functions/[[path]].ts` adapts incoming Pages requests to the Remix server build under `build/server`.

### Local Development

Local development uses Remix with Vite:

```bash
pnpm run dev
```

Production-like local serving uses the built client and Wrangler Pages:

```bash
pnpm run build
pnpm run start
```

### Desktop

Electron wraps the Remix app for desktop distribution. The main process loads the Remix server build and forwards requests through Electron protocol handling. The preload script exposes controlled IPC capabilities.

## Main Layers

### Presentation Layer

Locations:

- `app/root.tsx`
- `app/routes/_index.tsx`
- `app/components/**`

Responsibilities:

- Render the app shell, chat UI, settings, workbench, file editor, preview and terminal surfaces.
- Trigger chat requests and workbench actions.
- Read/write client state through hooks and stores.

### Route and API Layer

Locations:

- `app/routes/api.chat.ts`
- `app/routes/api.llmcall.ts`
- `app/routes/api.models.ts`
- `app/routes/api.*.ts`

Responsibilities:

- Act as the BFF boundary for the UI.
- Parse requests, validate inputs and read cookies/env values.
- Call LLM, MCP, GitHub, GitLab, Supabase, Vercel and Netlify services.
- Return structured JSON or streaming responses.

### Domain and Service Layer

Locations:

- `app/lib/modules/llm/**`
- `app/lib/services/**`
- `app/lib/security.ts`

Responsibilities:

- Manage model providers and model catalog.
- Encapsulate external service calls.
- Enforce reusable security wrappers and request validation.
- Keep route files from owning provider-specific details.

### Runtime Execution Layer

Locations:

- `app/lib/runtime/message-parser.ts`
- `app/lib/runtime/action-runner.ts`
- `app/lib/webcontainer/index.ts`
- `app/lib/stores/workbench.ts`

Responsibilities:

- Parse model-emitted `<boltArtifact>` and `<boltAction>` blocks.
- Run file, shell, build, start and related actions in order.
- Connect generated artifacts to files, terminal, preview and diff state.

### Platform Adapter Layer

Locations:

- `functions/[[path]].ts`
- `electron/main/index.ts`
- `electron/preload/index.ts`

Responsibilities:

- Bridge Remix to Cloudflare Pages Functions.
- Bridge Remix to Electron desktop runtime.
- Keep platform-specific bootstrapping outside core app logic.

## Important Flows

### Chat Generation Flow

```text
Chat UI
  -> POST /api/chat
  -> provider/model/settings/context resolution
  -> MCP setup when enabled
  -> LLM streaming response
  -> client-side parser
  -> ActionRunner
  -> files, terminal, preview, diff
```

### Model Catalog Flow

```text
Settings or model picker
  -> /api.models or /api.models.$provider
  -> LLMManager
  -> provider implementation
  -> normalized model list
```

### Desktop Request Flow

```text
Electron startup
  -> load Remix server build
  -> protocol.handle('http')
  -> static asset response or Remix request handler
  -> renderer UI
```

## Key Abstractions

### LLMManager

`app/lib/modules/llm/manager.ts` centralizes provider registration, model discovery and default provider behavior. New model providers should integrate through the existing provider registry rather than bypassing the manager from route code.

### StreamingMessageParser

`app/lib/runtime/message-parser.ts` incrementally parses model output and emits artifact/action lifecycle callbacks. It is a critical boundary between natural-language model output and executable workbench behavior.

### ActionRunner

`app/lib/runtime/action-runner.ts` serializes executable actions and reports state back to the workbench. Runtime changes should be tested carefully because they affect file writes, shell execution and preview startup.

### Workbench Store

`app/lib/stores/workbench.ts` composes files, editor, preview, terminal and artifact runner state. Feature modules should avoid placing unrelated business state directly in this store unless the state is truly part of the IDE-like workbench.

## Extension Points

### Add a Model Provider

1. Add provider implementation under `app/lib/modules/llm/providers/`.
2. Register/export it through the LLM registry.
3. Add env typing to `worker-configuration.d.ts` when needed.
4. Add model discovery and fallback behavior.
5. Cover provider normalization or route behavior with tests where practical.

### Add an External Integration

1. Keep external API details in `app/lib/services/**` or a dedicated route module.
2. Read tokens from the established env/cookie/request patterns.
3. Return structured errors with useful status codes.
4. Avoid leaking secrets to client responses or logs.

### Add Workbench Runtime Behavior

1. Keep model-output contracts explicit.
2. Add parser/action-runner tests for malformed, partial or repeated actions.
3. Keep file path and shell command handling conservative.
4. Verify UI state in files, terminal, preview and diff surfaces.

## Error Handling

The common pattern is route-level validation with `Response` or `json` status responses, service-level contextual errors, and runtime UI alerts for failed executable actions. New APIs should prefer structured error payloads over raw thrown strings.

## Testing Strategy

Use Vitest for unit and route-level tests:

```bash
pnpm run test
```

Use typecheck and lint as the default quality gate:

```bash
pnpm run typecheck
pnpm run lint
```

Focus tests on:

- runtime parser and action behavior
- route validation and error semantics
- provider/model normalization
- settings UI contracts
- utility functions used by runtime actions

## Related Documents

- [DESIGN.md](./DESIGN.md)
- [TECH_STACK.md](./TECH_STACK.md)
- [LLM_INTEGRATION.md](./LLM_INTEGRATION.md)
- [DATA_GOVERNANCE.md](./DATA_GOVERNANCE.md)
