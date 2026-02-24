# v0-siza Component Pattern Catalog

Component patterns extracted from v0-siza (`components/siza/`, `app/dashboard/`).

## Hero Section

**File:** `components/siza/hero.tsx`

### Particle Animation System

Canvas-based particle system with connection lines.

**Parameters:**
- Particle count: 40
- Size range: 1.5px - 4px (`1.5 + Math.random() * 2.5`)
- Opacity range: 0.1 - 0.35
- Velocity: -0.125 to +0.125 px/frame on each axis
- Color: `rgba(139, 92, 246, opacity)` (purple-500)
- Pulse: sinusoidal, speed 0.003-0.008, full 2pi offset
- Final opacity: `base * (0.5 + pulse * 0.5)`

**Connection Lines:**
- Max distance: 120px
- Color: `rgba(124, 58, 237, 0.04 * (1 - dist/120))`
- Stroke width: 0.5px

### 5-Layer Visual Stack

| Z | Layer | Implementation |
|---|-------|----------------|
| 0 | Background image | `/images/hero-abstract.jpg`, opacity 0.3, gradient overlay `from-[#121214]/40 via-transparent to-[#121214]` |
| 1 | Mesh gradient | Conic gradient rotating 30s. Colors: `rgba(124,58,237,0.06)` at 0/240deg, `rgba(99,102,241,0.04)` at 120/360deg, transparent between |
| 2 | Dot grid | Radial gradient dots `rgba(250,250,250,0.035)` 1px, grid 28x28px |
| 3 | Particles | Canvas element, 40 particles with connection lines |
| 4 | Central glow | 700x700px radial gradient, `rgba(124,58,237,0.12)` center fading to transparent. Pulse: 6s ease-in-out, opacity 0.5-0.8, scale 1-1.06 |

### Entrance Animations

Staggered content reveal:

| Element | Delay | Duration | Transform |
|---------|-------|----------|-----------|
| Badge | 0ms | 700ms | translateY(16px) -> 0 |
| Heading | 100ms | 700ms | translateY(16px) -> 0 |
| Subheading | 200ms | 700ms | translateY(16px) -> 0 |
| CTAs | 300ms | 700ms | translateY(16px) -> 0 |
| Terminal | 500ms | 1000ms | translateY(40px) -> 0 |

### Terminal Mockup

- Background: dark card surface
- Three colored dots (red/yellow/green) header
- Cursor blink: 530ms interval
- Code font: JetBrains Mono, 13px
- Lines include prompt (`$`), command, output

## Navbar

**File:** `components/siza/navbar.tsx`

### Glassmorphic Sticky Bar

- Height: 64px
- Position: sticky top-0 z-50
- Scroll threshold: 20px
- Background transition: 300ms
- Not scrolled: `rgba(18,18,20,0.95)`, scrolled: `rgba(18,18,20,0.85)`
- Backdrop: `blur(12px)`
- Border: 1px solid `#27272A`

### Logo

- SVG icon: 22x22px, stroke `#7C3AED`, stroke-width 2.5, linecap round
- Path: S-curve (`M17 4H9C6.79 4 5 5.79 5 8v0c0 2.21 1.79 4 4 4h6c2.21 0 4 1.79 4 4v0c0 2.21-1.79 4-4 4H7`)
- Text: "siza", Outfit font, 17px bold, tracking -0.02em

### Navigation Links

Desktop (hidden below lg):
- Items: Platform, Tools, About, Roadmap
- Size: 14px
- Inactive: `#A1A1AA`, active: `#FAFAFA`
- Active indicator: 4px wide, 2px tall purple underline (`#7C3AED`)

### CTA Buttons

- "Sign in": text `#A1A1AA`, hover `#FAFAFA`
- "Get Started": bg `#7C3AED`, hover `#8B5CF6` + `box-shadow: 0 0 20px rgba(124,58,237,0.25)`, active `scale(0.98)` + `#6D28D9`

### Mobile Menu

- Trigger: hamburger icon (Menu/X toggle)
- Background: `rgba(18,18,20,0.98)`, backdrop-blur-xl
- Border top: 1px solid `#27272A`
- Link hover: `rgba(255,255,255,0.04)`

## Dashboard Layout

**File:** `app/dashboard/layout.tsx`

### Structure

```
+--sidebar (250px)--+--content-area---------+
|                   | top-header (56px)     |
| logo              | breadcrumb            |
| nav groups        +----------------------+
|                   | page content          |
| overview          | (scrollable)          |
| create            |                       |
| manage            |                       |
| configure         |                       |
+-------------------+----------------------+
```

### Sidebar

- Width: 250px
- Background: `#18181B`
- Border right: 1px solid `#27272A`
- Navigation organized in 4 groups:
  - **Overview:** Dashboard, Analytics, GitHub
  - **Create:** New Component, New Application, Image Generator, Figma Prototype
  - **Manage:** Components, Tools, Gateway, API Keys, Deployments
  - **Configure:** Rules, MCPs & Skills, Design Patterns, BFF Generator, Docs, Settings

### Top Header

- Height: 56px
- Background: `#18181B/50` + backdrop-blur-sm
- Border bottom: 1px solid `#27272A`
- Breadcrumb: ChevronRight separator, active `#FAFAFA`, inactive `#71717A`

## Create Component Page

**File:** `app/dashboard/create-component/page.tsx`

### Layout

5:3 grid split (62.5% / 37.5%):
- Left: Form area (component configuration)
- Right: Live preview panel

### Form Elements

- Component type selector
- Framework dropdown
- Style preset selector
- Props configuration
- Code editor area

## Card Patterns

### Glassmorphic Card

```
background: #18181B
border: 1px solid #27272A
border-radius: 12px
padding: 20-24px
```

### Hover Glow Effect

```css
.card:hover {
  border-color: #3F3F46;
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.1);
}
```

### Feature Card

- Icon: 40x40px circle, purple-tinted bg `rgba(124,58,237,0.12)`
- Title: 16px semibold
- Description: 14px, `#A1A1AA`
- Hover: border brightens, subtle glow

## Button System

### Variants

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| Primary | `#7C3AED` | `#FFFFFF` | none |
| Secondary | `#18181B/50` | `#FAFAFA` | 1px `#27272A` |
| Ghost | transparent | `#A1A1AA` | none |
| Destructive | `#EF4444` | `#FAFAFA` | none |

### States

- Hover (primary): `#8B5CF6` + glow shadow
- Active: `scale(0.98)` + `#6D28D9`
- Focus: `ring-2 ring-[#7C3AED] ring-offset-2 ring-offset-[#121214]`
- Disabled: 50% opacity, no pointer events

### Sizes

| Size | Height | Padding | Font |
|------|--------|---------|------|
| sm | 36px | 12px x 8px | 13px |
| md | 40px | 16px x 8px | 14px |
| lg | 48px | 28px x 12px | 15px |

## Badge Component

- Background: `rgba(124,58,237,0.12)` or solid variants
- Border: 1px solid `rgba(124,58,237,0.3)`
- Border radius: full (pill)
- Font: 11-12px
- Ping animation variant: animated ring pulse

## Scroll Reveal

**File:** `hooks/use-reveal-on-scroll.ts`

- IntersectionObserver with 0.1 threshold
- One-shot (disconnects after reveal)

```css
.reveal-hidden {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 600ms ease, transform 600ms ease;
}
.reveal-visible {
  opacity: 1;
  transform: translateY(0);
}
```

## Animated Counters

Used in ContextBar section for stats display.
- Easing: cubic ease-out `1 - pow(1 - t, 3)`
- Triggered on scroll visibility
- Suffix support (K, +, %, etc.)

## Landing Page Sections

1. **Navbar** - sticky glassmorphic
2. **Hero** - 5-layer particle system, 90vh
3. **ContextBar** - stats with animated counters
4. **Capabilities** - 6-card grid
5. **CodeShowcase** - 2-column with syntax-highlighted code block
6. **Ecosystem** - 4 repository cards + architecture diagram
7. **DashboardPreview** - dashboard UI mockup
8. **LocalFirst** - Ollama integration benefits, cost comparison
9. **CtaSection** - final call-to-action
10. **Footer** - links and branding
