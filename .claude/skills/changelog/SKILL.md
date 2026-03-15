---
name: changelog
description: Update CHANGELOG.md for Siza following Keep a Changelog format — add Unreleased entries, bump versions, and prepare release sections
version: 1.0.0
tags: [changelog, release, docs, versioning]
---

# Changelog

Maintain `CHANGELOG.md` at the project root using [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.

## File Location & Format

```
CHANGELOG.md (repo root)
```

Format: `## [Unreleased]` → `## [0.42.0] — 2026-03-15`

Categories (use only what applies):
- **Added** — new features
- **Changed** — changes to existing behavior
- **Deprecated** — features being removed in a future release
- **Removed** — removed features
- **Fixed** — bug fixes
- **Security** — security improvements

## Writing Good Entries

Each entry should:
1. Describe **what** was added/changed, not just the file names
2. Be a single bullet, bolded key noun first: `- **Feature Name** — brief description`
3. Include impact signals where useful: test counts, endpoint names, performance numbers

### Examples

```markdown
### Added
- **API route test suite** — 94 unit tests across 17 route handlers covering auth, rate
  limits, quota enforcement, and error propagation; all in `__tests__/lib/api/`
- **coverage-boost skill** — workflow for finding and closing coverage gaps with mock
  pattern library and per-file-type targets
- **checkProjectQuota tests** — expanded `limits.ts` branch coverage from 27% → 90.9%

### Fixed
- **generation.service.test** — `postGenScore` assertion now handles environments where
  `@forgespace/core` is not available (test env skip rather than hard fail)

### Changed
- **Root package.json version** — synced from 0.37.0 to 0.41.0 to match git tags
```

## Workflow

### Adding Unreleased Entries

1. Find the `## [Unreleased]` section (always at top, below header)
2. Add new bullets under the appropriate category
3. Group related items together
4. Use past tense for descriptions

```bash
# Find the line to insert after
grep -n "## \[Unreleased\]" CHANGELOG.md
```

### Preparing a Release

When bumping the version (e.g., to v0.42.0):

1. Replace `## [Unreleased]` with `## [0.42.0] — YYYY-MM-DD`
2. Add a fresh `## [Unreleased]` section above it
3. Update `apps/web/package.json` version field
4. Update root `package.json` version field (keep in sync)

```bash
TODAY=$(date +%Y-%m-%d)
# Edit CHANGELOG.md: replace [Unreleased] with [0.42.0] — $TODAY
# Add new empty [Unreleased] above it
```

### Checking What Changed Since Last Release

```bash
# Find the last release tag
git tag --sort=-v:refname | head -3

# List commits since last tag
git log v0.41.0..HEAD --oneline

# Group by type (conventional commits)
git log v0.41.0..HEAD --oneline | grep "^[a-z0-9]* feat" | head -10
git log v0.41.0..HEAD --oneline | grep "^[a-z0-9]* fix" | head -10
git log v0.41.0..HEAD --oneline | grep "^[a-z0-9]* test\|chore" | head -10
```

## Siza-Specific Conventions

- **Commit prefix → Changelog category**:
  - `feat:` → Added
  - `fix:` → Fixed
  - `test:` → Added (test coverage entries)
  - `chore:` → Changed or Added (for skills/tooling)
  - `docs:` → Added (if user-facing) or skip if internal only
  - `refactor:` → Changed
  - `ci:` → Changed (CI/CD) or skip if minor
  - `security:` → Security

- **Skip** entries for: pure formatting, comment fixes, internal config tweaks

- **Group** related test PRs: "API route test suite — 94 tests across 17 routes" rather than listing each PR separately

- **Version bumps** are triggered by merging a PR that changes `apps/web/package.json` version → `release-automation.yml` auto-creates tag + GitHub release

## Current State (as of 2026-03-15)

Unreleased entries to add from recent PRs (#488-495):

```markdown
### Added
- **API route test suite expansion** — 94 new unit tests across 17 untested route
  handlers: gallery, search, usage/current, scorecards, suggestions,
  generations/history, feature toggle, metrics, teams, plugins, golden-paths,
  templates, generate/analyze, generate/validate, projects, components, generations
- **New Claude skills** — `verify` (quality gate runner), `test-recovery` (failing
  test diagnosis), `coverage-boost` (coverage gap workflow), `api-route-testing`
  (route mock patterns + coverage map), `changelog` (this skill)
- **Improved Claude skills** — `deploy-check` v2 (Vercel-primary, 12 checks),
  `supabase-migration` v2 (team/RBAC RLS templates, GIN indexes)

### Fixed
- **Failing unit test** — `generation.service.test.ts` postGenScore assertion now
  correctly handles environments without `@forgespace/core`

### Changed
- **Test coverage** — Overall coverage improved from 87.6% → 91.4% statements,
  79.6% → 82.9% branches; 1275+ tests on main (up from 1218)
- **Root package.json version** — Synced from 0.37.0 to 0.41.0 to match releases
```
