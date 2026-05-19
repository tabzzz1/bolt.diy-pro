# LLM Integration

## Purpose

This project is a multi-provider AI coding workbench. LLM integration is not a thin API call; it includes provider discovery, prompt composition, context optimization, MCP tools, streaming, artifact parsing and executable workbench actions.

Use this document when changing model providers, prompts, context selection, MCP behavior or model-output contracts.

## Provider Architecture

Provider registration is centralized under:

```text
app/lib/modules/llm/
```

Important files:

- `manager.ts`: owns `LLMManager`, provider registration, model list updates and provider lookup.
- `registry.ts`: exports provider classes.
- `providers/*.ts`: provider-specific implementations.
- `types.ts`: normalized provider/model types.

The registry currently includes providers such as Anthropic, Cerebras, Cohere, DeepSeek, Fireworks, Google, Groq, HuggingFace, Hyperbolic, Mistral, Moonshot, Ollama, OpenAI, OpenRouter, OpenAI-like, Perplexity, xAI, Together, LM Studio, Amazon Bedrock, GitHub Models and Z.ai.

## Chat Streaming Flow

The main chat route is:

```text
app/routes/api.chat.ts
```

High-level flow:

```text
request body
  -> messages/files/prompt/settings/options
  -> cookie provider keys and provider settings
  -> MCP tool invocation processing
  -> optional chat summary
  -> optional context file selection
  -> streamText
  -> Vercel AI SDK data stream
  -> client parser/action runner
```

`api.chat` also handles:

- progress annotations
- token usage accumulation
- stream timeout recovery
- continuation when finish reason is `length`
- provider-facing error message normalization

## Prompt Composition

Server-side prompt composition lives in:

```text
app/lib/.server/llm/stream-text.ts
```

The effective system prompt can include:

- base system prompt from `PromptLibrary` or default prompt
- build-mode artifact output contract
- selected code context buffer
- chat summary
- locked-file instructions
- skills guidance
- MCP tool guidance

Build mode expects model output to include a valid artifact/action block. Discuss mode uses a discussion prompt and should not force file actions.

## Output Contract

For implementation/build requests, the model should output one `<boltArtifact>` block with one or more `<boltAction>` entries.

Common action types include:

- file
- shell
- build
- start

This output is parsed by:

```text
app/lib/runtime/message-parser.ts
```

And executed by:

```text
app/lib/runtime/action-runner.ts
```

Changes to this contract are high-risk because they affect generated files, shell commands, previews and user-visible diffs.

## Context Optimization

When context optimization is enabled and files exist, `/api/chat` can:

1. Generate a chat summary with `createSummary`.
2. Select relevant files with `selectContext`.
3. Attach a code-context annotation to the stream.
4. Send a reduced context buffer to the model.

Relevant files:

- `app/lib/.server/llm/create-summary.ts`
- `app/lib/.server/llm/select-context.ts`
- `app/lib/.server/llm/utils.ts`

The context selector is intentionally constrained. It should include only relevant files and avoid expanding context without clear need.

## MCP Tools

MCP support lives in:

```text
app/lib/services/mcpService.ts
```

Supported server config types:

- `stdio`
- `sse`
- `streamable-http`

The service:

- validates MCP server config with Zod
- creates MCP clients
- registers tools per server
- exposes tool metadata without execute functions to the model
- processes user approval/rejection results before executing tools
- annotates tool calls for the frontend

MCP tools are exposed only when available and when the prompt suggests external information or explicit tool usage is needed.

## Reasoning Model Handling

Reasoning models use different token and option behavior.

`stream-text.ts` filters unsupported options for reasoning models, including:

- `temperature`
- `topP`
- `presencePenalty`
- `frequencyPenalty`
- `logprobs`
- `topLogprobs`
- `logitBias`

It uses `maxCompletionTokens` for reasoning models and `maxTokens` for traditional models.

## Adding a Provider

1. Create a provider class in `app/lib/modules/llm/providers/`.
2. Extend the existing base provider pattern.
3. Export the provider from `app/lib/modules/llm/registry.ts`.
4. Add env typing in `worker-configuration.d.ts` if new env vars are needed.
5. Add static models or dynamic model discovery.
6. Ensure missing/invalid keys fail with structured, user-meaningful errors.
7. Add tests around model normalization or route behavior when possible.

## Changing Prompts

Before changing prompts, check whether the change affects:

- build mode
- discuss mode
- context optimization
- locked files
- Supabase connection instructions
- MCP tool usage
- skills guidance
- artifact/action formatting

Prompt changes should be paired with parser or route tests when they affect model-output structure.

## Safety Rules

- Treat model output as untrusted until parsed.
- Do not send secrets to model providers.
- Keep provider-specific behavior inside provider modules.
- Do not expose MCP tools for ordinary code-generation tasks unless external information is required.
- Preserve locked-file instructions.
- Avoid changing parser/action-runner contracts without tests.
- Keep product-specific business data separate from generic prompt/runtime state.

## Related Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [TECH_STACK.md](./TECH_STACK.md)
- [AI_COLLABORATION.md](./AI_COLLABORATION.md)
- [DATA_GOVERNANCE.md](./DATA_GOVERNANCE.md)
