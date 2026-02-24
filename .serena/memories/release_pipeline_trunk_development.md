# Siza Release Pipeline & Trunk Development

## Versioning Strategy
**Semantic Versioning** (semver):
- `MAJOR.MINOR.PATCH` format
- `MAJOR` - Breaking changes
- `MINOR` - New features (backward compatible)
- `PATCH` - Bug fixes

## Release Process
1. **Feature Development**
   - Branch from `dev`: `git checkout -b feat/feature-name`
   - Implement feature with atomic commits
   - Update `CHANGELOG.md` with changes

2. **Pre-Release Checks**
   - Run `npm run lint`
   - Run `npm run build`
   - Run `npm run test`
   - Update version in `package.json`

3. **Pull Request**
   - Open PR to `dev` first
   - CI runs automated checks (lint, test, build)
   - After merge to `dev`, open PR from `dev` → `main`

4. **Merge & Deploy**
   - Merge PR to `main`
   - GitHub Actions triggers CI/CD
   - Auto-deploy to Cloudflare Workers via OpenNext (unified web + API)

5. **Post-Deployment**
   - Tag release: `git tag v1.2.3`
   - Push tags: `git push --tags`
   - Delete feature branch

## GitHub Actions CI/CD (after PR #43 cleanup, 2026-02-24)
Active workflows (Node 22 across all):
- `ci.yml` — lint, type-check, test, build on push/PR to dev/main
- `deploy-web.yml` — automated Cloudflare Workers deploy via OpenNext on push to dev/main
- `deploy-web-admin.yml` — manual admin deploy (workflow_dispatch), Workers via OpenNext, production requires main branch
- `feature-branch.yml` — CI for feature branches
- `release-branch.yml` — quality checks + staging for release/* branches
- `release-automation.yml` — auto-detect release merges to main, trigger deploy + changelog
- `supabase-setup-admin.yml` — manual Supabase admin actions (setup, link, migrate, generate-types)
- `secret-scan.yml` — secret scanning
- **Deleted**: `dev-deploy.yml`, `production.yml`, `deploy-admin.yml` (broken scaffolds)

## Branch Protection Rules
- `main` branch requires:
  - PR approval (1+ reviewers)
  - Passing CI checks
  - Up-to-date with base branch
- No force pushes
- No deletions

## Release PR Example
- **PR #47**: v0.3.0 release (dev → main, 28 commits, 8 feature phases)
  - Includes: Cloudflare deployment, CI cleanup, middleware fixes, WASM stubs, edge runtime fix
  - shfmt added to Shell Lint CI job for shell script formatting

## CHANGELOG Format
```markdown
## [1.2.3] - 2026-02-23
### Added
- Feature description
### Fixed
- Bug fix description
### Changed
- Breaking change description
```
