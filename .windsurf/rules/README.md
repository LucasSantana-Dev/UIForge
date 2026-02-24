# Siza WebApp Rules - Forge Space Integration

> **Project-specific rules and adaptations for Siza WebApp**
>
> **Source of Truth**: [forge-patterns/docs/shared-rules/](../../forge-patterns/docs/shared-rules/)
>
> **Last Updated**: 2026-02-20
> **Version**: 1.0.0

---

## 🎯 Overview

This directory contains Siza WebApp-specific rules and adaptations. The **canonical source of truth** for all shared rules is the [forge-patterns repository](../../forge-patterns/docs/shared-rules/).

## 📁 Local Rules Structure

```
.windsurf/rules/
├── README.md                    # This file - overview and references
├── project-specific.md          # Siza WebApp specific adaptations
└── references/                  # References to shared documentation
    ├── agent-rules.md           # Link to shared agent rules
    ├── testing.md               # Link to shared testing standards
    └── quality-gates.md         # Link to shared quality standards
```

## 🔗 Shared Documentation References

### Core Rules (Source of Truth)
- **[Agent Rules](../../forge-patterns/docs/shared-rules/agent-rules.md)** - Core conduct principles
- **[Testing Standards](../../forge-patterns/docs/shared-rules/quality-standards/testing.md)** - Testing strategies
- **[Quality Standards](../../forge-patterns/docs/shared-rules/quality-standards/README.md)** - Quality gates
- **[Development Workflows](../../forge-patterns/docs/shared-rules/development-workflows/README.md)** - Process standards

### Siza WebApp Specific
- **[Project-Specific Rules](project-specific.md)** - Next.js/React specific adaptations
- **[Security Practices](project-specific.md#security)** - Web application security
- **[Testing Configuration](project-specific.md#testing)** - Jest/Playwright configuration

## 🚀 Quick Reference for Siza WebApp

### Development Commands
```bash
# Setup development environment
npm install
cp .env.example .env.local

# Run development server
npm run dev

# Run tests with coverage
npm test
npm run test:e2e

# Quality checks
npm run lint          # ESLint
npm run type-check    # TypeScript
npm run format:check  # Prettier
npm run build         # Production build

# Database (Supabase)
npx supabase start
npx supabase db reset
```

### Quality Gates
- ✅ **Lint**: `npm run lint` - 0 errors, 0 warnings
- ✅ **Type Check**: `npm run type-check` - 0 errors
- ✅ **Format**: `npm run format:check` - Proper formatting
- ✅ **Tests**: `npm test` - 100% pass, ≥80% coverage
- ✅ **E2E**: `npm run test:e2e` - Critical user flows covered
- ✅ **Build**: `npm run build` - Successful compilation

### Project-Specific Adaptations

#### Next.js/React Specific
- Use **Jest** for testing (not Vitest/pytest)
- Use **ESLint** + **Prettier** for code style (not ruff)
- Use **Playwright** for E2E testing (not pytest)
- Follow **Next.js App Router** patterns

#### Supabase Integration
- Test database operations with Supabase test client
- Mock external API calls in unit tests
- Test authentication flows end-to-end
- Validate RLS policies in integration tests

#### AI Integration Specific
- Test AI provider integrations (OpenAI, Anthropic, Ollama)
- Mock AI responses for consistent testing
- Test component generation workflows
- Validate error handling for AI failures

## 📋 When to Use Local vs Shared Rules

### Use Shared Rules For:
- **Core agent conduct** - Always follow shared agent rules
- **General testing principles** - Use shared testing strategies
- **Quality standards** - Follow shared quality gates
- **Development workflows** - Use shared development processes

### Use Local Rules For:
- **Next.js-specific adaptations** - Framework-specific implementations
- **React patterns** - Component testing and development
- **Supabase integration** - Database and authentication patterns
- **AI integration** - Provider-specific testing and error handling

## 🔧 Integration with Shared Documentation

### Referencing Shared Rules
When referencing rules in discussions, PRs, or documentation:
```markdown
See: [Agent Rules](../../forge-patterns/docs/shared-rules/agent-rules.md)
See: [Testing Standards](../../forge-patterns/docs/shared-rules/quality-standards/testing.md)
```

### Updating Shared Rules
If you identify a need to update shared rules:
1. **Check forge-patterns repository** - Open issue there
2. **Propose changes** - Discuss with ecosystem maintainers
3. **Update shared rules** - Make changes in forge-patterns
4. **Update references** - Ensure local rules reference updated shared rules

### Project-Specific Adaptations
If shared rules don't fully cover Siza WebApp needs:
1. **Document in project-specific.md** - Explain the adaptation
2. **Reference shared rules** - Show how they're adapted
3. **Justify the need** - Explain why adaptation is necessary
4. **Keep minimal** - Only adapt what's truly project-specific

## 🎯 Success Criteria

- **Consistency**: Follow shared rules where applicable
- **Clarity**: Project-specific adaptations are well-documented
- **Integration**: Seamless reference to shared documentation
- **Maintenance**: Easy to keep local and shared rules in sync

## 🔗 Related Documentation

### Shared Documentation
- **[Shared Rules Overview](../../forge-patterns/docs/shared-rules/README.md)** - Complete rules index
- **[Quality Standards](../../forge-patterns/docs/shared-rules/quality-standards/README.md)** - Quality requirements
- **[Development Workflows](../../forge-patterns/docs/shared-rules/development-workflows/README.md)** - Process standards

### Siza WebApp Documentation
- **[Siza WebApp README](../README.md)** - Project overview
- **[Siza WebApp API](docs/API.md)** - API documentation
- **[Siza WebApp Architecture](docs/ARCHITECTURE.md)** - System design

### Supabase Documentation
- **[Supabase Docs](https://supabase.com/docs)** - Database and authentication
- **[Database Schema](docs/DATABASE_SCHEMA.md)** - Local schema documentation

---

*This local rules directory references the canonical shared documentation in the forge-patterns repository. All shared rules are maintained there as the single source of truth.*