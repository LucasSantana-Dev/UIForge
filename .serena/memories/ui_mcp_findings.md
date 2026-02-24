# ui-mcp Gap Analysis Findings (Feb 2026)

## Summary
ui-mcp's generator produces identical generic Card boilerplate for all component types. RAG matching works but output is disconnected from generator pipeline. The gap vs v0-siza quality is fundamental, not incremental.

## Critical Issues
1. **Generator Pipeline Disconnect**: `ReactGenerator.generateComponent()` ignores RAG registry match. `getComponentBody()` retrieves registry JSX but is dead code — factory path bypasses it.
2. **Single Template Problem**: Shadcn mode outputs identical Card shell for everything — hero, navbar, table, form all get `<Card>`.

## RAG Matching Problems
- 3/5 test cases matched wrong type:
  - Table → Button (should match table)
  - Card → Button (should match card)
  - Navbar → Paragraph (should match navigation)
- Type-level pre-filtering needed before style/mood scoring

## Ignored Parameters
- `visual_style`: accepted, logged, has zero effect on output
- `mood`, `industry`: no impact
- Design context tokens (colors, fonts, spacing): passed through pipeline but generator uses hardcoded generic classes

## Code Bugs
- Duplicate `cn` imports, duplicate Card imports
- `function Card` + `<Card>` component name shadowing
- `props.className` referenced without props parameter

## Severity Distribution
- Critical: 4 (architecture failures)
- High: 17 (major missing features)
- Medium: 12 (missing polish)
- Low: 5 (minor details)
- Total: 38 gaps across 5 test cases

## Priority Fixes
### P1 — Generator Pipeline (1-2 days)
1. Wire RAG registry JSX into ReactGenerator output
2. Create type-aware shadcn templates (hero→section, navbar→nav, table→Table)
3. Fix duplicate import and naming bugs

### P2 — RAG Matching (1 day)
4. Type-level pre-filter (exact type match required)
5. Add registry snippets: navbar, table, pricing-card, dashboard-layout
6. Add v0-siza patterns to registry

### P3 — Visual Styles (2-3 days)
7. Style application pipeline (transform JSX based on visual_style)
8. Apply design context tokens to output
9. Dark-premium transformer: dark bg, purple accents, zinc text

### P4 — Advanced Effects (3-5 days)
10. Canvas particle animation template
11. Glassmorphism transformer
12. Staggered entrance animation system

### P5 — Feed v0-siza Back (1-2 days)
13. Add v0-siza hero, navbar, dashboard, card, table patterns to registry

## Reference
Full analysis: `siza/docs/testing/ui-mcp-gaps.md`
Test cases: `siza/docs/testing/ui-mcp-test-cases.md`
