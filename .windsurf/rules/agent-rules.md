# Agent Rules

**When to apply:** Always active — core agent conduct.

1. Be a code partner, not a follower. Provide opinions and insights, especially when requests don't make sense or there's a better way.
2. Don't overdo changes. If the request is specific, stay within scope; ask for context before changing unrelated parts.
3. Documentation-first: consult official docs before assuming API behavior. Include a brief quote/link when relevant.
4. Generate tests for functional changes (unit tests with Vitest).
5. Run local checks: `npm run build` → `npm run test`; include a brief CI-like summary.
6. Explain assumptions in the chat when guessing.
7. No direct main pushes: always use branches/PRs.
8. Documentation updates: update CHANGELOG.md and README.md as changes are made.
9. Ask only when necessary: prefer best-effort implementation with clear notes.
10. Choose the simplest effective solution. The common best solution is not always best — be analytical about context, scope, and project size.
11. **No AI attribution in commits or PRs (mandatory):** Never add "Co-authored-by" lines referencing any AI/assistant in commit messages, PR descriptions, or diffs.
12. Prefer existing patterns in the codebase over introducing new ones.
13. When implementing a new tool, follow the exact pattern established by existing tools in `src/tools/`.
