# v0-siza Design Token Inventory

Extracted from v0-siza (Next.js 16, Tailwind 4, shadcn/ui).

## Color System

### Core Palette

| Token | CSS Variable | Value | Usage |
|-------|-------------|-------|-------|
| Background | `--background` | `#121214` | Page background |
| Foreground | `--foreground` | `#FAFAFA` | Primary text |
| Card | `--card` | `#18181B` | Card surfaces, sidebar |
| Card Foreground | `--card-foreground` | `#FAFAFA` | Card text |
| Popover | `--popover` | `#18181B` | Dropdowns, tooltips |
| Primary | `--primary` | `#7C3AED` | Brand purple, CTAs, focus rings |
| Primary Foreground | `--primary-foreground` | `#FFFFFF` | Text on primary |
| Secondary | `--secondary` | `#18181B` | Secondary surfaces |
| Secondary Foreground | `--secondary-foreground` | `#FAFAFA` | Secondary text |
| Muted | `--muted` | `#27272A` | Muted backgrounds, borders |
| Muted Foreground | `--muted-foreground` | `#A1A1AA` | Muted text, placeholders |
| Accent | `--accent` | `rgba(124,58,237,0.12)` | Subtle purple highlights |
| Accent Foreground | `--accent-foreground` | `#8B5CF6` | Active accent text |
| Destructive | `--destructive` | `#EF4444` | Error states |
| Border | `--border` | `#27272A` | Default borders |
| Input | `--input` | `#18181B` | Input backgrounds |
| Ring | `--ring` | `#7C3AED` | Focus rings |

### Extended Colors

| Color | Hex | Context |
|-------|-----|---------|
| Purple 600 | `#7C3AED` | Primary brand |
| Purple 500 | `#8B5CF6` | Hover state, accent text |
| Purple 700 | `#6D28D9` | Active/pressed state |
| Indigo 500 | `#6366F1` | Secondary accent, mesh gradient |
| Green 500 | `#22C55E` | Success indicators |
| Red 500 | `#EF4444` | Error, destructive |
| Yellow 500 | `#EAB308` | Warning indicators |
| Blue 400 | `#60A5FA` | Info accent |
| Zinc 500 | `#71717A` | Muted text, breadcrumbs |
| Zinc 700 | `#3F3F46` | Hover borders |
| Zinc 800 | `#27272A` | Borders, muted bg |
| Zinc 900 | `#18181B` | Card surfaces |
| Custom BG | `#1E1E22` | Alternative surface |

### Glassmorphism Values

| Property | Value | Context |
|----------|-------|---------|
| Navbar bg (scrolled) | `rgba(18,18,20,0.85)` | Scrolled navbar |
| Navbar bg (top) | `rgba(18,18,20,0.95)` | Default navbar |
| Mobile menu bg | `rgba(18,18,20,0.98)` | Mobile overlay |
| Backdrop blur | `blur(12px)` | Navbar glass effect |
| Mobile hover | `rgba(255,255,255,0.04)` | Menu item hover |

## Typography

### Font Stack

| Role | Font | Variable | Fallback |
|------|------|----------|----------|
| Display | Outfit | `--font-display` / `--font-outfit` | system-ui, sans-serif |
| Body | Inter | `--font-sans` / `--font-inter` | system-ui, sans-serif |
| Code | JetBrains Mono | `--font-mono` | monospace |

### Type Scale

| Element | Size (mobile) | Size (desktop) | Line Height | Tracking |
|---------|--------------|----------------|-------------|----------|
| Hero H1 | 40px | 52px → 64px | 1.08 | -0.03em |
| Section H2 | 32px | 32px | 1.2 | -0.02em |
| Dashboard H1 | 24px | 24px | default | -0.02em |
| Card Title | 16px | 16px | default | — |
| Section Label | 11px | 11px (uppercase) | default | 0.08em |
| Large Body | 18-20px | 18-20px | 1.7-1.75 | — |
| Body | 14px | 14px | 1.6 | — |
| Small | 13px | 13px | 1.6 | — |
| Caption | 12px | 12px | — | — |
| Tiny | 10-11px | 10-11px | — | — |
| Code Block | 12-13px | 12-13px | 1.65-1.9 | — |

### Font Weights

- Display headings: 700 (bold)
- Section headings: 700 (bold)
- Card titles: 600 (semibold)
- Body: 400 (normal)
- Buttons: 500 (medium)
- Labels: 500-600

## Spacing

### Section Spacing

| Context | Value | Tailwind |
|---------|-------|----------|
| Section vertical | 96px | `py-24` |
| Section horizontal (mobile) | 24px | `px-6` |
| Section horizontal (desktop) | 80px | `lg:px-20` |
| Max content width | 1280px | `max-w-[1280px]` |

### Component Spacing

| Context | Value | Tailwind |
|---------|-------|----------|
| Card padding | 20-24px | `p-5` / `p-6` |
| Input padding | 12px x 10px | `px-3 py-2.5` |
| Button padding (sm) | 16px x 8px | `px-4 py-2` |
| Button padding (lg) | 28px x 12px | `px-7 py-3` |

### Gap Scale

| Size | Value | Tailwind |
|------|-------|----------|
| XS | 8px | `gap-2` |
| SM | 12px | `gap-3` |
| MD | 16px | `gap-4` |
| LG | 24px | `gap-6` |
| XL | 32px | `gap-8` |
| 2XL | 48px | `gap-12` |
| 3XL | 64px | `gap-16` |

## Border Radius

| Token | Value | Tailwind |
|-------|-------|----------|
| `--radius` (base) | 0.75rem (12px) | — |
| `--radius-sm` | 8px | `rounded-sm` |
| `--radius-md` | 10px | `rounded-md` |
| `--radius-lg` | 12px | `rounded-lg` |
| `--radius-xl` | 16px | `rounded-xl` |

## Shadows & Effects

### Button Glow

```css
/* Primary button hover */
box-shadow: 0 0 30px rgba(124, 58, 237, 0.3);

/* CTA button hover (navbar) */
box-shadow: 0 0 20px rgba(124, 58, 237, 0.25);
```

### Glassmorphism

```css
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
background: rgba(18, 18, 20, 0.85);
border-bottom: 1px solid #27272A;
```

## Animation Tokens

### Duration Scale

| Name | Duration | Usage |
|------|----------|-------|
| Fast | 150ms | Micro-interactions |
| Standard | 200ms | Hover, focus |
| Entrance | 600-700ms | Reveal animations |
| Long | 1000ms | Terminal entrance |
| Ambient | 6s | Glow pulse |
| Background | 30s | Mesh rotation |
| Cursor | 530ms | Blink interval |

### Stagger Delays

```
stagger-1: 0ms
stagger-2: 80ms
stagger-3: 160ms
stagger-4: 240ms
stagger-5: 320ms
stagger-6: 400ms
```

### Easing

| Name | Value | Usage |
|------|-------|-------|
| Entrance | `ease` | Reveal on scroll |
| Count-up | `1 - pow(1 - t, 3)` | Number animations |
| Ambient | `ease-in-out` | Glow pulse |

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 16.1.6 | Framework |
| React | 19.2.4 | UI library |
| Tailwind CSS | 4.2.0 | Styling |
| shadcn/ui | 57 components | UI primitives |
| Lucide React | 0.564.0 | Icons |
| Recharts | 2.15.0 | Charts |
| Sonner | 1.7.1 | Toast notifications |
| next-themes | 0.4.6 | Theme switching |
