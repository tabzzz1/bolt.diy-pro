# Coding Conventions

**Analysis Date:** 2026-04-01

## Naming Patterns

**Files:**
- Route files use Remix route naming with dotted segments and dynamic markers: `app/routes/api.llmcall.ts`, `app/routes/api.models.$provider.ts`, `app/routes/chat.$id.tsx`.
- React component files are mostly PascalCase: `app/components/chat/ChatBox.tsx`, `app/components/workbench/Terminal.tsx`.
- Hooks follow `useXxx` camelCase with `use` prefix: `app/lib/hooks/useSettings.ts`, `app/lib/hooks/useGitHubAPI.ts`.
- Utility files are lower camelCase or noun-based: `app/utils/selectStarterTemplate.ts`, `app/utils/fileLocks.ts`, `app/utils/projectCommands.ts`.
- Test files use `*.spec.ts` and colocate with source: `app/components/chat/Markdown.spec.ts`, `app/lib/runtime/message-parser.spec.ts`.

**Functions:**
- Runtime/business functions use `camelCase`: `getCompletionTokenLimit`, `validateTokenLimits`, `llmCallAction` in `app/routes/api.llmcall.ts`.
- React components use PascalCase exports: `GitHubTab`, `ControlPanel`, `ChatBox` in `app/components/**`.

**Variables:**
- Constants are UPPER_SNAKE_CASE: `MAX_TOKENS`, `PROVIDER_COMPLETION_LIMITS` in `app/routes/api.llmcall.ts`.
- Local runtime variables use camelCase: `dynamicMaxTokens`, `providerInfo`, `finalParams` in `app/routes/api.llmcall.ts`.

**Types:**
- Interface/type names are PascalCase: `ModelInfo`, `ProviderSetting`, `Shortcut`, `ParserCallbacks`.
- Union/string literal types are used for controlled values: `DebugLevel` in `app/utils/logger.ts`.

## Code Style

**Formatting:**
- Tool used: Prettier (`.prettierrc`).
- Key settings (evidence):
  - `printWidth: 120` (`.prettierrc:2`)
  - `singleQuote: true` (`.prettierrc:3`)
  - `tabWidth: 2` (`.prettierrc:4`)
  - `semi: true` (`.prettierrc:5`)
  - `bracketSpacing: true` (`.prettierrc:6`)

**Linting:**
- Tool used: ESLint flat config + TypeScript ESLint (`eslint.config.mjs`).
- Key rules (evidence):
  - `consistent-return: error` (`eslint.config.mjs:33`)
  - `semi: ['error', 'always']` (`eslint.config.mjs:34`)
  - `linebreak-style: ['error', 'unix']` (`eslint.config.mjs:44`)
  - `@typescript-eslint/no-unused-vars` with `_` ignore patterns (`eslint.config.mjs:27`)
  - `@typescript-eslint/no-explicit-any` is disabled (`eslint.config.mjs:17`)

## Import Organization

**Order:**
1. External framework/packages first (`@remix-run/*`, `ai`) in `app/routes/api.llmcall.ts`.
2. Internal aliases (`~/...`) next in `app/routes/api.llmcall.ts`, `app/lib/stores/settings.ts`.
3. Type-only imports are used where possible (`import type { ... }`) in `app/routes/api.llmcall.ts`, `app/lib/runtime/message-parser.ts`.

**Path Aliases:**
- `~/* -> ./app/*` via TypeScript paths (`tsconfig.json`).
- Use alias imports for app-internal modules (example: `~/utils/logger` in `app/routes/api.llmcall.ts:10`).

## Error Handling

**Patterns:**
- Route-level validation failures throw `Response` with HTTP status for API semantics (`app/routes/api.llmcall.ts:80`, `app/routes/api.llmcall.ts:87`, `app/routes/api.llmcall.ts:124`).
- Operational failures frequently use `try/catch` and fallback HTTP 500 (`app/routes/api.llmcall.ts:120`, `app/routes/api.llmcall.ts:147`, `app/routes/api.llmcall.ts:241`).
- Service/store layers often throw `Error` with contextual messages (`app/lib/stores/settings.ts`, `app/lib/services/mcpService.ts`).
- In multiple modules, errors are logged and swallowed with defaults (for example returning `[]` in `fetchConfiguredProviders` at `app/lib/stores/settings.ts`).

## Logging

**Framework:** custom scoped logger + console mixed usage.

**Patterns:**
- Preferred structured logger exists: `createScopedLogger` in `app/utils/logger.ts`, used in `app/routes/api.llmcall.ts:10` and `app/routes/api.llmcall.ts:25`.
- Console logging remains common in route/service code: `console.log(error)` in `app/routes/api.llmcall.ts:121` and `app/routes/api.llmcall.ts:242`.
- Use `logger.info/warn/error` for new code in app runtime paths; avoid raw `console.*` except bootstrapping and local diagnostics.

## Comments

**When to Comment:**
- Comments explain intent for fallback branches and API quirks (examples in `app/routes/api.llmcall.ts`, `vite.config.ts`).
- Inline disable comments are used sparingly for rule exceptions: `app/components/workbench/Preview.tsx:317`.

**JSDoc/TSDoc:**
- Sparse and selective; not uniformly required.
- Present around configuration/behavioral blocks (example comments in `playwright.config.preview.ts`).

## Function Design

**Size:**
- Both small utility functions and large orchestration functions coexist.
- Example of larger orchestration: `llmCallAction` in `app/routes/api.llmcall.ts` handles parsing, validation, token strategy, provider resolution, and response mapping.

**Parameters:**
- Prefer typed object parameters for extensibility (example: `getModelList(options)` in `app/routes/api.llmcall.ts`).

**Return Values:**
- API routes return `Response` objects consistently.
- Utility and store functions return typed values/fallbacks; some return empty collections on failure (`app/lib/stores/settings.ts`).

## Module Design

**Exports:**
- Named exports dominate in app modules (`export const`, `export function`, `export type`).
- Barrel exports are used for UI/settings subtrees (`app/components/ui/index.ts`, `app/components/@settings/index.ts`).

**Barrel Files:**
- In active use for UI and integration submodules.
- Use barrel files for consumer-facing component groups; keep deep runtime modules with direct file imports for clarity.

## CI Signals Relevant To Conventions

- CI enforces typecheck + lint + tests (`.github/workflows/ci.yaml:37`, `.github/workflows/ci.yaml:48`, `.github/workflows/ci.yaml:51`).
- Pre-commit gate also enforces `pnpm typecheck` and `pnpm lint` (`.husky/pre-commit:18`, `.husky/pre-commit:26`).
- PR title semantic policy is enforced (`.github/workflows/semantic-pr.yaml`).

## Subsystem Keyword Check (`做`)

- Code subsystem match: Not detected in `app/**` TypeScript/TSX runtime paths.
- Non-code docs contain the keyword in product notes (`notes/product-plan-lifebegins/**`), treated as out-of-scope for code conventions.

---

*Convention analysis: 2026-04-01*
