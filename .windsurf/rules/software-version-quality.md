# Software Version & Code Quality

**When to apply:** Managing versions, releases, code quality standards, and static analysis.

## Semantic Versioning (SemVer)

Follow [Semantic Versioning 2.0.0](https://semver.org/) strictly: `MAJOR.MINOR.PATCH`

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes, incompatible API changes
- **MINOR** (1.0.0 → 1.1.0): New features, backward-compatible functionality
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, backward-compatible fixes

### Version Constraints

```json
{
  "dependencies": {
    "exact": "1.2.3",           // Exact version (avoid in libraries)
    "patch": "~1.2.3",          // >=1.2.3 <1.3.0 (patch updates only)
    "minor": "^1.2.3",          // >=1.2.3 <2.0.0 (minor + patch updates)
    "range": ">=1.2.3 <2.0.0"   // Explicit range
  }
}
```

**Best practices:**
- Use `^` (caret) for most dependencies to allow minor updates
- Use `~` (tilde) for critical dependencies requiring stability
- Pin exact versions only for tools (ESLint, TypeScript) to ensure consistency
- Never use `*` or `latest` in production

### Pre-release Versions

- **Alpha** (`1.0.0-alpha.1`): Early development, unstable
- **Beta** (`1.0.0-beta.1`): Feature complete, testing phase
- **RC** (`1.0.0-rc.1`): Release candidate, final testing
- **Stable** (`1.0.0`): Production ready

## Version Management

### Package.json

```json
{
  "name": "uiforge-mcp",
  "version": "0.2.0",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

- Specify `engines` to enforce minimum Node.js/npm versions
- Update version in `package.json` before each release
- Keep `package-lock.json` committed for reproducible builds

### Changelog

Maintain `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com/):

```markdown
# Changelog

## [Unreleased]
### Added
- New feature X

## [1.1.0] - 2024-01-15
### Added
- Feature Y
### Fixed
- Bug Z
### Changed
- Improved performance

## [1.0.0] - 2024-01-01
- Initial release
```

## Code Quality Standards

### Linting (ESLint)

**Zero tolerance policy:** All code must pass linting before commit.

```bash
npm run lint          # Check for issues
npm run lint -- --fix # Auto-fix issues
```

**Configuration:**
- Use `eslint.config.js` (flat config) for ESLint 9+
- Enable TypeScript type-aware linting with `projectService: true`
- Enforce strict rules for production code (`src/lib/`, `src/tools/`)
- Relax rules for tests (`src/__tests__/`) and templates

**Key rules:**
- `@typescript-eslint/no-explicit-any`: warn (error in tools)
- `@typescript-eslint/no-floating-promises`: error
- `require-await`: error (no async without await)
- `prefer-const`: error
- `no-console`: off (allowed in MCP server context)

### Type Checking (TypeScript)

**Zero errors policy:** All code must type-check before commit.

```bash
npx tsc --noEmit  # Type check without emitting files
```

**Configuration (`tsconfig.json`):**
- `strict: true` - Enable all strict type checking
- `noImplicitAny: true` - Disallow implicit any
- `strictNullChecks: true` - Strict null checking
- `noUnusedLocals: true` - Error on unused variables
- `noUnusedParameters: true` - Error on unused parameters

**Best practices:**
- Add explicit return types for exported functions
- Avoid `any` - use `unknown` or proper types
- Use type imports: `import type { Type } from 'module'`
- Prefer interfaces for object shapes, types for unions/intersections

### Code Formatting (Prettier)

**Automatic formatting:** Use Prettier for consistent code style.

```bash
npx prettier --write .  # Format all files
```

**Configuration (`.prettierrc`):**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 120,
  "trailingComma": "es5"
}
```

### Static Analysis

**Required checks before commit:**

1. **Linting:** `npm run lint` (0 errors, 0 warnings)
2. **Type checking:** `npx tsc --noEmit` (0 errors)
3. **Tests:** `npm test` (100% pass rate, 85%+ coverage)
4. **Build:** `npm run build` (successful compilation)

### Code Metrics

**Maintain quality thresholds:**

- **Test coverage:** ≥85% statements, functions, lines; ≥70% branches
- **Cyclomatic complexity:** ≤10 per function (prefer ≤5)
- **File size:** ≤500 lines per file (split larger files)
- **Function length:** ≤50 lines per function
- **Max parameters:** ≤5 parameters per function

### Git Hooks (Husky)

**Pre-commit hooks** (`.husky/pre-commit`):

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run lint-staged for code quality (exit on failure)
npx lint-staged || exit 1

# Check for outdated dependencies (non-blocking warning)
npm run deps:check --silent || echo "⚠️  Some dependencies are outdated"

# Security audit (non-blocking warning)
npm audit --audit-level=high --silent || echo "⚠️  Security vulnerabilities detected"
```

**Lint-staged configuration:**

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

## Release Process

### 1. Version Bump

```bash
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
```

### 2. Update Changelog

Document all changes in `CHANGELOG.md` under the new version.

### 3. Quality Gates

Ensure all checks pass:
- ✅ Linting: `npm run lint`
- ✅ Type checking: `npx tsc --noEmit`
- ✅ Tests: `npm run test:coverage`
- ✅ Build: `npm run build`
- ✅ Security: `npm audit --audit-level=moderate`

### 4. Tag & Push

```bash
git add .
git commit -m "chore: release v1.0.0"
git tag v1.0.0
git push origin main --tags
```

### 5. Publish (if applicable)

```bash
npm publish  # For npm packages
```

## Continuous Integration

**Required CI checks:**

```yaml
# .github/workflows/ci.yml
jobs:
  quality:
    - Lint: npm run lint
    - Type check: npx tsc --noEmit
    - Test: npm run test:coverage
    - Build: npm run build
  
  dependency-check:
    - Outdated: npm run deps:check
    - Security: npm audit --audit-level=moderate
```

**CI must pass before merge** - enforce via branch protection rules.

## Documentation

- **README.md**: Project overview, setup, usage
- **ARCHITECTURE.md**: System design, patterns
- **CHANGELOG.md**: Version history
- **CONTRIBUTING.md**: Development guidelines
- **API docs**: JSDoc comments for public APIs

## Quality Metrics Dashboard

Track and monitor:
- Test coverage percentage
- Lint warnings/errors count
- TypeScript errors count
- Build success rate
- Dependency freshness
- Security vulnerabilities
- Code review turnaround time
