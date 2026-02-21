---
description: Update the documentations
---

# Update Documentation

Run this after any functional change, new feature, or API modification.

1. **CHANGELOG.md** (root): Add entry using Keep a Changelog format:
   ```markdown
   ## [X.Y.Z] - YYYY-MM-DD
   ### Added / Changed / Fixed / Security
   - Description
   ```

2. **README.md** (root): Update if setup, commands, or architecture changed

3. **plan.MD**: Run the `/update-plan` workflow

4. **docs/** — update the relevant file if affected:
   - `SETUP_GUIDE.md` — local dev setup changes
   - `DEPLOYMENT.md` — Cloudflare deployment changes
   - `DATABASE_SCHEMA.md` — schema or RLS changes
   - `DARK_MODE_GUIDE.md` — design system / color changes
   - `TEST_COVERAGE.md` — testing strategy changes

5. **API docs**: Update `apps/api/README.md` if endpoints changed

6. Commit documentation alongside code:
   ```
   docs(<scope>): update README and CHANGELOG for <feature>
   ```
