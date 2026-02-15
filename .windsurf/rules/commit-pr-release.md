# Commit, PR & Release Rules

**When to apply:** Authoring commits, PR templates, or release process changes.

## Commit message format

Angular commit convention (strict):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Allowed types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`, `revert`.

**Scopes:** `scaffold`, `component`, `prototype`, `image`, `figma`, `context`, `lib`, `docker`, `ci`.

**Subject rules:** imperative, lower-case start, max 50 chars, no trailing period.

**Body rules:** explain what and why, not how. Lines ≤ 72 chars.

**Footer:** reference issues, breaking changes, release notes.

## No AI attribution (mandatory)

- Do not add "Co-authored-by: Cursor", "Co-authored-by: Windsurf", or any AI/assistant attribution in commit messages, PR descriptions, or diffs.

## Pre-commit hooks & validation

- Enforce conventional commit message format.
- Run lint and type-check before allowing commit.

## PR rules

- Branch name: `<type>/<scope>-short-desc`.
- PR title: same format as single commit subject.
- PR Checklist:
  - [ ] Tests added/updated
  - [ ] Build passes (`npm run build`)
  - [ ] Tests pass (`npm run test`)
  - [ ] CHANGELOG.md updated
  - [ ] README.md updated if behavior changed

## Merge rules

- Squash for small, single-purpose PRs; Rebase when preserving commits matters.
- No direct pushes to `main`.

## Release

- Tag releases with semantic versions.
- Update CHANGELOG.md from commit messages.
