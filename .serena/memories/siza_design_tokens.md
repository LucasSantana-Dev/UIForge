# Siza Design Tokens

## Theme Strategy
- **Dark-only theme** - No light mode support
- Applied via `html` class: `<html class="dark">`

## Brand Colors
- **Primary Brand**: #7C3AED (violet-600)
- **Accent**: #6366F1 (indigo-500)
- **Success**: #10B981 (emerald-500)
- **Warning**: #F59E0B (amber-500)
- **Error**: #EF4444 (red-500)

## Surface Scale (Backgrounds)
- `surface-0`: #121214 (darkest - base)
- `surface-1`: #1C1C1F (cards)
- `surface-2`: #27272A (elevated cards)
- `surface-3`: #323238 (hover states)
- `surface-4`: #3F3F46 (active states)

## Text Scale
- `text-primary`: #FAFAFA (high emphasis)
- `text-secondary`: #A1A1AA (medium emphasis)
- `text-muted`: #71717A (low emphasis)
- `text-disabled`: #52525B (disabled states)

## Typography
- **Body**: Inter (system font stack fallback)
- **Display/Headings**: Outfit (geometric sans)
- **Code/Monospace**: JetBrains Mono

## Siza Mesh Background
Custom 5-layer radial gradient mesh:
- Violet (#7C3AED) at 15% opacity
- Indigo (#6366F1) at 12% opacity
- Purple (#A855F7) at 10% opacity
- Blue (#3B82F6) at 8% opacity
- Cyan (#06B6D4) at 6% opacity

**Animation**: `drift` keyframe - 20s ease-in-out infinite alternate

## Custom Easing
- **Reveal/Entry**: cubic-bezier(0.16, 1, 0.3, 1)
- **Exit**: cubic-bezier(0.4, 0, 1, 1)

## Spacing Scale
Tailwind default scale (0.25rem base unit)
