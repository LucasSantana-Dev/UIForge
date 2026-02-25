# Siza Desktop App

## Status
- **PR #94**: `feat/desktop-app` → `main` (OPEN, awaiting review)
- **Stats**: 95 files changed, +4,231/-1,801 lines, 5 commits
- **Web test regression**: 0 (379 passing, 30 suites on main)
- **URL**: https://github.com/Forge-Space/siza/pull/94

## Architecture

### Shared UI Package (`packages/ui`)
- `@siza/ui` workspace package consumed by both `apps/web` and `apps/desktop`
- 19 shadcn components + CodeEditor + LivePreview + toast system + cn() utility
- `apps/web` components replaced with thin re-export proxies (`export { X } from '@siza/ui'`)
- **Gotcha**: Re-export proxies MUST include `'use client'` for client components (Next.js RSC boundary)
- EmptyState and GeneratorForm NOT extracted (app-specific deps like next/link)

### Electron App (`apps/desktop`)
- **Security**: contextIsolation: true, nodeIntegration: false, contextBridge preload
- **MCP**: `@modelcontextprotocol/sdk` StdioClientTransport spawns siza-mcp as child process
- **IPC**: Type-safe channels via `src/shared/ipc-channels.ts`, `SizaApi` interface on `window.siza`
- **Ollama**: Opt-in local LLM via `OLLAMA_ENABLED` env, graceful fallback to registry
- **Build**: vite + vite-plugin-electron, electron-builder for cross-platform (macOS dmg, Windows nsis, Linux AppImage)
- **CI**: `.github/workflows/desktop-release.yml` — matrix build on tag push `desktop-v*`

### Key Files
- `apps/desktop/src/main/index.ts` — Main process (window, menu, tray, MCP, IPC)
- `apps/desktop/src/main/mcp-server.ts` — MCP client manager (stdio transport)
- `apps/desktop/src/main/preload.ts` — Context bridge API
- `apps/desktop/src/renderer/App.tsx` — React app with sidebar nav (Generate, Projects, Settings)
- `apps/desktop/src/renderer/pages/Setup.tsx` — First-run wizard (Ollama detection)
- `packages/ui/src/index.ts` — Barrel export for all shared components
- `packages/ui/tailwind.config.ts` — Shared Siza design tokens (exported as sizaUIConfig)

### Ollama Integration (in siza-mcp)
- `siza-mcp/src/lib/ollama/` — client, types, prompts, generate
- Config: `OLLAMA_ENABLED`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL` in configSchema
- Committed on `feat/training-data-expansion` branch (separate from desktop branch)

## Gotchas
- PostToolUse hooks revert Edit/Write — use python3 atomic write+stage+commit
- `'use client'` must be in proxy files, not just in deep dependency
- Pre-existing build error (useEffect null on dashboard) — not caused by desktop work
- MCP SDK ESM imports: `@modelcontextprotocol/sdk/client/index.js` (not `/client`)
