---
description: Work with Docker and mcp-gateway integration. Use when editing Dockerfile, Docker Compose config, or gateway registration.
---

# Docker & Deployment

## When to use

- Editing `Dockerfile` or Docker build process
- Configuring mcp-gateway integration
- Debugging container startup or stdio transport issues

## Dockerfile

- Multi-stage build: `node:22.22.0-trixie-slim` builder → production
- Builder: `npm ci` → `npm run build`
- Production: `npm ci --omit=dev` → copy `dist/`
- Entry: `CMD ["node", "dist/index.js"]`
- No `.env` files copied into image

## mcp-gateway integration (separate repo)

- `docker-compose.yml`: add `uiforge` service on port `8026`
- `scripts/gateways.txt`: add `uiforge|http://uiforge:8026/sse|SSE`
- `scripts/virtual-servers.txt`: add `cursor-design|uiforge`
- `.env.example`: add `UIFORGE_PORT=8026` and `FIGMA_ACCESS_TOKEN=`
- Gateway wraps stdio via `mcpgateway.translate` → SSE

## Conventions

- Keep Docker image minimal (slim base, no dev deps in production)
- Run as non-root user in production
- Test locally with `docker build -t uiforge-mcp . && docker run --rm uiforge-mcp`
- Stdio transport: server reads from stdin, writes to stdout. No HTTP server needed.

## Commands

- Build image: `docker build -t uiforge-mcp .`
- Run locally: `docker run --rm -e FIGMA_ACCESS_TOKEN=xxx uiforge-mcp`
- Build check: `npm run build` (before Docker build to catch TS errors early)
