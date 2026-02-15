# Documentation-First Rule

**When to apply:** Non-trivial code changes, new tools, complex logic, or external API integrations.

## Required references

Before assuming behavior of an API, include the doc link and a ≤25-word quote when the change relies on it.

Key documentation sources for this project:
- **MCP SDK**: `@modelcontextprotocol/sdk` TypeScript SDK docs
- **Figma REST API**: Variables API, file nodes, design tokens
- **Satori**: JSX → SVG rendering API and limitations
- **Resvg**: SVG → PNG rasterization options
- **Zod**: Schema validation API
- **Vitest**: Testing API and configuration

## In-project documentation

- `README.md`: project overview, setup, usage, tool descriptions.
- `CHANGELOG.md`: all behavior changes, new tools, breaking changes.
- `plan.MD`: architecture decisions and implementation roadmap (reference, not living doc).
- Tool descriptions in MCP registration must be clear and complete for AI agent consumption.
