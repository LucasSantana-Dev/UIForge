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

## GitHub Actions CI/CD
- **Trigger**: Push to `main`, PR opened/updated
- **Jobs**: lint, test, build
- **Auto-deploy**: Wrangler GitHub Action (`cloudflare/wrangler-action@v3`)

## Branch Protection Rules
- `main` branch requires:
  - PR approval (1+ reviewers)
  - Passing CI checks
  - Up-to-date with base branch
- No force pushes
- No deletions

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
