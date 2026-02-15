# MCP Server Patterns

**When to apply:** Implementing or modifying MCP tools, resources, or the server entry point.

## Server setup

- Entry point: `src/index.ts` creates `McpServer` (name `uiforge`, version from `package.json`).
- Transport: `StdioServerTransport` from `@modelcontextprotocol/sdk/server/stdio.js`.
- Register all 7 tools + 1 resource, then `await server.connect(transport)`.

## Tool implementation pattern

Each tool file in `src/tools/` must:

1. Export a Zod schema for the tool input.
2. Export a handler function that receives the validated input.
3. Return structured output (not throw for expected failures).
4. Use `IGeneratedFile[]` for any file output.
5. Update `DesignContextStore` when the tool modifies design state.

```typescript
// Pattern for src/tools/<tool-name>.ts
import { z } from 'zod';
import type { IGeneratedFile } from '../lib/types.js';

export const toolNameSchema = z.object({
  param: z.string().describe('Description for MCP'),
});

export type TToolNameInput = z.infer<typeof toolNameSchema>;

export async function toolName(input: TToolNameInput): Promise<{ files: IGeneratedFile[] }> {
  // implementation
}
```

## Resource pattern

- `application://current-styles` returns `IDesignContext` as `application/json`.
- Read from `DesignContextStore.get()`.
- Updated by: style audit, Figma parser, prototype/image generation.

## Design context flow

- `DesignContextStore` is the session-scoped singleton source of truth.
- Tools that extract styles (Figma parser, design inspiration, style audit) → update the store.
- Tools that generate output (component, prototype, image) → read from the store.
- The `current-styles` resource exposes the store to the AI agent.

## Template functions

- Located in `src/lib/templates/`.
- Pure functions: `(config) => IGeneratedFile[]`.
- No side effects, no I/O. All file content is generated in-memory.
- Framework-specific: `react.ts`, `nextjs.ts`, `vue.ts`, `angular.ts`.
- React/Next.js templates include full Shadcn/ui setup (registry, `cn`, base components).
