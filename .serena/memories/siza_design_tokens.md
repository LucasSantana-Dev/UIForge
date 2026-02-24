# Siza Design Tokens v2.0

## Theme
Dark-only. No light mode. `<html class="dark">`.

## Surface Scale
```
--surface-0: #121214   /* Page background — deepest */
--surface-1: #1C1C1F   /* Card background */
--surface-2: #27272A   /* Elevated card / modal */
--surface-3: #3F3F46   /* Border / divider */
--surface-4: #52525B   /* Muted interactive surface */
```

## Brand Purple Scale
```
--brand:       #7C3AED   /* Primary — buttons, links, active */
--brand-light: #8B5CF6   /* Hover states */
--brand-dark:  #6D28D9   /* Active/pressed */
--brand-muted: #4C1D95   /* Subtle purple backgrounds */
--indigo:      #6366F1   /* Secondary actions, data viz */
```

## Text Scale
```
--text-primary:   #FAFAFA   /* Headings, primary body */
--text-secondary: #A1A1AA   /* Labels, descriptions */
--text-muted:     #71717A   /* Timestamps, metadata */
--text-brand:     #A78BFA   /* Links, brand text */
```

## Semantic Colors
```
--success: #10B981  --success-muted: #064E3B
--warning: #F59E0B  --warning-muted: #78350F
--error:   #EF4444  --error-muted:   #7F1D1D
--info:    #3B82F6  --info-muted:    #1E3A5F
```

## Typography Scale
| Role | Size | Weight | Tracking | Line-height |
|------|------|--------|----------|-------------|
| Hero | 64px/4rem | Outfit 700 | -0.03em | 1.05 |
| Display | 48px/3rem | Inter 700 | -0.03em | 1.1 |
| H1 | 36px/2.25rem | Inter 700 | -0.02em | 1.2 |
| H2 | 30px/1.875rem | Inter 600 | -0.02em | 1.25 |
| H3 | 24px/1.5rem | Inter 600 | -0.01em | 1.3 |
| H4 | 20px/1.25rem | Inter 600 | 0 | 1.35 |
| Body | 16px/1rem | Inter 400 | 0 | 1.6 |
| Body-sm | 14px/0.875rem | Inter 400 | 0 | 1.5 |
| Label | 12px/0.75rem | Inter 500 | +0.025em | 1.4 |
| Code | 14px/0.875rem | JetBrains Mono 400 | 0 | 1.6 |

Fonts: Inter (all UI), Outfit Bold 700 (hero headline + wordmark ONLY), JetBrains Mono (code).

## Shadow Tokens
```
--shadow-surface:    0 1px 0 0 rgba(255,255,255,0.04), 0 1px 3px rgba(0,0,0,0.4)
--shadow-card:       0 0 0 1px rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.3)
--shadow-card-hover: 0 0 0 1px rgba(124,58,237,0.35), 0 8px 32px rgba(124,58,237,0.12)
--shadow-glow-brand: 0 0 24px rgba(124,58,237,0.3)
--shadow-glow-subtle: 0 0 40px rgba(124,58,237,0.08)
--shadow-glow-focus: 0 0 0 3px rgba(124,58,237,0.2)
```

## Easing Tokens
```
--ease-siza:       cubic-bezier(0.16, 1, 0.3, 1)    /* Entry — spring */
--ease-siza-sharp: cubic-bezier(0.23, 1, 0.32, 1)   /* Exit — quick */
--ease-siza-soft:  cubic-bezier(0.4, 0, 0.2, 1)     /* Color/opacity */
```

## Duration Tokens
```
--duration-fast:    100ms   /* Micro-interactions */
--duration-normal:  200ms   /* Hover, focus, reveal */
--duration-slow:    300ms   /* Panel slides, modals */
--duration-slower:  400ms   /* Complex entrances */
--duration-ambient: 75s     /* Background drift */
```

## Border Radius Scale
```
--radius-sm:   4px    /* badges, tags */
--radius-md:   8px    /* buttons, inputs */
--radius-lg:   12px   /* cards, panels */
--radius-xl:   16px   /* large cards, modals */
--radius-2xl:  24px   /* hero elements */
--radius-full: 9999px /* pills, avatars */
```

## Background System (5 layers)
```
L1 (base):  solid #121214
L2:         radial glow — rgba(124,58,237,0.08) center, fading
L3:         conic-gradient mesh — brand/indigo at 6-4%, rotating 75s+
L4:         CSS dot grid — 24px spacing, 5% white opacity
L5 (top):   Canvas particles — 60 dots, purple rgba(124,58,237), velocity 0.15px/frame
```

## Color Rules
- 80% dark neutrals, 20% brand purple
- No gradients on text
- Purple borders only on interactive/focus
- Semantic colors for status only
