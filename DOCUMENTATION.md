# Documentation Map

## Root Documents

- [README.md](./README.md): product overview, setup and feature list.
- [README_EN.md](./README_EN.md): English product overview, setup and feature list.
- [README_OLD.md](./README_OLD.md): previous long-form README kept for upstream detail and history.
- [DESIGN.md](./DESIGN.md): product and UX design.
- [ARCHITECTURE.md](./ARCHITECTURE.md): runtime architecture, layers and extension points.
- [TECH_STACK.md](./TECH_STACK.md): languages, frameworks, dependencies and commands.
- [LLM_INTEGRATION.md](./LLM_INTEGRATION.md): model provider, prompt, context and MCP integration guide.
- [AI_COLLABORATION.md](./AI_COLLABORATION.md): guide for humans and AI agents working in this repo.
- [DATA_GOVERNANCE.md](./DATA_GOVERNANCE.md): local data, secrets and integration data rules.
- [OPERATIONS.md](./OPERATIONS.md): runbook for development, build, test, deploy and troubleshooting.
- [ROADMAP.md](./ROADMAP.md): project improvement roadmap.
- [PROJECT.md](./PROJECT.md): upstream project management guide.
- [CONTRIBUTING.md](./CONTRIBUTING.md): contribution guide.
- [FAQ.md](./FAQ.md): common upstream questions.
- [CHANGES.md](./CHANGES.md) and [changelog.md](./changelog.md): change history.
- [CLAUDE.md](./CLAUDE.md): generated project context used by previous AI workflows.

## Notes

- `notes/` contains supplemental technical notes and thesis material.
- `docs/` contains the documentation-site scaffolding and related assets.

## When to Update What

Update [DESIGN.md](./DESIGN.md) when product scope or UX principles change.

Update [ARCHITECTURE.md](./ARCHITECTURE.md) when runtime boundaries, key flows or extension points change.

Update [TECH_STACK.md](./TECH_STACK.md) when dependencies, platform targets, commands or env requirements change.

Update [LLM_INTEGRATION.md](./LLM_INTEGRATION.md) when provider registration, prompt contracts, MCP behavior or context optimization changes.

Update [AI_COLLABORATION.md](./AI_COLLABORATION.md) when AI-assisted workflows, agent rules or safe-change protocols change.

Update [DATA_GOVERNANCE.md](./DATA_GOVERNANCE.md) when data handling, export/import behavior, secrets handling or integration tokens change.

Update [OPERATIONS.md](./OPERATIONS.md) when setup, build, deploy, test or troubleshooting steps change.

## Reading Path

For a new contributor:

```text
README.md
  -> DOCUMENTATION.md
  -> DESIGN.md
  -> TECH_STACK.md
  -> ARCHITECTURE.md
  -> OPERATIONS.md
```

For an AI agent:

```text
AI_COLLABORATION.md
  -> DESIGN.md
  -> ARCHITECTURE.md
  -> LLM_INTEGRATION.md
  -> DATA_GOVERNANCE.md
  -> relevant source files
  -> relevant tests
```
