---
description: Safety policy for executing shell commands in this repo
---

# Shell Command Safety Policy

## Blocked patterns (do not run)

- `rm -rf /` or `rm -rf /*`
- Fork bombs (e.g., `:(){ :|:& };:`)
- `mkfs*` commands
- `dd ... of=/dev/...`
- Drive formatting commands

## Safe commands (auto-runnable)

- `npm run build`
- `npm run test`
- `npm run dev`
- `npx vitest run <specific-test>`
- `docker build -t uiforge-mcp .`

## Requires approval

- `npm install` / `npm ci` (modifies node_modules)
- `docker run` (starts container)
- Any command that writes outside the project directory
