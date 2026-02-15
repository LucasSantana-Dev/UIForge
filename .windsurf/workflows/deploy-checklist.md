---
description: Pre-deployment checklist for Docker and mcp-gateway integration
---

# Deploy Checklist

1. Run verify workflow (build + test)
2. Ensure no hardcoded secrets; env vars documented in `.env.example`
3. CHANGELOG.md updated with version and changes
4. README.md updated if behavior or setup changed
5. Docker build succeeds: `docker build -t uiforge-mcp .`
6. Docker run smoke test: `docker run --rm uiforge-mcp` (should start without errors)
7. If integrating with mcp-gateway:
   - `docker-compose.yml`: `uiforge` service on port `8026`
   - `scripts/gateways.txt`: `uiforge|http://uiforge:8026/sse|SSE`
   - `scripts/virtual-servers.txt`: updated
   - `.env.example`: `UIFORGE_PORT=8026`, `FIGMA_ACCESS_TOKEN=`
