---
description: Implement or modify MCP tools in siza-mcp. Use when adding new tools, editing tool handlers, or changing tool schemas.
---

# MCP Tool Development

## When to use

- Adding a new MCP tool to `src/tools/`
- Modifying tool input schemas or handler logic
- Changing how tools interact with `DesignContextStore`
- Registering tools in `src/index.ts`

## Structure

- **Entry**: `src/index.ts` — McpServer setup, tool/resource registration
- **Tools**: `src/tools/<tool-name>.ts` — one file per tool
- **Schemas**: Zod schemas co-located with tool handlers
- **Types**: `src/lib/types.ts` — shared interfaces

## Implementation pattern

1. Define Zod schema with `.describe()` on each field
2. Export typed input type: `type TInput = z.infer<typeof schema>`
3. Export async handler function returning structured output
4. Register in `src/index.ts` with `server.tool(name, description, schema, handler)`

## Design context integration

- Tools that extract styles → call `designContextStore.update()`
- Tools that generate output → call `designContextStore.get()`
- Always use `structuredClone` when reading/writing context

## Testing

- Each tool has a corresponding test in `src/__tests__/`
- Mock external deps (Figma API, URL fetch)
- Test input validation, happy path, and error cases

## Commands

- Build: `npm run build`
- Test: `npm run test`
- Test single: `npx vitest run src/__tests__/<test-file>.ts`

## MCP tools for reference

- **Context7**: `@modelcontextprotocol/sdk` docs, Zod docs
- **Sequential Thinking**: Multi-step tool design decisions
