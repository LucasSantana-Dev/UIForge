---
description: Clear useless documentation
---

# Clear Documentation

Remove documentation that is:
- Outdated and no longer reflects the current implementation
- Duplicated across multiple files
- Describing code or features that no longer exist
- Placeholder or auto-generated boilerplate with no real content

## Retained documentation (do NOT remove)

Per plan.MD, these files must be kept:
- `plan.MD`, `README.md`, `SECURITY.md`
- `docs/SETUP_GUIDE.md`, `DEPLOYMENT.md`, `DATABASE_SCHEMA.md`, `DARK_MODE_GUIDE.md`, `TEST_COVERAGE.md`
- `apps/api/README.md`, `apps/api/SETUP_SECRETS.md`
- `apps/web/src/__tests__/README.md`, `apps/web/TEST_COVERAGE_REPORT.md`
- `scripts/README.md`, `scripts/security/`

## Steps

1. Identify files with stale or redundant content
2. Remove or consolidate without losing meaningful context
3. Update `README.md`, `plan.MD`, and `CHANGELOG.md` if affected sections are removed
4. Verify no broken links remain after removal
5. Commit: `docs: remove stale documentation`
