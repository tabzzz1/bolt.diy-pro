# External Integrations

**Analysis Date:** 2026-04-01

## APIs & External Services

**LLM Providers (AI inference):**
- OpenAI - model list and inference via provider implementation.
  - SDK/Client: `@ai-sdk/openai` + direct REST for model discovery.
  - Auth: `OPENAI_API_KEY`.
  - Evidence: `app/lib/modules/llm/providers/openai.ts`, `worker-configuration.d.ts:5`.
- Anthropic - model list and inference via provider implementation.
  - SDK/Client: `@ai-sdk/anthropic` + direct REST for model discovery.
  - Auth: `ANTHROPIC_API_KEY`.
  - Evidence: `app/lib/modules/llm/providers/anthropic.ts`, `worker-configuration.d.ts:4`.
- Additional configured providers (Groq, Google, Mistral, OpenRouter, Bedrock, Together, DeepSeek, xAI, Perplexity, LMStudio, OpenAI-like, etc.).
  - SDK/Client: provider-specific `@ai-sdk/*` and custom providers.
  - Auth: multiple env vars typed in `worker-configuration.d.ts`.
  - Evidence: `app/lib/modules/llm/registry.ts`, `worker-configuration.d.ts`.

**Source Control / Repo APIs:**
- GitHub API - user/repo/branches/stats/template operations.
  - SDK/Client: REST fetch and `@octokit/rest` (bug-report route).
  - Auth: `GITHUB_TOKEN`, `VITE_GITHUB_ACCESS_TOKEN`, `GITHUB_BUG_REPORT_TOKEN`.
  - Evidence: `app/routes/api.github-user.ts:25`, `app/routes/api.github-branches.ts:71`, `app/routes/api.bug-report.ts:2`.
- GitLab API - project/branch listing.
  - SDK/Client: REST fetch.
  - Auth: bearer token from request body.
  - Evidence: `app/routes/api.gitlab-projects.ts:29`, `app/routes/api.gitlab-branches.ts:37`.

**Hosting/Deployment APIs (in-app deployment features):**
- Netlify API - user/sites and deployment orchestration.
  - SDK/Client: REST fetch.
  - Auth: `VITE_NETLIFY_ACCESS_TOKEN` (cookie/env/request derived).
  - Evidence: `app/routes/api.netlify-user.ts:22`, `app/routes/api.netlify-deploy.ts:137`.
- Vercel API - user/projects and deployment orchestration.
  - SDK/Client: REST fetch.
  - Auth: `VITE_VERCEL_ACCESS_TOKEN` (cookie/env/request derived).
  - Evidence: `app/routes/api.vercel-user.ts:31`, `app/routes/api.vercel-deploy.ts:417`.

**Diagnostics/Connectivity checks:**
- GitHub and Netlify reachability checks for troubleshooting.
  - Evidence: `app/routes/api.system.diagnostics.ts:71`, `app/routes/api.system.diagnostics.ts:94`.

## Data Storage

**Databases:**
- No first-party application database backend detected for the host app itself.
- Supabase is integrated as external user-selected service for project operations and auth/profile features.
  - Connection/auth: bearer token endpoints + browser client URL/key.
  - Client: `@supabase/supabase-js` and direct Supabase Management API calls.
  - Evidence: `app/lib/services/supabaseAuth.ts:37`, `app/routes/api.supabase.ts:12`, `app/routes/api.supabase.query.ts:21`.

**File Storage:**
- Local filesystem/project workspace and browser storage for app state.
- No dedicated external object storage service (S3/GCS/R2) for this host app detected in runtime routes.

**Caching:**
- No dedicated Redis/Memcached/Upstash cache integration detected.

## Authentication & Identity

**Auth Provider:**
- Supabase Auth for user auth/profile/storage features (optional, env-driven).
  - Implementation: browser Supabase client initialized if `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` are valid.
  - Evidence: `app/lib/services/supabaseAuth.ts:6`, `app/lib/services/supabaseAuth.ts:7`, `app/lib/services/supabaseAuth.ts:37`.

**Token handling pattern (integration APIs):**
- Tokens are sourced from cookies, request headers/body, Cloudflare env, and process env with fallback order per route.
  - Evidence: `app/routes/api.github-branches.ts`, `app/routes/api.netlify-user.ts`, `app/routes/api.vercel-user.ts`.

## Monitoring & Observability

**Error Tracking:**
- No external SaaS error tracker (e.g., Sentry) detected in mapped runtime paths.

**Logs:**
- Application-level logging via console and scoped logger utility.
  - Evidence: `app/lib/services/supabaseAuth.ts` (`createScopedLogger`), multiple `console.error` usages in API routes.

## CI/CD & Deployment

**Hosting:**
- Cloudflare Pages is the primary web deployment target.
  - Evidence: `package.json:14` (`wrangler pages deploy`), `wrangler.toml:5`, `functions/[[path]].ts:4`.
- Desktop release pipeline for Electron binaries.
  - Evidence: `.github/workflows/electron.yml`, `electron-builder.yml`.
- Container distribution via GitHub Container Registry.
  - Evidence: `.github/workflows/docker.yaml:19`, `.github/workflows/docker.yaml:56`.

**CI Pipeline:**
- GitHub Actions CI for typecheck/lint/test and Docker validation.
  - Evidence: `.github/workflows/ci.yaml:38`, `.github/workflows/ci.yaml:52`.
- Preview deployments to Cloudflare Pages for PRs when secrets are configured.
  - Evidence: `.github/workflows/preview.yaml:51`, `.github/workflows/preview.yaml:53`.

## Environment Configuration

**Required env vars:**
- LLM provider keys/base URLs: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GROQ_API_KEY`, `OPEN_ROUTER_API_KEY`, `AWS_BEDROCK_CONFIG`, `OPENAI_LIKE_API_BASE_URL`, `OPENAI_LIKE_API_MODELS`, etc.
- Integration tokens: `VITE_VERCEL_ACCESS_TOKEN`, `VITE_NETLIFY_ACCESS_TOKEN`, `VITE_GITHUB_ACCESS_TOKEN`/`GITHUB_TOKEN`, `VITE_SUPABASE_ACCESS_TOKEN`, plus Supabase client vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Evidence: `worker-configuration.d.ts`, integration routes under `app/routes/api.*.ts`, `app/lib/services/supabaseAuth.ts`.

**Secrets location:**
- Local/dev: `.env`, `.env.local`, `.env.production` files exist (content not inspected).
- Cloud/runtime: Cloudflare environment bindings via `context.cloudflare?.env` patterns in route handlers.
- CI: GitHub Actions secrets (e.g., `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `GITHUB_TOKEN`).
  - Evidence: `.github/workflows/preview.yaml:28`, `.github/workflows/preview.yaml:53`.

## Webhooks & Callbacks

**Incoming:**
- Cloudflare Pages Function request entrypoint for all app requests (server callback surface).
  - Endpoint style: catch-all function handler.
  - Evidence: `functions/[[path]].ts:4`, `functions/[[path]].ts:7`.
- No explicit third-party webhook receiver route (e.g., Stripe/GitHub webhook signature verification endpoint) detected.

**Outgoing:**
- Server-side outbound callbacks to external REST APIs for GitHub, GitLab, Supabase, Vercel, Netlify.
  - Evidence examples:
    - `app/routes/api.github-user.ts:25`
    - `app/routes/api.gitlab-projects.ts:29`
    - `app/routes/api.supabase.ts:12`
    - `app/routes/api.vercel-deploy.ts:417`
    - `app/routes/api.netlify-deploy.ts:137`

## Subsystem Keyword Scan: 做

- Keyword `做` appears in product-planning notes, not in integration/runtime modules.
  - Evidence: `notes/product-plan-lifebegins/00-产品方案总览.md:38`, `notes/product-plan-lifebegins/03-功能方案A-初心锚点.md:28`.
- Integration mapping impact: no extra API/SDK subsystem keyed by `做`.

---

*Integration audit: 2026-04-01*
