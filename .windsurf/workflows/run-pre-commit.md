---
description: Run Pre Commit Hooks
---

# Run Pre-Commit Hooks

Run all pre-commit quality checks before committing.

// turbo
1. **Lint**: `npm run lint`

// turbo
2. **Type check**: `npm run type-check`

// turbo
3. **Format check**: `npm run format`

// turbo
4. **Tests**: `npm run test`

5. Report results:
   - ✅ All checks pass → safe to commit
   - ❌ Any failure → fix before committing

6. Commit with Angular convention:
   ```
   <type>(<scope>): <subject>
   ```
   Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`
   Valid scopes: `auth`, `dashboard`, `generator`, `templates`, `api`, `db`, `ui`, `deps`, `ci`

   **No AI attribution** — never add Co-authored-by AI lines.
