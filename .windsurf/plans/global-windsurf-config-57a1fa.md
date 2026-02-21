# Global Windsurf Rules, Skills, Workflows & Memories

Create a canonical set of global `.windsurf` files that consolidate the best content from all four repos (uiforge-webapp, mcp-gateway, uiforge-mcp, forge-patterns) and sync them back to each repo.

---

## Context

All four repos share overlapping rules, skills, and workflows with slight divergences. The goal is to:
1. Identify the **best version** of each shared file across repos
2. Create a **global** set at `/Users/lucassantana/.windsurf/` (Windsurf's global config location)
3. Sync the canonical versions back to each repo's `.windsurf/` directory

---

## Inventory: What Exists

### Rules (shared across all 4 repos)
| File | Best Source | Notes |
|------|-------------|-------|
| `agent-rules.md` | mcp-gateway | Has YAML frontmatter + extra rules (scripts, security checks, PR templates) |
| `snyk_rules.md` | identical | Same in all repos |
| `security-secrets.md` | mcp-gateway | More comprehensive (HTTPS, CORS, injection) |
| `commit-pr-release.md` | mcp-gateway | More complete (no AI attribution, merge rules) |
| `testing-quality.md` | uiforge-webapp | More detailed (Jest config, file mapping, commands) |
| `documentation-first.md` | mcp-gateway | Cleaner trigger/description format |
| `error-handling.md` | mcp-gateway | More comprehensive (React UI, API, logging) |
| `patterns.md` / `pattern.md` | mcp-gateway | More complete (SOLID, folder structures) |
| `typescript-javascript.md` / `ts-js-rules.md` | uiforge-webapp | More detailed (Zod, ESM, naming) |
| `software-version-quality.md` / `version-management.md` | forge-patterns | Most complete (both combined) |
| `dependencies-security.md` / `dependencies-vulnerabilities.md` | forge-patterns | Most comprehensive |
| `mcp-gateway-ci.md` | mcp-gateway | Specific to gateway repo only |
| `mcp-server-patterns.md` | uiforge-mcp | Specific to MCP tool repos |

### Rules (repo-specific, keep local only)
- `nextjs-app-router.md` — uiforge-webapp only
- `react-patterns.md` — uiforge-webapp only
- `supabase-auth.md` — uiforge-webapp only
- `uiforge-project.md` — uiforge-webapp + uiforge-mcp
- `plan-md-maintenance.md` — uiforge-webapp only
- `mcp-gateway-ci.md` — mcp-gateway + forge-patterns
- `ci-cd.md` — mcp-gateway + forge-patterns
- `frontend.md` — mcp-gateway + forge-patterns
- `performance-observability.md` — mcp-gateway + forge-patterns
- `accessibility-openness.md` — mcp-gateway + forge-patterns
- `dependency-injection.md` — mcp-gateway + forge-patterns
- `enforcement-automation.md` — mcp-gateway + forge-patterns
- `pipeline-cursor-config.md` — mcp-gateway + forge-patterns
- `plan-context.md` — mcp-gateway + forge-patterns
- `project-context-updates.md` — mcp-gateway + forge-patterns
- `db-migrations.md` — mcp-gateway + forge-patterns
- `changelog-versioning.md` — mcp-gateway + forge-patterns
- `templates-examples.md` — mcp-gateway + forge-patterns
- `scripts-terminal.md` — mcp-gateway + forge-patterns

### Skills (shared)
| File | Best Source |
|------|-------------|
| `mcp-tool-development.md` | uiforge-webapp |
| `mcp-docs-search.md` | uiforge-webapp |
| `docker-deployment.md` | uiforge-webapp |
| `code-generation-templates.md` | uiforge-webapp |
| `design-output.md` | uiforge-webapp |

### Workflows (shared)
| File | Best Source |
|------|-------------|
| `continue.md` | identical |
| `safety-shell-commands.md` | uiforge-webapp (more explicit safe/blocked lists) |
| `clear-documentation.md` | any (identical) |
| `verify.md` | uiforge-webapp (has turbo annotations) |
| `implement-tool.md` | uiforge-webapp |
| `deploy-checklist.md` | uiforge-webapp |
| `add-framework-template.md` | uiforge-webapp |

### Workflows (mcp-gateway specific, also in forge-patterns)
- `skill-backend-express.md`, `skill-e2e-playwright.md`, `skill-frontend-react-vite.md`, `skill-mcp-docs-search.md`
- `connect-ide-to-mcp-gateway.md`, `start-and-register-gateway.md`, `change-gateways-prompts-resources.md`
- `mcp-docs-and-tools.md`, `quality-checks.md`, `use-plan-context.md`

---

## Plan

### Step 1 — Create global directory structure
Create `/Users/lucassantana/.windsurf/rules/`, `skills/`, `workflows/`, `memories/`

### Step 2 — Write global rules (11 canonical shared rules)
1. `agent-rules.md` — merged best of mcp-gateway + uiforge-webapp
2. `snyk_rules.md` — identical copy
3. `security-secrets.md` — merged best of both
4. `commit-pr-release.md` — merged best of both
5. `testing-quality.md` — merged best of both
6. `documentation-first.md` — mcp-gateway version
7. `error-handling.md` — mcp-gateway version (most complete)
8. `patterns.md` — mcp-gateway version (most complete)
9. `typescript-javascript.md` — merged best of both
10. `software-version-quality.md` — merged best of both
11. `dependencies-security.md` — forge-patterns version (most complete)

### Step 3 — Write global skills (5 files)
Copy best versions of all 5 shared skills to global location.

### Step 4 — Write global workflows (7 shared + gateway-specific)
Copy best versions of shared workflows + gateway-specific ones.

### Step 5 — Sync back to each repo
Copy global files back to each repo's `.windsurf/` directory, overwriting where the global version is better.

---

## File Locations

- **Global**: `/Users/lucassantana/.windsurf/rules/`, `skills/`, `workflows/`
- **uiforge-webapp**: `/Users/lucassantana/Desenvolvimento/uiforge-webapp/.windsurf/`
- **mcp-gateway**: `/Users/lucassantana/Desenvolvimento/mcp-gateway/.windsurf/`
- **uiforge-mcp**: `/Users/lucassantana/Desenvolvimento/uiforge-mcp/.windsurf/`
- **forge-patterns**: `/Users/lucassantana/Desenvolvimento/forge-patterns/.windsurf/`

---

## Questions for you

1. **Sync direction**: Should the global files be the single source of truth (global → repos), or should repos keep their own divergences?
2. **Repo-specific rules**: Should repo-specific rules (e.g., `nextjs-app-router.md`, `supabase-auth.md`) stay only in their repo, or also be added globally?
3. **Memories**: Should I create global memories summarizing the ecosystem (project relationships, tech stacks, shared conventions)?
4. **New content**: Are there any new rules, skills, or workflows you want created that don't exist yet?
