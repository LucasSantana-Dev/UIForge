# Stitch MCP Design Screens (2026-03-01)

## Project
- **Name**: "Siza AI Developer Platform Landing Page"
- **ID**: `14150866373996469001`
- **Model**: Gemini 3 Pro (better than Flash for complex layouts)

## Screen Inventory (71 total, ~27 favorited)
- **22 desktop named screens**: Sign In, Sign Up, Forgot Password, Onboarding, Projects, Project Detail, Code Generator (prompt + code views), Templates Gallery, Generation History, Settings, Billing, AI Keys, Pricing, Documentation, About, Roadmap, Landing + variants
- **5 mobile screens**: Landing, Sign In, Code Generator, Projects List, Pricing
- **~44 duplicate/variant screens**: User marked for cleanup (no delete API in Stitch)

## Design Token Adaptation (completed)
All favorited screens updated via 6 batch `edit_screens` calls to match real Siza codebase:
- **Fonts**: DM Sans (body) → Plus Jakarta Sans (headings) → IBM Plex Mono (code)
- **Surfaces**: #121214 (bg), #1a1a1e (cards), #27272a (elevated), #3f3f46 (borders)
- **Brand**: #7c3aed primary, #8b5cf6 hover
- **Nav items**: Projects, Templates, History, AI Keys, Billing, Settings + "Generate Component" button
- **Sidebar**: Collapsible w-64/w-16, NOT fixed 240px
- **Border radius**: 10px base (NOT 16px/12px)

## 3 Layout Shells
1. **Dashboard**: Sidebar (6 nav items) + TopBar (h-16, ⌘K search, breadcrumbs) + content (p-6)
2. **Auth**: Centered card (420px, 10px radius, brand glow), OAuth buttons
3. **Marketing**: Sticky nav (h-14, blur backdrop), links: Home/About/Roadmap/Docs, 4-column footer

## Gotchas
- **`edit_screens` resets `isFavourite` flags** — re-favorite after batch edits
- No delete screen API — cleanup must be done in Stitch UI
- Parallel generation safe (6 concurrent calls work)
- Gemini 3 Pro > Flash for multi-section layouts
- Token-level specificity (exact hex/px) >> vague descriptions ("modern", "dark")
- Anti-pattern declarations effectively constrain output ("No gradients on text", "NOT 16px")
- Batch edit pattern: group by layout shell, apply identical prompt to all via `selectedScreenIds`
