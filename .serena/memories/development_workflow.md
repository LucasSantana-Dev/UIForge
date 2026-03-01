# Siza Development Workflow

## Branching Strategy
**Trunk-based development** on `main` branch:
1. Create feature branch from `main`
2. Develop feature with atomic commits
3. Open PR to `main` (not release branch)
4. Code review and approval
5. Merge to `main` triggers deployment
6. Delete feature branch after merge

## Commit Convention
Use conventional commits format:
- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code restructuring without behavior change
- `chore:` - Maintenance tasks (deps, config)
- `docs:` - Documentation updates
- `test:` - Test additions or modifications

## Pre-PR Checklist
Run before opening pull requests:
```bash
npm run lint      # ESLint + Prettier
npm run build     # Production build
npm run test      # Jest unit tests
```

## Branch Protection
- `main` branch is protected
- Requires PR approval
- CI checks must pass
- No direct pushes to `main` (except docs)

## Multi-Session Isolation (Critical)
When multiple Claude sessions share the repo, branches switch between tool calls. Reliable approaches:
1. **Git worktree** at `/tmp/siza-<task>` for full isolation (clean up after)
2. **Atomic python3 scripts** that write files + `git add` + `git commit` in a single Bash call
3. Always verify branch with `git worktree list` (shows actual state, not just `git branch`)
4. python3 file writes bypass PostToolUse Prettier hooks — run `npx prettier --write` manually before committing

## Local Development
- Start dev server: `npm run dev`
- Runs on http://localhost:3000
- Hot module replacement enabled

## Code Quality Standards
- Functions <50 lines
- Cyclomatic complexity <10
- Line width <100 characters
- TypeScript strict mode enabled
- No comments unless necessary

## Documentation Updates
Always update with changes:
- `CHANGELOG.md` - User-facing changes
- `README.md` - Setup/usage instructions
- Inline JSDoc for public APIs (minimal)
