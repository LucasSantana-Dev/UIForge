# Pragmatic Patterns

**When to apply:** Designing module boundaries, refactoring architecture, or assessing abstractions.

## Goals

- Build maintainable, testable, and evolvable MCP tools.
- Favor clarity and simplicity over ceremony.
- Apply SOLID responsibly — this is a focused server, not a framework.

## Module organization

- One tool per file in `src/tools/`.
- One lib module per concern in `src/lib/` (e.g., `figma-client.ts`, `image-renderer.ts`).
- Templates grouped under `src/lib/templates/`.
- Shared types in `src/lib/types.ts`.
- Keep files ≤300 LOC. Extract helpers when complexity grows.

## Responsibilities & boundaries

- **Tools** (`src/tools/`): input validation, orchestration, response formatting.
- **Lib** (`src/lib/`): pure business logic, API clients, rendering engines.
- **Templates** (`src/lib/templates/`): pure functions returning file arrays.
- **Resources** (`src/resources/`): read-only access to server state.

## Dependency flow

```
tools/ → lib/ → types.ts
tools/ → lib/templates/
resources/ → lib/design-context.ts
```

- Tools depend on lib modules. Lib modules don't depend on tools.
- Templates are pure functions with no side effects.
- `DesignContextStore` is the only singleton; keep it clearly documented.

## Clean code

- Use clear, expressive names; functions are verbs, values are nouns.
- Minimize comments; explain "why" when non-obvious.
- Remove dead code and unused imports.
- Prefer composition over inheritance.
- Prefer named exports for clear usage.

## Pragmatism

- Avoid premature abstraction (YAGNI).
- Prefer simple, direct solutions before introducing factories or complex patterns.
- This is a 7-tool MCP server — keep it lean.
