# bolt.diy-pro

[中文](./README.md) · [Old README](./README_OLD.md)

> An AI full-stack development workbench forked from and built on top of [bolt.diy](https://github.com/stackblitz-labs/bolt.diy).

## Overview

`bolt.diy-pro` keeps the core `bolt.diy` experience: generate, edit, run, preview, inspect and deploy Node.js web projects through AI chat in the browser. This repository also adds project-specific documentation and development guidance for easier maintenance.

For the previous long-form README with more upstream installation details, history and community information, see [README_OLD.md](./README_OLD.md).

## Features

| Area | Description |
| --- | --- |
| Model providers | OpenAI, Anthropic, Google, Groq, DeepSeek, OpenRouter, Ollama, LM Studio, Amazon Bedrock, GitHub Models and more |
| AI workbench | Chat generation, file editing, terminal execution, live preview and diffs |
| Project operations | Import, ZIP export, snapshot restore, chat/settings import and export |
| Deployment | Vercel and Netlify deployment flows |
| Code platforms | GitHub and GitLab integrations |
| Data services | Supabase connection, variables and query support |
| Extensibility | MCP tool integration |
| Local runtime | Electron desktop app and Docker support |

## Tech Stack

| Category | Stack |
| --- | --- |
| Frontend | React 18, Remix 2, Vite 5, UnoCSS |
| Language | TypeScript |
| AI | Vercel AI SDK, MCP SDK |
| Runtime | WebContainer, Cloudflare Pages Functions, Electron |
| Tooling | pnpm, Vitest, ESLint, Prettier, Docker |

See [TECH_STACK.md](./TECH_STACK.md) and [ARCHITECTURE.md](./ARCHITECTURE.md) for more details.

## Quick Start

Node.js 22 and pnpm are recommended.

```bash
pnpm install
cp .env.example .env
cp .env.example .env.local
pnpm run dev
```

Fill in only the provider, deployment or Supabase keys you need. Do not commit real secrets.

## Common Commands

| Command | Purpose |
| --- | --- |
| `pnpm run dev` | Start local development |
| `pnpm run build` | Build the web app |
| `pnpm run start` | Serve the build with Wrangler |
| `pnpm run preview` | Build and preview |
| `pnpm run typecheck` | Run TypeScript checks |
| `pnpm run lint` | Run ESLint |
| `pnpm run test` | Run Vitest tests |

## Docker

```bash
# Development
pnpm run dockerbuild
docker compose --profile development up

# Production
pnpm run dockerbuild:prod
docker compose --profile production up
```

## Electron

```bash
# Development
pnpm electron:dev

# Build all desktop packages
pnpm electron:build:dist

# Platform-specific builds
pnpm electron:build:mac
pnpm electron:build:win
pnpm electron:build:linux
```

## Documentation

| Document | Purpose |
| --- | --- |
| [README.md](./README.md) | 中文 README |
| [DESIGN.md](./DESIGN.md) | Product positioning and UX principles |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture and module layers |
| [TECH_STACK.md](./TECH_STACK.md) | Stack and dependency overview |
| [LLM_INTEGRATION.md](./LLM_INTEGRATION.md) | Models, prompts, context and MCP integration |
| [AI_COLLABORATION.md](./AI_COLLABORATION.md) | AI-assisted development rules |
| [DATA_GOVERNANCE.md](./DATA_GOVERNANCE.md) | Data and secret-handling rules |
| [OPERATIONS.md](./OPERATIONS.md) | Run, build, deploy and troubleshooting guide |
| [DOCUMENTATION.md](./DOCUMENTATION.md) | Documentation map |
| [README_OLD.md](./README_OLD.md) | Previous full README |

## Upstream Relationship

This project is forked from and based on [stackblitz-labs/bolt.diy](https://github.com/stackblitz-labs/bolt.diy).

Upstream resources:

- [bolt.diy GitHub](https://github.com/stackblitz-labs/bolt.diy)
- [bolt.diy Docs](https://stackblitz-labs.github.io/bolt.diy/)
- [bolt.diy Community](https://thinktank.ottomator.ai)

## License

This project inherits the upstream MIT License. When using the WebContainer API, also review its production and commercial usage requirements.
