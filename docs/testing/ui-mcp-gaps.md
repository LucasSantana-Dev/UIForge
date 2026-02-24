# ui-mcp Gap Analysis vs v0-siza

Comparison of ui-mcp generation quality against v0-siza design reference.

## Executive Summary

ui-mcp's template-based generator produces identical generic Card boilerplate for all component types. The RAG matching system works but its output is disconnected from the generator pipeline. The gap between ui-mcp output and v0-siza quality is **fundamental** — not incremental.

## Gap Comparison Table

| Feature | v0-siza | ui-mcp Output | Severity | Gap |
|---------|---------|---------------|----------|-----|
| **Architecture** |
| Component-specific JSX | Unique per component | Same Card shell for all | **Critical** | Generator ignores component type |
| RAG registry integration | N/A | Matched but unused | **Critical** | Dead code path — registry JSX never injected |
| Visual style application | N/A | Parameter accepted but ignored | **High** | dark-premium/glassmorphism have no effect |
| Design context tokens | Custom CSS vars per component | Default blue-theme context | **High** | No v0-siza palette applied |
| **Hero Section** |
| Particle animation | Canvas, 40 particles, connection lines | None | **High** | Canvas/requestAnimationFrame not generated |
| 5-layer visual stack | bg + mesh + dots + particles + glow | None | **High** | No layered backgrounds |
| Staggered entrance | 5 elements with 80-100ms stagger | None | **Medium** | No animation system |
| Terminal mockup | Code preview with cursor blink | None | **Medium** | No interactive elements |
| Gradient text | bg-clip-text gradient on heading | None | **Medium** | No text effects |
| Heading hierarchy | 40→52→64px responsive h1 | Generic CardTitle | **High** | No semantic heading |
| **Navbar** |
| Glassmorphism | backdrop-blur(12px), scroll-aware opacity | None | **High** | No backdrop-filter |
| Sticky positioning | sticky top-0 z-50 | None | **High** | No positioning |
| Mobile hamburger menu | Full-screen overlay, animated toggle | None | **High** | No responsive nav |
| Active link indicator | Purple underline on active link | None | **Medium** | No nav links at all |
| Logo SVG | Custom S-curve path | None | **Medium** | No logo |
| Scroll detection | 20px threshold, bg transition | None | **Medium** | No scroll behavior |
| **Dashboard / Form** |
| Grid layout | 5:3 split (form + preview) | None | **High** | No grid structure |
| Live preview panel | Real-time component rendering | None | **High** | No preview concept |
| Component selectors | Type, framework, style dropdowns | None | **High** | No form fields |
| Sidebar navigation | 250px fixed, 4 nav groups, 18 items | None | **High** | No dashboard shell |
| Breadcrumbs | Chevron-separated path | None | **Medium** | No breadcrumbs |
| **Data Table** |
| Table element | semantic `<table>` with roles | None | **Critical** | No table at all |
| Sorting | Column sort indicators | None | **High** | No interactivity |
| Pagination | Page navigation controls | None | **High** | No pagination |
| Search / filter | Search input + filter dropdowns | None | **High** | No search |
| Column visibility | Toggle column show/hide | None | **Medium** | No column config |
| Row hover | bg transition on hover | None | **Low** | No hover states |
| **Card (Pricing)** |
| Glassmorphism | backdrop-blur, semi-transparent bg | None | **High** | No glass effect |
| Gradient borders | Purple gradient border effect | None | **Medium** | No gradient border |
| Pricing layout | Tier name, price, features, CTA | Generic card | **High** | No pricing semantics |
| Hover glow | box-shadow glow on hover | None | **Medium** | No hover effects |
| Popular badge | Highlighted tier indicator | None | **Low** | No badge |
| **Design System** |
| Dark theme | #121214 bg, #FAFAFA text | Default light theme | **Critical** | Wrong color scheme |
| Purple brand (#7C3AED) | Consistent throughout | Generic blue primary | **High** | Wrong brand color |
| Outfit display font | Headings use Outfit | Default sans-serif | **Medium** | No font customization |
| Inter body font | Body text uses Inter | Default sans-serif | **Medium** | No font customization |
| JetBrains Mono code | Code blocks use monospace | None | **Low** | No code font |
| Custom border radius | 12px base | Default small radius | **Low** | Different radius scale |
| **Code Quality** |
| Duplicate imports | N/A | Two `cn` imports, two Card imports | **Medium** | Import deduplication bug |
| Naming collision | N/A | `function Card` + `<Card>` component | **Medium** | Name shadowing bug |
| Props reference | N/A | `props.className` without props param | **Medium** | Undefined variable bug |
| Test relevance | N/A | Tests check generic text, not behavior | **Low** | Scaffold tests have no value |

## Severity Distribution

| Severity | Count | Description |
|----------|-------|-------------|
| **Critical** | 4 | Fundamental architecture failures |
| **High** | 17 | Major missing features |
| **Medium** | 12 | Notable missing polish |
| **Low** | 5 | Minor missing details |
| **Total** | 38 | Across all test cases |

## Root Causes

### 1. Generator Pipeline Disconnect (Critical)

The `ReactGenerator.generateComponent()` method ignores the RAG registry match entirely. The `getComponentBody()` function in `generate-ui-component.ts` correctly retrieves registry JSX but is dead code — the factory path bypasses it.

**Fix:** Wire the RAG match JSX into the ReactGenerator pipeline. The registry has high-quality hero, card, and form snippets that would produce far better output if actually used.

### 2. Shadcn Mode Uses Single Template (Critical)

When `component_library: 'shadcn'` is specified, the ReactGenerator outputs an identical Card-based template regardless of component type. It wraps everything in `<Card>` instead of using the correct semantic element (section, nav, table, form).

**Fix:** Create type-aware shadcn templates. A hero should use `<section>`, a navbar should use `<nav>` with navigation primitives, a table should use shadcn's `<Table>` components, etc.

### 3. RAG Matching Inaccuracy (High)

3 of 5 test cases matched the wrong component type:
- Table → Button (should match table/data-table snippets)
- Card → Button (should match card/pricing snippets)
- Navbar → Paragraph (should match navigation snippets)

**Fix:** Enforce type-level matching before scoring mood/style/industry. A "table" request should never match "button" regardless of style similarity.

### 4. No Visual Style Application (High)

The `visual_style` parameter is accepted and logged but has no effect on the generated output. The 10 built-in style presets (dark-premium, glassmorphism, etc.) exist as reference data but aren't applied to the generated JSX.

**Fix:** Create a style application layer that transforms generated JSX based on the selected visual style — adding dark backgrounds, backdrop-blur, gradient effects, etc.

### 5. Design Context Ignored (High)

The `IDesignContext` with color palette, typography, and spacing is passed through the pipeline but the ReactGenerator's shadcn template uses hardcoded generic classes instead of the context values.

**Fix:** Apply design context tokens as CSS custom properties or Tailwind theme values in the generated output.

## Workarounds

| Gap | Workaround |
|-----|-----------|
| Generic output | Use the `getComponentBody` fallback templates directly (they're better than the shadcn wrapper) |
| No dark theme | Post-process output to replace bg-white → bg-zinc-950, text-zinc-900 → text-zinc-50, etc. |
| No particles/glassmorphism | Maintain a separate template library of advanced effects, inject as post-processing |
| Wrong RAG matches | Pre-filter registry by exact component type before scoring |
| No visual style | Apply style-specific CSS class overrides as a transform step |
| Import bugs | Fix ReactGenerator's shadcn template to avoid duplicate imports |

## Prioritized Improvement Recommendations

### Priority 1 — Fix Generator Pipeline (1-2 days)

1. Wire RAG registry JSX into ReactGenerator output
2. Create type-aware shadcn templates (hero, navbar, table, form, card)
3. Fix duplicate import and naming collision bugs

### Priority 2 — Improve RAG Matching (1 day)

4. Add type-level pre-filter (exact type match required)
5. Add more registry snippets: navbar, table, pricing-card, dashboard-layout
6. Add v0-siza patterns to registry (hero particle system, glassmorphic navbar)

### Priority 3 — Apply Visual Styles (2-3 days)

7. Create style application pipeline that transforms JSX based on visual_style
8. Apply design context tokens (colors, fonts, spacing) to output
9. Add dark-premium transformer: dark backgrounds, purple accents, zinc text scale

### Priority 4 — Advanced Effects (3-5 days)

10. Add canvas particle animation template for hero components
11. Add glassmorphism transformer (backdrop-blur, semi-transparent bg, border)
12. Add staggered entrance animation system
13. Add gradient text utility

### Priority 5 — Feed v0-siza Patterns Back (1-2 days)

14. Add v0-siza hero pattern to registry (organisms/heroes.ts)
15. Add v0-siza navbar pattern to registry (molecules/navigation.ts)
16. Add v0-siza dashboard layout to registry (new organisms/dashboards.ts)
17. Add v0-siza card patterns with glassmorphism to registry (molecules/cards.ts)
18. Add v0-siza data table with full features to registry (new organisms/tables.ts)

## Integration Roadmap for Siza Webapp

1. **Immediate**: Use `ai-generation-prompt.md` with external tools (v0/Lovable/Bolt) for landing page refresh
2. **Short-term**: Fix ui-mcp generator pipeline (Priority 1-2) so Siza can dog-food its own MCP tools
3. **Medium-term**: Add v0-siza patterns to registry (Priority 5) so ui-mcp generates at v0-siza quality level
4. **Long-term**: Replace template-based generation with LLM-powered generation using the registry as few-shot examples + quality scoring as guardrails
