# Design: bolt.diy-pro

## Purpose

`bolt.diy-pro` is an AI-powered full-stack development workbench. Its core experience is turning a natural-language request into runnable project files, terminal actions, previews, diffs and deployable output.

The product should feel like a practical development environment first: fast to start, clear about what changed, forgiving when something fails and flexible enough to work with different model providers and deployment targets.

## Product Positioning

`bolt.diy-pro` extends the open-source `bolt.diy` experience with a local-first, multi-provider development workflow. It should remain recognizable as a coding workbench rather than a marketing site, documentation portal or generic chatbot.

The primary product loop is:

```text
Prompt
  -> model response
  -> artifact/action parsing
  -> file changes and shell commands
  -> preview and debugging
  -> export, Git or deployment
```

## Target Users

The main users are developers, technical founders, students and builders who want to prototype or maintain Node-based web applications with AI assistance.

They need:

- fast project generation and iteration
- model/provider choice
- visible file diffs and command output
- browser-based preview
- project import/export
- Git and deployment integrations
- settings that make local and hosted workflows predictable

## Design Principles

### 1. Keep the Workbench Primary

The first screen should prioritize the chat and development workspace. Settings, integrations and diagnostics support the workbench; they should not dominate it.

### 2. Make AI Actions Inspectable

Generated changes should be visible through files, diffs, terminal output and preview state. Users should never feel that work happened in a hidden black box.

### 3. Prefer Progressive Complexity

Common flows should be simple. Advanced provider settings, MCP configuration, deployment tokens and diagnostics should be available without cluttering the main path.

### 4. Preserve Provider Flexibility

The UI and prompt behavior should avoid assuming one model provider. Provider-specific quirks belong in provider modules and model metadata, not scattered through components.

### 5. Design for Recovery

AI-generated code and shell actions can fail. The product should make failure states clear, preserve useful context and let users retry or adjust without losing work.

## Core Experience Areas

### Chat

The chat surface collects user intent, provider/model metadata and mode-specific behavior. Build mode should produce artifacts and actions; discussion mode should answer without forcing file changes.

### Workbench

The workbench includes file editing, terminal output, preview, diffs and project controls. It is the user-visible proof of what the AI changed.

### Model and Provider Settings

Provider selection should make model availability, token requirements and missing API keys understandable. Dynamic model discovery should degrade gracefully.

### Integrations

GitHub, GitLab, Vercel, Netlify, Supabase and MCP integrations should be optional and clearly scoped. Missing tokens or unavailable services should produce actionable errors.

### Data and Settings

Settings import/export, chat import/export and API key import/export should remain predictable and explicit. Destructive operations require confirmation.

## Interaction Guidelines

- Use compact controls for repeated development actions.
- Keep status indicators close to the surface they describe.
- Prefer direct command labels over explanatory copy inside the app.
- Avoid adding modal-heavy flows to the main generation path.
- Use toasts for short operation feedback, not for critical state.
- Keep disabled controls visible when they explain unavailable functionality.

## Information Architecture

Recommended top-level areas:

```text
Chat and Workbench
Settings
  -> Providers
  -> Features
  -> Data
  -> GitHub / GitLab
  -> Vercel / Netlify
  -> Supabase
  -> MCP
  -> Event logs / diagnostics
```

## Non-goals

`bolt.diy-pro` should not become a general note-taking system, project management suite or unrelated product shell. New features should strengthen AI-assisted development, local execution, inspection, integration or deployment.

## Related Documents

- [README.md](./README.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [TECH_STACK.md](./TECH_STACK.md)
- [LLM_INTEGRATION.md](./LLM_INTEGRATION.md)
- [AI_COLLABORATION.md](./AI_COLLABORATION.md)
- [DATA_GOVERNANCE.md](./DATA_GOVERNANCE.md)
- [OPERATIONS.md](./OPERATIONS.md)
