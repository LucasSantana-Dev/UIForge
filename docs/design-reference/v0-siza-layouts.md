# v0-siza Layout Strategies

Layout patterns and responsive behavior extracted from v0-siza.

## Landing Page Flow

### Section Sequence

```
[Navbar - sticky, 64px, z-50]
   |
[Hero - min-h-90vh, 5-layer particle system]
   |
[ContextBar - stats ribbon with animated counters]
   |
[Capabilities - 6-card responsive grid]
   |
[CodeShowcase - 2-column split with code block]
   |
[Ecosystem - 4-card grid + architecture image]
   |
[DashboardPreview - full-width mockup]
   |
[LocalFirst - feature highlight, cost comparison]
   |
[CtaSection - centered CTA block]
   |
[Footer - multi-column links]
```

### Section Spacing Pattern

Every section follows:
```css
padding: 96px 24px;           /* mobile: py-24 px-6 */
padding: 96px 80px;           /* desktop: py-24 lg:px-20 */
max-width: 1280px;
margin: 0 auto;
```

### Content Width Strategy

| Context | Max Width | Class |
|---------|-----------|-------|
| Full sections | 1280px | `max-w-[1280px] mx-auto` |
| Text content | 640px | `max-w-2xl` |
| Hero heading | 800px | `max-w-3xl` |
| Cards grid | 1280px | inherits section |

## Dashboard Layout

### Shell Structure

```
+--sidebar (250px fixed)--+--main-area (flex-1)----------+
|                         | header (56px sticky)         |
| [logo + name]           | [breadcrumb]                 |
|                         +-----------------------------+
| [nav-group: Overview]   |                             |
|   Dashboard             | page content                |
|   Analytics             | (overflow-y-auto)           |
|   GitHub                |                             |
|                         |                             |
| [nav-group: Create]     |                             |
|   New Component         |                             |
|   New Application       |                             |
|   Image Generator       |                             |
|   Figma Prototype       |                             |
|                         |                             |
| [nav-group: Manage]     |                             |
|   Components            |                             |
|   Tools                 |                             |
|   Gateway               |                             |
|   API Keys              |                             |
|   Deployments           |                             |
|                         |                             |
| [nav-group: Configure]  |                             |
|   Rules                 |                             |
|   MCPs & Skills         |                             |
|   Design Patterns       |                             |
|   BFF Generator         |                             |
|   Docs                  |                             |
|   Settings              |                             |
+-------------------------+-----------------------------+
```

### Sidebar Behavior

- Fixed width: 250px
- Full height: h-screen
- Scroll: internal nav overflow-y-auto
- Collapse: not implemented (always visible on desktop, hidden on mobile)

### Create Component Page Layout

```
+--form-panel (col-span-5)--+--preview-panel (col-span-3)--+
|                           |                               |
| Component Type            | [Live Preview]                |
| Framework                 |                               |
| Style Preset              | Component renders here        |
| Props Config              | in real-time                  |
|                           |                               |
| [Generate Button]         | [Copy Code] [Download]        |
+---------------------------+-------------------------------+
```

Grid: `grid-cols-8`, form takes 5, preview takes 3 (62.5% / 37.5%).

## 18 Dashboard Pages

| # | Route | Page | Content Pattern |
|---|-------|------|-----------------|
| 1 | `/dashboard` | Overview | Stats cards + recent activity |
| 2 | `/dashboard/analytics` | Analytics | Charts + metrics (Recharts) |
| 3 | `/dashboard/github` | GitHub | Repository list, sync status |
| 4 | `/dashboard/create-component` | New Component | 5:3 form/preview split |
| 5 | `/dashboard/create-app` | New Application | Multi-step wizard |
| 6 | `/dashboard/image-gen` | Image Generator | Prompt + gallery grid |
| 7 | `/dashboard/figma` | Figma Prototype | Import/export interface |
| 8 | `/dashboard/components` | Components | Data table with search/filter |
| 9 | `/dashboard/tools` | Tools | Tool cards grid |
| 10 | `/dashboard/gateway` | Gateway | Status dashboard, routing config |
| 11 | `/dashboard/keys` | API Keys | Key management table |
| 12 | `/dashboard/deployments` | Deployments | Deploy history, status badges |
| 13 | `/dashboard/rules` | Rules | Rule editor, toggle list |
| 14 | `/dashboard/mcps` | MCPs & Skills | MCP server cards, skill toggles |
| 15 | `/dashboard/patterns` | Design Patterns | Pattern gallery with categories |
| 16 | `/dashboard/bff` | BFF Generator | Config form + output preview |
| 17 | `/dashboard/docs` | Documentation | MDX content, sidebar nav |
| 18 | `/dashboard/settings` | Settings | Form sections, tab groups |

## Responsive Breakpoints

v0-siza uses Tailwind's default breakpoints:

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Hero heading size bump (40->52px) |
| `md` | 768px | Hero heading max (64px), 2-col grids |
| `lg` | 1024px | Desktop nav visible, sidebar appears, 3-col grids |
| `xl` | 1280px | Max content width reached |

### Mobile-First Patterns

**Navbar:**
- Mobile: hamburger menu, full-screen overlay
- Desktop (lg+): horizontal nav links + CTA buttons

**Hero:**
- Mobile: single column, reduced heading size, stacked CTAs
- Desktop: full particle system, large heading, inline CTAs

**Card Grids:**
- Mobile: single column stack
- sm: 2 columns
- lg: 3 columns
- Some grids: 1 -> 2 -> 4 at xl

**Dashboard:**
- Mobile: sidebar hidden (not yet implemented — desktop-only in v0-siza)
- Desktop: fixed sidebar + fluid content

## Grid Patterns

### Feature Card Grid (Capabilities)

```
Mobile:  [card] [card] [card] [card] [card] [card]  (1 col)
sm:      [card] [card]                               (2 col)
         [card] [card]
         [card] [card]
lg:      [card] [card] [card]                        (3 col)
         [card] [card] [card]
```

### Ecosystem Grid

```
Mobile:  [repo] [repo] [repo] [repo]                (1 col)
md:      [repo] [repo]                               (2 col)
         [repo] [repo]
```

### Dashboard Stats

```
Mobile:  [stat] [stat]                               (2 col)
md:      [stat] [stat] [stat] [stat]                 (4 col)
```

## Z-Index Strategy

| Layer | Z-Index | Element |
|-------|---------|---------|
| Background | 0 | Hero bg image |
| Mesh | 1 | Rotating gradient |
| Dots | 2 | Dot grid pattern |
| Particles | 3 | Canvas particles |
| Glow | 4 | Central glow |
| Content | 10 | Hero text/CTAs |
| Header | 50 | Sticky navbar |
| Overlays | 50+ | Mobile menu, modals |

## Scroll Behavior

- Smooth scroll to sections via anchor links
- IntersectionObserver reveal at 10% visibility threshold
- One-shot animations (no reverse on scroll out)
- Navbar background opacity change at 20px scroll threshold
- Stagger delays: 0, 80, 160, 240, 320, 400ms per element
