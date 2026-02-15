# Security & Secrets

**When to apply:** Handling credentials, API tokens, input validation, or configuring security-related tooling.

## Secrets

- Never hardcode secrets. Load from environment variables.
- `FIGMA_ACCESS_TOKEN`: runtime-only env var for Figma API tools. Must not appear in code, logs, or error messages.
- Document all required env vars in `.env.example`.

## Input validation

- Validate all MCP tool inputs with Zod schemas before processing.
- Sanitize URLs in `fetch_design_inspiration` to prevent SSRF (restrict to HTTP/HTTPS, no private IPs).
- Validate Figma file keys and node IDs format before API calls.

## Output safety

- Generated code templates must not include hardcoded secrets or credentials.
- HTML prototypes must sanitize any user-provided text to prevent XSS.
- SVG/PNG output from satori is safe by construction (no script execution).

## Docker

- Use multi-stage builds (already in Dockerfile) to minimize attack surface.
- Run as non-root user in production containers.
- Don't copy `.env` files into Docker images.

## CI

- Add secrets scanning to block PRs that leak credentials.
