# Roadmap: bolt.diy-pro

## Direction

`bolt.diy-pro` should continue improving as a practical AI development workbench. The roadmap should prioritize reliability, model/provider breadth, preview quality, inspectable changes and deployment workflows.

## Current Focus Areas

### Workbench Reliability

- Keep file generation, terminal actions and preview startup stable.
- Improve error messages around failed shell commands and preview failures.
- Preserve diffs and file state clearly across retries.

### Model Provider Experience

- Keep provider registration centralized.
- Make missing API keys and invalid model names easier to diagnose.
- Keep reasoning-model option filtering correct.
- Avoid provider-specific assumptions in shared UI.

### Context and Prompt Quality

- Keep build mode and discussion mode behavior distinct.
- Improve context selection without sending unnecessary files.
- Keep artifact/action output contracts stable.
- Add tests when prompt changes affect output structure.

### Integrations

- Keep GitHub, GitLab, Vercel, Netlify, Supabase and MCP flows optional and resilient.
- Improve missing-token and invalid-token responses.
- Keep deployment payloads and project metadata explicit.

### Desktop and Distribution

- Maintain Electron development and packaging flows.
- Keep Cloudflare Pages and Docker paths documented.
- Keep release notes and troubleshooting instructions current.

## Quality Goals

- Typecheck, lint and tests should remain the baseline local gate.
- Runtime parser and action runner changes need focused tests.
- Route handlers should validate inputs and return structured errors.
- Documentation should stay aligned with actual commands and architecture.

## Non-goals

- Do not rewrite the core runtime without a concrete migration plan.
- Do not add product areas unrelated to AI-assisted development.
- Do not make one provider the implicit default for all behavior.
- Do not hide generated changes from users.

## Related Documents

- [DESIGN.md](./DESIGN.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [TECH_STACK.md](./TECH_STACK.md)
- [OPERATIONS.md](./OPERATIONS.md)
