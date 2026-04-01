# Testing Patterns

**Analysis Date:** 2026-04-01

## Test Framework

**Runner:**
- Vitest `^2.1.7` (`package.json:213`).
- Config location: `vite.config.ts` (`test.exclude` at `vite.config.ts:76`).

**Assertion Library:**
- Vitest built-in assertions (`expect`, `describe`, `it`) used in:
  - `app/components/chat/Markdown.spec.ts`
  - `app/utils/diff.spec.ts`
  - `app/lib/runtime/message-parser.spec.ts`

**Run Commands:**
```bash
pnpm run test            # Run all tests once (vitest --run)
pnpm run test:watch      # Watch mode (vitest)
pnpm run lint            # Static quality gate paired with tests
pnpm run typecheck       # Type gate paired with tests
```

Evidence for commands: `package.json:17`, `package.json:18`, `package.json:19`, `package.json:28`.

## Test File Organization

**Location:**
- Co-located `*.spec.ts` near source files.
- Observed paths:
  - `app/components/chat/Markdown.spec.ts`
  - `app/utils/diff.spec.ts`
  - `app/lib/runtime/message-parser.spec.ts`

**Naming:**
- Suffix pattern: `*.spec.ts`.
- Snapshot pattern: `*.spec.ts.snap` in `app/lib/runtime/__snapshots__/message-parser.spec.ts.snap`.

**Structure:**
```
app/
  components/**/X.spec.ts
  utils/**/X.spec.ts
  lib/runtime/**/X.spec.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, expect, it, vi, beforeEach } from 'vitest';

describe('FeatureName', () => {
  it('does something', () => {
    expect(result).toBe(expected);
  });

  describe('nested behavior', () => {
    beforeEach(() => {
      // setup
    });
  });
});
```

Pattern evidence: `app/lib/runtime/message-parser.spec.ts`, `app/components/chat/Markdown.spec.ts`.

**Patterns:**
- Table-driven cases with `it.each` for parser variants (`app/lib/runtime/message-parser.spec.ts`).
- Small deterministic unit assertions for utility functions (`app/utils/diff.spec.ts`).
- String normalization and edge-case tests for UI helper behavior (`app/components/chat/Markdown.spec.ts`).

## Mocking

**Framework:**
- Vitest mocks via `vi.fn()`.

**Patterns:**
```typescript
const callbacks = {
  onArtifactOpen: vi.fn(),
  onArtifactClose: vi.fn(),
  onActionOpen: vi.fn(),
  onActionClose: vi.fn(),
};
```

Evidence: `app/lib/runtime/message-parser.spec.ts` (Enhanced parser cases).

**What to Mock:**
- Callback interfaces and event sinks for parser/runtime behaviors.
- External side effects in unit tests should be mocked with `vi.fn`/module mocks.

**What NOT to Mock:**
- Pure string/path utility functions (`app/utils/diff.ts`) where direct input-output assertion is simpler.

## Fixtures and Factories

**Test Data:**
```typescript
it.each<[string | string[], ExpectedResult | string]>([
  ['Foo bar', 'Foo bar'],
  [['Foo bar <', 's', 'p', 'an>some text</span>'], 'Foo bar <span>some text</span>'],
])(...)
```

Evidence: `app/lib/runtime/message-parser.spec.ts`.

**Location:**
- Inline fixtures inside each spec file.
- Snapshot files under `app/lib/runtime/__snapshots__/`.

## Coverage

**Requirements:**
- No enforced coverage threshold detected in config/scripts.
- CI uploads `coverage/` artifact (`.github/workflows/ci.yaml:54`) but repository scripts do not define a dedicated coverage command.

**View Coverage:**
```bash
pnpm run test
# coverage upload exists in CI, but local explicit coverage command not declared in package scripts
```

## Test Types

**Unit Tests:**
- Primary and currently implemented test type.
- Scope includes parser runtime logic, utility functions, and markdown transformation.

**Integration Tests:**
- Limited integration-like scenarios inside parser spec (model output pattern cases) in `app/lib/runtime/message-parser.spec.ts`.

**E2E Tests:**
- Playwright preview config exists (`playwright.config.preview.ts`) but `tests/preview/**` not present and excluded from Vitest (`vite.config.ts:82`).

## CI Signals

- Main CI runs typecheck, lint, tests (`.github/workflows/ci.yaml:37`, `.github/workflows/ci.yaml:48`, `.github/workflows/ci.yaml:51`).
- Quality workflow includes additional checks, but many are non-blocking (`continue-on-error: true`) at `.github/workflows/quality.yaml:38`, `.github/workflows/quality.yaml:44`, `.github/workflows/quality.yaml:50`, `.github/workflows/quality.yaml:56`, `.github/workflows/quality.yaml:62`, `.github/workflows/quality.yaml:96`, `.github/workflows/quality.yaml:120`.
- Pre-commit enforces local typecheck+lint (`.husky/pre-commit:18`, `.husky/pre-commit:26`).

## Common Patterns

**Async Testing:**
```typescript
it('should detect shell commands in code blocks', () => {
  const parser = new EnhancedStreamingMessageParser({ callbacks });
  parser.parse('test_id', input);
  expect(callbacks.onActionOpen).toHaveBeenCalledWith(expect.objectContaining({...}));
});
```

**Error Testing:**
- Direct throw assertions are limited in current specs; most tests validate transformed output and callback calls.
- Expand with explicit failing-path expectations for route/service logic (for example API validation and error mapping in `app/routes/api.llmcall.ts`).

## Test Coverage Gaps (Actionable)

- API route handlers under `app/routes/api.*.ts` have minimal direct unit coverage.
- Store/service modules under `app/lib/stores/*.ts` and `app/lib/services/*.ts` have sparse dedicated tests.
- No active preview/e2e test files under `tests/preview/` despite Playwright config presence.
- No scripted coverage threshold gate in `package.json`.

## Subsystem Keyword Check (`做`)

- Runtime test subsystem match in code: Not detected.
- Keyword appears in product planning markdown under `notes/product-plan-lifebegins/**`; excluded from executable test architecture.

---

*Testing analysis: 2026-04-01*
