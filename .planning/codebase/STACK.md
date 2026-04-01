# Technology Stack

**Analysis Date:** 2026-04-01

## Languages

**Primary:**
- TypeScript (strict mode) - full-stack app code in `app/**`, `functions/**`, and `electron/**`.
  - Evidence: `tsconfig.json` (strict + path alias), `package.json` (typecheck script), `app/routes/api.llmcall.ts`.
- JavaScript (Node scripts/config) - build/start scripts and tooling glue in root scripts.
  - Evidence: `pre-start.cjs`, `notarize.cjs`, `scripts/*.js`.

**Secondary:**
- YAML/TOML - CI/CD and Cloudflare runtime config.
  - Evidence: `.github/workflows/*.yaml`, `wrangler.toml`.
- Markdown - product/docs and operational docs.
  - Evidence: `README.md`, `docs/**`, `notes/**`.

## Runtime

**Environment:**
- Node.js runtime for development/build/server tooling.
  - Minimum engine: `>=18.18.0` in `package.json:46`.
  - Container runtime image: `node:22-bookworm-slim` in `Dockerfile:2`.
- Cloudflare Pages Functions runtime for deployed web app request handling.
  - Evidence: `functions/[[path]].ts:2`, `functions/[[path]].ts:4`, `wrangler.toml:5`.
- Electron runtime for desktop distribution.
  - Evidence: scripts in `package.json` (`electron:*`), packaging in `electron-builder.yml`.

**Package Manager:**
- pnpm (`pnpm@9.14.4`).
  - Evidence: `package.json:219`.
- Lockfile: present.
  - Evidence: `pnpm-lock.yaml`.

## Frameworks

**Core:**
- Remix + Vite (Cloudflare adapter).
  - Evidence: `package.json:15` (`remix vite:build`), `vite.config.ts:1`, `functions/[[path]].ts:2`.
- React 18.
  - Evidence: `package.json` dependencies (`react`, `react-dom`), `app/root.tsx`.
- Electron (desktop app packaging and runtime).
  - Evidence: `package.json` electron build scripts, `electron-builder.yml`.

**Testing:**
- Vitest for test runner.
  - Evidence: `package.json` scripts `test` / `test:watch`.
- Testing Library + jsdom.
  - Evidence: `package.json` devDependencies `@testing-library/*`, `jsdom`.
- Playwright preview config exists for preview tests.
  - Evidence: `playwright.config.preview.ts` and exclusion in `vite.config.ts` test exclude block.

**Build/Dev:**
- Vite plugins: Remix plugin, UnoCSS, tsconfig paths, node polyfills, CSS modules optimization.
  - Evidence: `vite.config.ts:1`, `vite.config.ts:5`, `vite.config.ts:47`, `vite.config.ts:58`.
- Wrangler for Cloudflare Pages local/start/deploy flows.
  - Evidence: `package.json:14`, `package.json` start scripts, `wrangler.toml`.
- Docker multi-stage builds + docker compose profiles.
  - Evidence: `Dockerfile`, `docker-compose.yaml`.

## Key Dependencies

**Critical:**
- `@remix-run/cloudflare`, `@remix-run/cloudflare-pages`, `@remix-run/react`, `@remix-run/dev` - core full-stack runtime and build chain.
  - Evidence: `package.json` deps/devDeps, `functions/[[path]].ts`.
- `ai` + `@ai-sdk/*` provider packages - unified multi-model LLM integration layer.
  - Evidence: `package.json` dependencies, provider implementations in `app/lib/modules/llm/providers/*.ts`.
- `@modelcontextprotocol/sdk` - MCP integration capability.
  - Evidence: `package.json` dependencies, related API routes under `app/routes/api.mcp-*.ts`.

**Infrastructure:**
- `wrangler` + `@cloudflare/workers-types` - Cloudflare Pages/Workers tooling and typing.
  - Evidence: `package.json` devDependencies, `wrangler.toml`, `worker-configuration.d.ts`.
- `electron`, `electron-builder`, `electron-updater` - desktop packaging and updates.
  - Evidence: `package.json`, `electron-builder.yml`.
- `dotenv` - local env loading for Vite runtime.
  - Evidence: `vite.config.ts:10`, `vite.config.ts:11`, `vite.config.ts:12`.

## Configuration

**Environment:**
- `.env.example` and `.env.production` are present for environment templates.
- `.env.local` exists in workspace (detected by directory listing) and is used by local workflows.
- Vite explicitly loads `.env.local`, `.env`, then default env.
  - Evidence: `vite.config.ts:10`, `vite.config.ts:11`, `vite.config.ts:12`.
- Required env surface is strongly typed in `worker-configuration.d.ts` (many provider tokens and base URLs).
  - Evidence: `worker-configuration.d.ts`.

**Build:**
- Cloudflare target config in `wrangler.toml`.
  - Evidence: `wrangler.toml:3`, `wrangler.toml:4`, `wrangler.toml:5`.
- Root build config in `vite.config.ts`; electron renderer config in `vite-electron.config.ts`; electron sub-build configs in `electron/main/vite.config.ts` and `electron/preload/vite.config.ts`.
- Formatting/linting baseline with Prettier and ESLint.
  - Evidence: `.prettierrc`, `eslint.config.mjs`.

## Platform Requirements

**Development:**
- Node.js >= 18.18.0 and pnpm.
  - Evidence: `package.json:46`, `package.json:219`, `.nvmrc` (22).
- Optional Docker runtime for isolated local environments.
  - Evidence: `Dockerfile`, `docker-compose.yaml`, README docker section.
- Cloudflare local emulation via Wrangler Pages.
  - Evidence: `package.json` scripts `start:*`, `dockerstart`.

**Production:**
- Primary web deployment target: Cloudflare Pages + Functions.
  - Evidence: `package.json:14`, `wrangler.toml:5`, `functions/[[path]].ts:4`.
- Additional distribution targets:
  - Desktop binaries (macOS/Windows/Linux) via Electron release workflow.
    - Evidence: `.github/workflows/electron.yml`, `electron-builder.yml`.
  - OCI image distribution via GHCR.
    - Evidence: `.github/workflows/docker.yaml:19`, `.github/workflows/docker.yaml:56`.

## Subsystem Keyword Scan: 做

- Keyword `做` is detected in product-planning Markdown files under `notes/product-plan-lifebegins/**`.
  - Evidence examples: `notes/product-plan-lifebegins/00-产品方案总览.md:38`, `notes/product-plan-lifebegins/03-功能方案A-初心锚点.md:28`.
- No technical subsystem/module named `做` is detected in runtime/source integration paths (`app/routes/**`, `app/lib/**`, `functions/**`).
  - Evidence: keyword search over code returned note/doc matches only.

---

*Stack analysis: 2026-04-01*
