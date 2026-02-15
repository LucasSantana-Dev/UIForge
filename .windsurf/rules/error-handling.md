# Error Handling

**When to apply:** Adding/modifying error handling, exceptions, or failure flows in tools or lib modules.

## Principles

- Never throw strings. Throw `Error` (or typed subclasses) with descriptive messages.
- Include causal error as `cause` when wrapping lower-level errors.
- Separate tool-facing error messages from internal diagnostics.

## MCP Tool Errors

- Tools must return structured error responses, not throw unhandled exceptions.
- Use `McpError` from the SDK for protocol-level errors.
- Validate inputs early with Zod; return clear validation error messages.
- For Figma API failures: include HTTP status and Figma error message in the response.
- For image generation failures: catch satori/resvg errors and return descriptive messages.

## Domain Error Classes

Introduce incrementally as needed:
- `FigmaApiError`: Figma REST API failures (auth, rate limit, not found).
- `TemplateError`: Code generation / template rendering failures.
- `ImageRenderError`: satori/resvg rendering failures.
- `DesignExtractionError`: URL fetch or HTML parsing failures.
- `ValidationError`: Input validation beyond Zod (e.g., conflicting options).

## Logging

- Log errors with structure (message, code, stack, cause).
- Never log `FIGMA_ACCESS_TOKEN` or other secrets.
- Use `console.error` for server-side diagnostics (stdio transport sends tool responses separately).

## Pragmatism

- Prefer the simplest consistent approach. Don't over-abstract for a 7-tool server.
- Document decisions briefly when introducing new error categories.
