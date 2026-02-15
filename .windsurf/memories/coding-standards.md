# UIForge MCP Coding Standards

## Code Style

- **TypeScript**: Strict mode, no `any` types, ESM only
- **JSX**: react-jsx (for satori templates only — not a React app)
- **Comments**: Only when logic is non-obvious; prefer self-documenting code
- **File size**: Keep files ≤300 LOC; extract helpers when complexity grows

## Naming Conventions

- **Interfaces**: `I{Name}` (e.g., `IDesignContext`, `IGeneratedFile`)
- **Types/Aliases**: `T{Name}` (e.g., `TToolNameInput`)
- **Constants**: `UPPER_SNAKE_CASE`
- **Functions/variables**: `camelCase`
- **Files**: `kebab-case.ts`
- **Tool names**: `snake_case` (MCP convention)

## Architecture Principles

- **One tool per file** in `src/tools/`
- **One lib module per concern** in `src/lib/`
- **Pure template functions**: `(config) => IGeneratedFile[]`
- **No over-engineering**: this is a focused 7-tool server, keep it lean
- **Composition over inheritance**
- **Validate at boundaries**: Zod for tool inputs, type guards for external data

## Error Handling

- Typed errors: domain-specific classes introduced incrementally
- Tools return structured error responses, not unhandled throws
- Never log secrets (`FIGMA_ACCESS_TOKEN`)

## Testing

- Vitest for all tests
- Test files in `src/__tests__/` with `*.unit.test.ts` naming
- Mock external deps (Figma API, URL fetch)
- Test behavior, not implementation
- Minimum 85% coverage target

## Documentation

- CHANGELOG.md: update for all behavior changes
- README.md: keep in sync with tools and setup
- Tool descriptions: clear and complete for AI agent consumption
