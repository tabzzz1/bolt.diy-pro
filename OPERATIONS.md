# Operations

## Purpose

This document collects the common run, test, build, deploy and troubleshooting flows for `bolt.diy-pro`.

## Prerequisites

- Node.js `>=18.18.0`; Node 22 is recommended by `.nvmrc`.
- pnpm `9.14.4`.
- Optional Docker for isolated local runs.
- Optional Wrangler login/configuration for Cloudflare Pages deployment.
- Provider/integration keys in local env files as needed.

Install dependencies:

```bash
pnpm install
```

## Environment Setup

Start from the example env file:

```bash
cp .env.example .env
cp .env.example .env.local
```

Then fill only the providers and integrations you actually use.

Vite loads env files in this order:

```text
.env.local -> .env -> default process env
```

Never commit real `.env.local` secrets.

## Local Development

Run the web app:

```bash
pnpm run dev
```

This starts the Remix/Vite development server after `pre-start.cjs`.

## Production-like Local Preview

Build and serve through Wrangler Pages:

```bash
pnpm run build
pnpm run start
```

On Unix-like systems, `start` uses `bindings.sh` to pass Cloudflare-style bindings to Wrangler.

## Docker

Development container:

```bash
pnpm run dockerbuild
docker compose --profile development up
```

Production container:

```bash
pnpm run dockerbuild:prod
docker compose --profile production up
```

Prebuilt image flow:

```bash
docker compose --profile prebuilt up
```

## Electron

Run desktop development:

```bash
pnpm electron:dev
```

Build desktop packages:

```bash
pnpm electron:build:mac
pnpm electron:build:win
pnpm electron:build:linux
pnpm electron:build:dist
```

Build only Electron dependencies:

```bash
pnpm electron:build:deps
```

## Quality Gates

Run the standard checks:

```bash
pnpm run typecheck
pnpm run lint
pnpm run test
```

Run a focused test file:

```bash
pnpm test -- app/lib/runtime/message-parser.spec.ts
```

Watch tests:

```bash
pnpm run test:watch
```

Fix lint issues where safe:

```bash
pnpm run lint:fix
```

## Deployment

Cloudflare Pages deployment:

```bash
pnpm run deploy
```

This runs:

```text
npm run build && wrangler pages deploy
```

Ensure Cloudflare credentials and project configuration are available before deploying.

## Common Troubleshooting

### Missing Provider Models

Check:

- provider API key is present
- provider base URL is correct for local/custom providers
- model provider is registered under `app/lib/modules/llm/**`
- `/api.models` or `/api.models.$provider` returns expected data

### Chat Fails Before Streaming

Check:

- `/api/chat` request payload
- selected provider/model settings
- context optimization settings
- MCP configuration if MCP is enabled
- server logs for structured route errors

### Generated Project Does Not Preview

Check:

- WebContainer startup logs
- shell action ordering in the generated artifact
- package install/build command output
- `public/inspector-script.js` availability
- browser console for preview iframe errors

### Integration Token Errors

Check:

- token exists in the expected env file or settings field
- cookie/request/env fallback order for the route
- third-party service response status
- route-level error payload and status code

### Electron Build Fails

Check:

- renderer build through `vite-electron.config.ts`
- main/preload build configs under `electron/**/vite.config.ts`
- `electron-builder.yml`
- macOS notarization settings in `notarize.cjs` when building signed releases

## Release Notes

Use existing root history files for user-facing changes:

- [CHANGES.md](./CHANGES.md)
- [changelog.md](./changelog.md)

## Related Documents

- [README.md](./README.md)
- [TECH_STACK.md](./TECH_STACK.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [LLM_INTEGRATION.md](./LLM_INTEGRATION.md)
- [DATA_GOVERNANCE.md](./DATA_GOVERNANCE.md)
