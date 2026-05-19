# Technology Stack

## Summary

`bolt.diy-pro` is a TypeScript-first, Remix/Vite-based AI development workbench with Cloudflare Pages Functions, Electron desktop packaging, WebContainer execution, multi-provider LLM integration, MCP support and optional deployment/service integrations.

## Languages

- TypeScript: primary app, API, runtime and Electron code.
- TSX/React: UI components, routes and workbench surfaces.
- JavaScript/CJS/MJS: build, clean, update and Electron dev scripts.
- Markdown: product, planning, AI collaboration and operational docs.
- YAML/TOML: GitHub Actions, Electron Builder, Cloudflare Wrangler and Docker config.

## Core Runtime

- Node.js: development, build and script runtime. `package.json` requires `>=18.18.0`; `.nvmrc` points to Node 22.
- pnpm: package manager, pinned as `pnpm@9.14.4`.
- Cloudflare Pages Functions: primary web deployment runtime.
- Electron: desktop runtime for macOS, Windows and Linux packages.
- Docker: optional isolated development and production container flow.

## Frontend

- React 18
- Remix 2
- Vite 5
- UnoCSS
- Radix UI primitives
- Headless UI
- Framer Motion
- CodeMirror
- xterm.js
- Chart.js / react-chartjs-2
- i18next / react-i18next

## Backend and Edge

- Remix loaders/actions for route and API boundaries.
- `@remix-run/cloudflare` and `@remix-run/cloudflare-pages` for Cloudflare adaptation.
- `functions/[[path]].ts` as the Pages Functions catch-all entry.
- `wrangler` for local Pages serving and deployment.
- `app/lib/security.ts` for reusable security wrapping.

## AI and Agent Stack

- Vercel AI SDK core package `ai`.
- Provider SDKs under `@ai-sdk/*`.
- Additional providers such as OpenRouter, Ollama, LM Studio and OpenAI-like endpoints.
- MCP via `@modelcontextprotocol/sdk`.
- LLM provider registry under `app/lib/modules/llm/**`.
- Server-side stream composition under `app/lib/.server/llm/**`.
- Model output parser under `app/lib/runtime/message-parser.ts`.
- Workbench action execution under `app/lib/runtime/action-runner.ts`.

## Workbench Runtime

- `@webcontainer/api` for browser-based Node project execution.
- Nanostores and Zustand for state management patterns.
- File, terminal, preview and diff state are composed under `app/lib/stores/**`.
- `public/inspector-script.js` supports preview/runtime inspection behavior.

## Integrations

### LLM Providers

The project supports multiple providers through the provider registry, including OpenAI, Anthropic, Google, Groq, xAI, DeepSeek, Mistral, Cohere, Together, Perplexity, HuggingFace, Ollama, LM Studio, OpenRouter, Moonshot/Kimi, Hyperbolic, GitHub Models, Amazon Bedrock and OpenAI-like providers.

### Code and Deployment

- GitHub and GitLab APIs for repository/project flows.
- Vercel and Netlify APIs for deployment flows.
- Supabase for optional auth/profile/project/database operations.
- MCP for external tool integration.

## Data and Persistence

- Browser storage and IndexedDB for local app/chat state.
- `app/lib/persistence/**` for local persistence helpers.
- No first-party production database is required by the host app at this stage.

## Quality Tooling

- TypeScript strict mode.
- ESLint flat config.
- Prettier.
- Vitest.
- Testing Library and jsdom for UI-oriented tests.
- Playwright preview config exists for future preview/e2e coverage.
- Husky pre-commit hooks for local typecheck/lint gates.

Common commands:

```bash
pnpm run typecheck
pnpm run lint
pnpm run test
```

## Build and Delivery

### Web

```bash
pnpm run build
pnpm run start
pnpm run deploy
```

`deploy` builds the Remix app and deploys through Wrangler Pages.

### Development

```bash
pnpm install
pnpm run dev
```

### Docker

```bash
pnpm run dockerbuild
docker compose --profile development up

pnpm run dockerbuild:prod
docker compose --profile production up
```

### Electron

```bash
pnpm electron:dev
pnpm electron:build:mac
pnpm electron:build:win
pnpm electron:build:linux
pnpm electron:build:dist
```

## Environment Files

The repo includes:

- `.env.example`
- `.env.production`
- `.env.local` in the current workspace
- `worker-configuration.d.ts` for Cloudflare binding typing

Vite loads `.env.local`, then `.env`, then default env.

Important env families:

- LLM provider keys and base URLs.
- `VITE_` integration tokens for client-aware settings.
- Cloudflare Pages bindings.
- Supabase URL/anon key and management tokens.
- GitHub/GitLab/Vercel/Netlify tokens where relevant.

Never commit real secrets.

## Related Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [LLM_INTEGRATION.md](./LLM_INTEGRATION.md)
- [OPERATIONS.md](./OPERATIONS.md)
- [DATA_GOVERNANCE.md](./DATA_GOVERNANCE.md)
