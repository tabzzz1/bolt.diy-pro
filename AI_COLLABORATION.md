# AI Collaboration Guide

## Purpose

This document is the fast onboarding guide for humans and AI agents working on `bolt.diy-pro`. It explains where to look, how to make safe changes and how to keep AI-assisted development grounded in the actual codebase.

## Project Intent

`bolt.diy-pro` is an AI-powered full-stack development workbench. Optimize changes for the main product loop: prompt, generation, files, terminal, preview, diff, export and deployment.

## Start Here

Read these files before making non-trivial changes:

- [README.md](./README.md): product overview and setup.
- [DESIGN.md](./DESIGN.md): product and UX design.
- [ARCHITECTURE.md](./ARCHITECTURE.md): runtime shape and extension points.
- [TECH_STACK.md](./TECH_STACK.md): technology stack and commands.
- [LLM_INTEGRATION.md](./LLM_INTEGRATION.md): provider, prompt, context and MCP rules.
- [DATA_GOVERNANCE.md](./DATA_GOVERNANCE.md): data and secret-handling rules.
- [OPERATIONS.md](./OPERATIONS.md): run, test, build and troubleshooting flows.

## Code Map for AI Agents

```text
app/routes/                  Remix pages and API boundaries
app/components/              React UI, settings, chat, workbench
app/lib/.server/llm/         server-side LLM streaming and prompt composition
app/lib/modules/llm/         provider registry and model providers
app/lib/runtime/             model output parser and action execution
app/lib/stores/              workbench, chat and settings state
app/lib/services/            external service integrations
app/lib/persistence/         local persistence helpers
electron/                    desktop main and preload code
functions/                   Cloudflare Pages Functions entry
scripts/                     development/build helper scripts
```

## Safe Change Protocol

Before editing:

1. Inspect the files directly involved in the change.
2. Check existing tests near the target code.
3. Identify whether the change affects web, desktop, Cloudflare, or all runtimes.
4. Check integration token and secret handling when touching external services.

While editing:

1. Keep changes scoped to the requested behavior.
2. Follow existing naming and route conventions.
3. Prefer existing services, stores and helpers over new abstractions.
4. Do not expose secrets in logs, client payloads or generated docs.
5. Keep generated work inspectable through files, terminal, preview or diff state.

After editing:

1. Run the narrowest relevant tests first.
2. Run `pnpm run typecheck`, `pnpm run lint` and `pnpm run test` when the blast radius is broad.
3. Update docs when product behavior, architecture or workflows change.

## Prompt and Model Work

When modifying prompts or model orchestration:

- Keep provider-specific behavior isolated under the LLM modules.
- Preserve compatibility with multiple model providers.
- Avoid assuming one model family's tool or reasoning behavior is universal.
- Add tests for parameter filtering, context selection or parser behavior when possible.
- Treat model output as untrusted until parsed and validated.

## Runtime Output Safety

The parser and action runner convert model output into executable changes. Treat them as high-risk code.

Any change to these areas should consider:

- malformed XML-like artifact/action tags
- partial streaming chunks
- duplicate or out-of-order actions
- file path safety
- shell action ordering
- preview/start command behavior
- user-visible rollback or diff state

## Testing Expectations

Use colocated Vitest specs for deterministic logic:

```bash
pnpm run test
```

Good test targets for AI-assisted changes:

- parser edge cases
- route validation
- provider/model normalization
- settings UI contracts
- utility functions used by runtime actions

For UI or preview work, prefer a real local run:

```bash
pnpm run dev
```

Then verify the affected route in the browser.

## Documentation Expectations

Update docs when changing:

- supported providers or integration flows
- environment variables
- runtime architecture
- data handling behavior
- developer commands
- prompt or model-output contracts

## Commit Convention

Use one-line English semantic commit messages:

```text
feat: add provider model cache
fix: resolve preview startup error
update: document workbench architecture
chore: refresh dependencies
refactor: simplify model registry
docs: add AI collaboration guide
test: cover route validation
```

Allowed types are `feat`, `fix`, `update`, `chore`, `refactor`, `docs`, `style` and `test`.

## Things to Avoid

- Do not invent behavior without reading the relevant files.
- Do not hard-code behavior for a single test input.
- Do not bypass the LLM provider registry for a new provider.
- Do not commit real `.env.local` secrets.
- Do not hide generated changes from users.
- Do not make provider-specific behavior global without a clear reason.
