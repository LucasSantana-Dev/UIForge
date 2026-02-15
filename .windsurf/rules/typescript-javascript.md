# TypeScript & JavaScript Rules

**When to apply:** Any TS/JS code edit, refactor, or lint/format related change.

**File patterns:** `**/*.{ts,tsx,js,jsx}`

## Compiler options

Project uses `tsconfig.json` with:
- `target`: ES2022
- `module`: NodeNext
- `moduleResolution`: NodeNext
- `strict`: true
- `jsx`: react-jsx (required for satori JSX templates)

## Typing rules

- `noAny`: avoid `any`. If unavoidable, use `unknown + type guards` and justify in code comment.
- Prefer `interface` for public shapes, `type` for unions & utility types.
- Use TypeScript utility types (`Partial`, `Pick`, `Omit`, `Readonly`, `Record`).
- **Naming:**
  - Interfaces: `I{Name}` (e.g., `IDesignContext`, `IGeneratedFile`)
  - Types/Aliases: `T{Name}`
  - Components: `PascalCase`
  - Variables & functions: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Tool handler functions: `camelCase` matching tool name (e.g., `scaffoldFullApplication`)

## Imports & ordering

- ESM only (`import`/`export`). No CommonJS (`require`).
- Include `.js` extension in relative imports (NodeNext resolution).
- Group: external deps → internal `lib/` → local siblings.

## Runtime checks

- Validate all tool inputs with Zod schemas before processing.
- For external data (Figma API, URL fetch), always validate/sanitize and use type guards.

## Zod conventions

- Define tool input schemas alongside the tool handler in `src/tools/`.
- Use `z.object()` with descriptive `.describe()` on each field for MCP tool registration.
- Prefer `z.enum()` for fixed sets (frameworks, output formats).
