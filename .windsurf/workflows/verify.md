---
description: Run full verification before PR or task completion
---

# Verify (Full Check)

Run before considering a task complete or before PR:

// turbo
1. **Build**: `npm run build`
// turbo
2. **Tests**: `npm run test`

Report failures with a brief CI-like summary. Both must pass before marking a task as done.
