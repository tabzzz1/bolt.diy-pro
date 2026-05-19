# Data Governance

## Purpose

This document defines the practical data-handling rules for `bolt.diy-pro`: local app data, chat history, integration tokens, provider keys and diagnostic information.

## Data Classes

### Local App Data

Examples:

- chats
- settings
- generated project files
- workbench state
- import/export payloads

Primary storage is browser/local storage and IndexedDB through helpers under `app/lib/persistence/**` and related stores.

### Integration Tokens and Secrets

Examples:

- LLM provider API keys
- GitHub and GitLab tokens
- Vercel and Netlify tokens
- Supabase URL, anon key and access tokens
- Cloudflare bindings

Rules:

- Never commit real secrets.
- Never log raw API keys or tokens.
- Never return secrets in client payloads unless the route is explicitly an export/configuration feature.
- Prefer server-side calls when a token does not need to reach the browser.
- Keep `.env.local` out of version control.

### Diagnostics and Logs

Diagnostics should help users and developers understand failures without exposing sensitive payloads. Log structured context, not raw secrets or large private content.

## Environment Files

The project uses:

- `.env.example`
- `.env.production`
- local `.env` / `.env.local`
- Cloudflare bindings typed by `worker-configuration.d.ts`

Vite loads `.env.local`, then `.env`, then default process env.

## Import and Export

Settings and chat import/export should remain explicit user actions. Destructive operations should require confirmation and should report what was affected.

## AI Context Rules

Prompts and model context may contain source code, chat content and tool results. Treat model-bound context as sensitive.

Rules:

- Send the smallest context that can solve the task.
- Avoid sending secrets to model providers.
- Do not persist raw prompt context unless the user-facing feature clearly requires it.
- Prefer summaries and references for long-term operational records.
- Keep provider-specific constraints in the provider layer.

## Integration Handling

Third-party integrations include model providers, MCP tools, GitHub, GitLab, Vercel, Netlify and Supabase.

When adding or changing an integration:

1. Document required env vars.
2. Validate request payloads at route boundaries.
3. Use structured errors and status codes.
4. Avoid logging raw third-party responses if they may contain sensitive data.
5. Add tests for missing-token and invalid-token paths when practical.

## Developer Checklist

Before merging data-affecting changes:

- Does the change introduce new user data?
- Is the storage location clear?
- Is export/import behavior affected?
- Are destructive operations confirmed?
- Are secrets excluded from logs and client payloads?
- Is documentation updated?

## Related Documents

- [DESIGN.md](./DESIGN.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [AI_COLLABORATION.md](./AI_COLLABORATION.md)
