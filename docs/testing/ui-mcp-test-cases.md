# ui-mcp Test Cases

Test matrix for ui-mcp component generation quality vs v0-siza reference.

## Environment

- ui-mcp version: 0.5.0
- Build: `tsc` (TypeScript)
- Test method: Direct GeneratorFactory invocation + RAG registry matching
- Date: 2026-02-24

## Test Matrix

| # | Component | Framework | Library | Visual Style | Mood | Industry |
|---|-----------|-----------|---------|-------------|------|----------|
| 1 | Hero section | nextjs | shadcn | dark-premium | premium | devtools |
| 2 | Create component page | nextjs | shadcn | dark-premium | professional | devtools |
| 3 | Data table | react | shadcn | minimal-editorial | minimal | saas |
| 4 | Pricing card | nextjs | shadcn | glassmorphism | premium | saas |
| 5 | Navbar | nextjs | shadcn | dark-premium | premium | devtools |

## Test Results

### Test 1: Hero Section

**RAG Match:** Gradient Hero (`hero-gradient`) — correct match
- Inspiration: Linear / Vercel dark hero sections
- Visual styles: gradient-mesh, dark-premium
- Anti-generic features: radial gradient bg, gradient text with via stop, inverted CTA

**Generated Output (945 chars):**
```tsx
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function Hero() {
  return (
    <Card className={cn("w-full max-w-md", props.className)}>
      <CardHeader>
        <CardTitle>Hero</CardTitle>
        <CardDescription>A hero component built with shadcn/ui</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is a hero component using shadcn/ui design system.</p>
        <Button className="mt-4">Click me</Button>
      </CardContent>
    </Card>
  )
}
```

**v0-siza Reference:** 5-layer particle system (canvas + mesh gradient + dot grid + glow), min-height 90vh, staggered entrance animations, terminal mockup, gradient text, 700+ lines.

**Quality Score: 1/10** — Generic Card shell, no hero semantics, no visual effects, no section element, no heading hierarchy, no dark theme styling.

---

### Test 2: Create Component Page (Form)

**RAG Match:** Login Form (`form-login`) — wrong match (login form vs component creation form)
- Inspiration: shadcn/ui login form + Clerk auth pages
- Visual styles: soft-depth, corporate-trust, minimal-editorial (not dark-premium)

**Generated Output (945 chars):** Identical Card shell as Hero with "Form" name.

**v0-siza Reference:** 5:3 grid split layout, component type selector, framework dropdown, style preset selector, props configuration panel, live preview area, code output with copy button.

**Quality Score: 1/10** — Wrong component type matched, no form fields, no grid layout, no preview panel.

---

### Test 3: Data Table

**RAG Match:** Default Button (`button-default`) — **wrong match** (button for table request)
- Inspiration: shadcn/ui Button
- No table-related features matched

**Generated Output (950 chars):** Identical Card shell with "Table" name.

**v0-siza Reference:** Full data table with column headers, sortable columns, search input, pagination, column visibility toggles, row hover effects, responsive horizontal scroll.

**Quality Score: 1/10** — Completely wrong RAG match, no table element, no table semantics, no data rows.

---

### Test 4: Pricing Card

**RAG Match:** Glass Button (`button-glass`) — **wrong match** (button for card request)
- Inspiration: Apple visionOS buttons
- Glassmorphism style correctly identified but wrong component type

**Generated Output (945 chars):** Identical Card shell with "Card" name. Also has naming collision — exports `function Card` but also uses `<Card>` component.

**v0-siza Reference:** Glassmorphic card with backdrop blur, gradient border effect, pricing tier name, price display, feature list with checkmarks, CTA button, hover glow effect, popular badge.

**Quality Score: 1/10** — Wrong RAG match, no glassmorphism, no pricing content, naming collision bug.

---

### Test 5: Navbar

**RAG Match:** Lead Paragraph (`paragraph-lead`) — **wrong match** (typography for navbar request)
- Inspiration: Medium article leads
- No navigation-related features

**Generated Output (955 chars):** Identical Card shell with "Navbar" name.

**v0-siza Reference:** Sticky glassmorphic bar (64px), backdrop-filter blur(12px), scroll-aware opacity transition, S-curve logo SVG, desktop nav links with active indicator, mobile hamburger with full-screen overlay, CTA buttons.

**Quality Score: 1/10** — Completely wrong RAG match, no nav element, no sticky positioning, no mobile menu.

---

## Summary

| Test | RAG Match Correct? | Output Matches Type? | Dark Theme? | Visual Effects? | Score |
|------|-------------------|---------------------|-------------|-----------------|-------|
| Hero | Yes | No | No | No | 1/10 |
| Form | No (login vs create) | No | No | No | 1/10 |
| Table | No (button) | No | No | No | 1/10 |
| Card | No (button) | No | No | No | 1/10 |
| Navbar | No (paragraph) | No | No | No | 1/10 |

**Overall Score: 1/10**

### Root Cause

The `ReactGenerator.generateComponent()` produces a **single generic Card template** for all component types when the `shadcn` library is specified. It ignores:
1. The RAG registry match JSX (dead code path)
2. The component type semantics
3. The visual style parameter
4. The design context (colors, typography, spacing)
5. The mood and industry parameters

The RAG matching system correctly identifies relevant snippets (hero-gradient for hero, form-login for form) but 3 of 5 matches are wrong type (button/paragraph matched for table/card/navbar). Even when correct, the matched JSX is never used in the final output.
