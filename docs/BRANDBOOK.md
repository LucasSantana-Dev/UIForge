# Siza Brandbook

## 1. Strategy & Distinctiveness

### Positioning

**"The Digital Forge"** — Siza is where raw ideas are forged into production-ready interfaces.

Not a toy (Lovable), not a blank canvas (v0), not just speed (Bolt). It's a craftsman's precision tool.

### Voice & Tone

Confident, direct, precise. Like a master craftsman — few words, high impact. Technical authority without arrogance.

- **Do**: "Generate production-ready components" / "Forge your interface"
- **Don't**: "Easily create beautiful UIs!" / "Let AI do the magic for you!"

### Visual Differentiation

| Aspect | v0 | Bolt | Lovable | **Siza** |
|--------|-----|------|---------|-------------|
| Colors | B/W mono | Green #32BB78 | Orange→purple gradient | **Violet + Teal (separate)** |
| Logo | Simple text | Lightning bolt | Heart gradient | **Geometric anvil** |
| Mood | Cold, functional | Energetic, bold | Warm, playful | **Premium, precise, crafted** |
| Illustration | None | 3D colorful | Grain textures | **Semi-flat geometric with sparks** |

### Core Visual Concept

The digital forge — the transformation process. Raw material (text prompt) enters the forge (Siza AI), is heated (processing), hammered with precision (generation) and emerges as a finished piece (production-ready UI component).

The metaphor manifests in:

- Solid geometric forms (anvil, blocks)
- Cyan/teal sparks as decorative element (the spark of creation)
- Depth without excess (elevated surfaces = forge layers)

---

## 2. Logo (Symbol + Wordmark)

### Symbol — Minimalist Geometric Anvil

- Based on the classic anvil silhouette, simplified into pure geometric forms
- Built with 90° angles and consistent rounded corners (border-radius)
- Front/side view: inverted "T" shape with widened base
- Stroke weight: 2–3px at standard size (32px), uniform stroke
- Proportion: width ~1.2× height (slightly landscape)
- Works as favicon at 16×16, 32×32, and 64×64
- Dark background: stroke in Forge Violet (#7C3AED) or white
- Light background: stroke in Forge Deep (#0F0D1A) or Forge Violet

### Wordmark

- "Siza" set in **Space Grotesk Bold**
- Kerning: -0.02em (slightly tightened)
- "UI" in Medium weight (500), "Forge" in Bold (700) for subtle hierarchy
- Horizontal lockup (beside symbol) is primary; vertical lockup (above symbol) for square spaces

### Logo Versions

| Version | Use Case |
|---------|----------|
| **Full horizontal** | Symbol + "Siza" side by side — primary usage |
| **Full vertical** | Symbol above + "Siza" below — square layouts |
| **Symbol only** | Favicon, app icon, reduced spaces |
| **Wordmark only** | Contexts where logo is already recognized |

### Color Variants

| Context | Symbol | Wordmark |
|---------|--------|----------|
| Dark background | White or Forge Violet | White |
| Light background | Forge Deep | Forge Deep |
| Monochrome | All white or all dark | Same |

---

## 3. Color Palette

### Primary Colors

| Name | Hex | HSL | Role |
|------|-----|-----|------|
| **Forge Violet** | `#7C3AED` | 263° 84% 58% | Primary brand color. CTAs, links, focus rings, key highlights. |
| **Forge Teal** | `#14B8A6` | 173° 80% 40% | Secondary accent. Success states, badges, informational highlights. |
| **Forge Spark** | `#22D3EE` | 188° 85% 53% | Decorative highlight. Sparks, premium UI elements, notifications. |
| **Forge Deep** | `#0F0D1A` | 248° 33% 8% | Primary background. Dark mode base. Violet-tinted (never pure black). |
| **Forge Surface** | `#1A1830` | 247° 30% 14% | Elevated surfaces. Cards, panels, dropdowns, modals. |

### Neutrals

| Name | Hex | HSL | Role |
|------|-----|-----|------|
| **Forge White** | `#EDEDF2` | 240° 15% 94% | Primary text on dark. Cool-tinted for violet harmony. |
| **Forge Muted** | `#9292A8` | 240° 12% 62% | Secondary text. Placeholders, captions, metadata. |
| **Forge Black** | `#08080E` | 240° 30% 5% | Text on light backgrounds. Deep shadows. |

### State Colors

| State | Hex | Source |
|-------|-----|--------|
| Destructive | `#EF4444` | red-500 |
| Warning | `#F59E0B` | amber-500 |
| Success | `#14B8A6` | Forge Teal (reused) |
| Info | `#22D3EE` | Forge Spark (reused) |

### Usage Rules

1. **Forge Violet** is the hero color — never more than 20% of visual area
2. **Forge Teal** is accent — used sparingly to create contrast
3. **Forge Spark** is decorative — only in highlights, particles, and premium details
4. Background is always **Forge Deep** — never `#000000` pure black
5. Primary text is always **Forge White** — secondary text in **Forge Muted**

### WCAG Contrast Verification

| Combination | Ratio | Level |
|-------------|-------|-------|
| Forge White (#EDEDF2) on Forge Deep (#0F0D1A) | 16.5:1 | AAA |
| Forge White (#EDEDF2) on Forge Surface (#1A1830) | 14.8:1 | AAA |
| Forge Muted (#9292A8) on Forge Deep (#0F0D1A) | 6.3:1 | AA |
| Forge Violet (#7C3AED) on Forge Deep (#0F0D1A) | 3.4:1 | AA Large* |
| Forge Teal (#14B8A6) on Forge Deep (#0F0D1A) | 7.7:1 | AA |
| Forge Spark (#22D3EE) on Forge Deep (#0F0D1A) | 10.6:1 | AAA |

*Forge Violet passes AA for large text (≥18px or ≥14px bold). Use only for CTAs, links, headings, and interactive elements — never as body text on dark backgrounds.

---

## 4. Typography

### Font Stack

| Role | Font | Source | Weights |
|------|------|--------|---------|
| **Headings** | Space Grotesk | Google Fonts | Medium (500), SemiBold (600), Bold (700) |
| **Body** | Inter | Google Fonts | Regular (400), Medium (500) |
| **Code** | JetBrains Mono | Google Fonts | Regular (400) |

**Why Space Grotesk**: Geometric, slightly futuristic, "crafted" personality. Differentiates from Linear (Inter) and v0 (Geist/system).

**Why Inter for body**: Proven screen legibility, industry standard, already implemented in the codebase.

**Why JetBrains Mono**: Optimized for code, ligature support for operators (`=>` `->` `!==`).

### Type Scale

| Level | Font | Weight | Size | Line Height | Tracking |
|-------|------|--------|------|-------------|----------|
| Display | Space Grotesk | 700 | 48px / 3rem | 1.1 | -0.02em |
| H1 | Space Grotesk | 700 | 36px / 2.25rem | 1.2 | -0.02em |
| H2 | Space Grotesk | 700 | 30px / 1.875rem | 1.25 | -0.01em |
| H3 | Space Grotesk | 600 | 24px / 1.5rem | 1.3 | -0.01em |
| H4 | Space Grotesk | 500 | 20px / 1.25rem | 1.4 | 0 |
| Body | Inter | 400 | 16px / 1rem | 1.6 | 0 |
| Body Small | Inter | 400 | 14px / 0.875rem | 1.5 | 0.01em |
| Caption | Inter | 500 | 12px / 0.75rem | 1.4 | 0.02em |
| Code | JetBrains Mono | 400 | 14px / 0.875rem | 1.6 | 0 |

### CSS Implementation

```css
/* Space Grotesk settings */
font-feature-settings: "ss01";

/* JetBrains Mono settings */
font-variant-ligatures: common-ligatures;
```

---

## 5. Illustration & Imagery Style

### Style Definition

**Semi-flat geometric with light elements (sparks/particles)**

- Clean geometric forms, defined angles
- Palette restricted to brand colors (Violet, Teal, Spark + neutrals)
- Cyan spark/particle elements as recurring motif
- No complex textures; subtle violet→teal gradients when needed
- Depth created by opacity and layering, not realistic shadows
- Functional style: illustrations communicate, not decorate

### Lighting & Consistency

- **Light source**: top-left (45°), simulating forge heat
- **Shadows**: soft, directional, in Forge Deep at 30–50% opacity
- **Highlights**: Forge Spark (#22D3EE) as rim light / edge glow
- **Texture**: none (clean surfaces) or subtle 2–3% noise when needed

### Image Generation Prompts

#### Prompt 1 — Hero Section (Transformation)

```
Minimalist dark illustration of a geometric anvil in the center,
semi-transparent layers of code floating above it transforming into
clean UI components below. Cyan particle sparks emanating from the
point of contact. Color palette: deep violet (#7C3AED) anvil,
teal (#14B8A6) code fragments, cyan (#22D3EE) sparks, dark
background (#0F0D1A). Semi-flat style, no texture, clean vector
aesthetic. Top-left lighting, subtle violet-to-teal gradient glow.
16:9 aspect ratio, suitable for web hero section.
```

#### Prompt 2 — Feature: Multi-Framework

```
Minimalist isometric illustration showing five geometric shapes
(representing React, Vue, Angular, Svelte, HTML) being forged from
a single glowing source. Each shape has a distinct but harmonious
form. Connected by thin teal (#14B8A6) light streams. Cyan (#22D3EE)
spark particles where streams connect to shapes. Dark background
(#0F0D1A), violet (#7C3AED) central glow. Semi-flat geometric style,
clean lines, no photorealism. 4:3 aspect ratio.
```

#### Prompt 3 — Feature: Privacy/BYOK

```
Minimalist dark illustration of a geometric shield or vault with a
keyhole, surrounded by floating encrypted data blocks. The vault
glows with subtle violet (#7C3AED) energy. A teal (#14B8A6) key
floats nearby with cyan (#22D3EE) particle trails. Dark background
(#0F0D1A), clean geometric shapes, no ornamental detail. Semi-flat
style with subtle gradients. Square 1:1 aspect ratio for feature card.
```

#### Prompt 4 — About/Story (The Forge Process)

```
Four-panel horizontal illustration showing the forge process:
(1) Raw text/prompt as rough geometric ore, (2) The ore entering
a minimalist geometric forge with violet (#7C3AED) heat, (3) Being
shaped on a geometric anvil with teal (#14B8A6) precision lines,
(4) Emerging as a polished UI component with cyan (#22D3EE)
finishing sparks. Dark background (#0F0D1A), consistent semi-flat
geometric style across all panels. 21:9 ultra-wide aspect ratio.
```

#### Prompt 5 — Marketing/Social (Brand Mark)

```
Minimalist geometric anvil logo centered on dark background (#0F0D1A),
with subtle violet (#7C3AED) glow emanating from behind. Small
cyan (#22D3EE) spark particles floating upward from the anvil's
surface. Clean, vector-style rendering. No text, no additional
elements. Suitable for social media profile picture. Square 1:1,
high contrast, works at both large and small sizes.
```

---

## 6. Implementation Reference

### Files Modified

| File | Changes |
|------|---------|
| `apps/web/tailwind.config.ts` | Added `forge` color namespace with full brand palette |
| `apps/web/src/app/globals.css` | Updated CSS custom properties with brand-aligned HSL values |
| `apps/web/src/app/layout.tsx` | Added Space Grotesk + JetBrains Mono font imports |

### Tailwind Usage

```tsx
// Brand colors (direct)
<div className="bg-forge-deep text-forge-white" />
<button className="bg-forge-violet hover:bg-forge-violet/90" />
<span className="text-forge-teal" />
<div className="bg-forge-surface border-forge-violet/20" />

// Semantic colors (via CSS variables, shadcn pattern)
<div className="bg-background text-foreground" />
<button className="bg-primary text-primary-foreground" />
```

### CSS Variable Mapping

```
--primary        → Forge Violet (263° 84% 58%)
--secondary      → Forge Surface-derived
--accent         → Forge Teal-derived
--background     → Forge Deep (248° 33% 8%)
--card           → Forge Surface (247° 30% 14%)
--destructive    → Red (#EF4444)
--muted          → Forge Muted-derived
--foreground     → Forge White (240° 15% 94%)
```

### Font CSS Variables

```css
/* Available via Next.js font optimization */
var(--font-inter)         /* Body text */
var(--font-space-grotesk) /* Headings */
var(--font-jetbrains)     /* Code blocks */
```

### Logo Assets (Design Task)

The current logo files in `apps/web/public/` are embedded PNGs inside SVG wrappers. They need to be recreated as proper vector SVGs following the geometric anvil specification in Section 2. This is a design task — use the symbol description and proportions above to create:

- `logo-full-horizontal.svg` — Symbol + wordmark
- `logo-full-vertical.svg` — Stacked layout
- `logo-symbol.svg` — Anvil only
- `logo-wordmark.svg` — Text only
- `favicon.svg` — Optimized for small sizes
