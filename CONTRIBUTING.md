# Contributing to Siza

Thank you for contributing to Siza. This guide covers everything you need to know to submit high-quality contributions.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Review Process](#review-process)

---

## Code of Conduct

All contributors are expected to be respectful, constructive, and professional. Harassment or exclusionary behavior will not be tolerated.

---

## Getting Started

### 1. Fork and clone

```bash
git clone https://github.com/Forge-Space/siza.git
cd siza
npm install
```

### 2. Create a feature branch

```bash
git checkout -b feat/my-feature
```

### 3. Validate your environment

```bash
npm run lint
npm test
npm run build
```

---

## Development Workflow

### Repository structure

Siza is a Turborepo monorepo with two main applications:

```
apps/
├── web/          # Next.js 16 web application
└── api/          # Cloudflare Workers API
```

### Commands

```bash
npm install       # Install all dependencies
npm run dev       # Start development servers
npm run lint      # Run ESLint across all packages
npm test          # Run all test suites
npm run build     # Build all packages
```

### Branch flow

```
feature → dev → release → main
```

1. Create feature branch from `dev`
2. Open PR to `dev` for review
3. After merge, release branches are created from `dev`
4. Release branches merge to `main` for deployment

### Commit message format

Follow Angular conventional commits:

```
feat(web): add project creation form
fix(api): resolve authentication token expiry
docs(readme): update deployment instructions
refactor(web): simplify component hierarchy
test(api): add integration tests for billing
chore(deps): upgrade Next.js to 16.1.0
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `perf`, `chore`

---

## Code Standards

### TypeScript

- Strict mode enabled
- No `any` types without justification
- All functions must have explicit return types
- Use type imports: `import type { ... }`

### Code quality

- Functions: maximum 50 lines
- Cyclomatic complexity: maximum 10
- Line width: maximum 100 characters
- No comments unless explicitly requested or documenting complex algorithms

### Next.js conventions

- Use App Router (not Pages Router)
- Server Components by default
- Client Components only when necessary (`'use client'`)
- API routes must NOT export `runtime = 'edge'` (OpenNext handles routing)

### Component libraries

- Use shadcn/ui components where applicable
- Follow Atomic Design principles
- Maintain design system consistency

### Security

- Never commit secrets or credentials
- Use environment variables for configuration
- Validate all user inputs
- Sanitize all outputs

---

## Testing Requirements

### Coverage targets

- Overall coverage: minimum 80%
- Critical business logic: 100%
- Edge cases and error conditions required

### What to test

- Business logic and user-facing features
- Integration flows
- Error handling and edge cases
- API endpoint contracts

### What NOT to test

- Trivial getters/setters
- Simple enum definitions
- Third-party library behavior

### Running tests

```bash
npm test                    # Run all tests
npm test -- --coverage      # Generate coverage report
npm test -- --watch         # Watch mode
```

---

## Pull Request Process

### Before opening a PR

Ensure all of the following pass:

```
- [ ] npm run lint passes with no errors
- [ ] npm test passes with all tests green
- [ ] npm run build succeeds for all packages
- [ ] No secrets or credentials committed
- [ ] CHANGELOG.md updated under [Unreleased]
- [ ] README.md updated if public API changed
- [ ] Commit messages follow conventional commit format
```

### PR checklist

1. Push your branch: `git push origin feat/my-feature`
2. Open PR targeting `dev` branch
3. Fill in the PR template completely
4. Link related issues using `Closes #123` syntax
5. Request review from maintainers
6. Address all review feedback

### PR title format

```
feat(web): add user dashboard
fix(api): resolve billing calculation bug
docs: update deployment guide
```

---

## Review Process

1. **Automated CI** runs lint, type-check, build, tests, and security scans
2. **Maintainer review** checks code quality, architecture, and standards compliance
3. **Approval** requires CI passing + at least 1 maintainer approval
4. **Merge** is done by a maintainer using squash merge to `dev`

Typical review turnaround: 2-5 business days.

---

## Questions?

Open a [GitHub Discussion](https://github.com/Forge-Space/siza/discussions) or file an [issue](https://github.com/Forge-Space/siza/issues).
