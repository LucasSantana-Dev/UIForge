# Siza Animation System

## Philosophy
Move with purpose. Every transition communicates state relationships. Nothing animates for decoration. The Siza motion signature is a spring curve — fast entry, gentle overshoot, natural settle.

## Easing Tokens
| Token | Value | Use |
|-------|-------|-----|
| `ease-siza` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entry — modals, drawers, card hover lift (200-400ms) |
| `ease-siza-sharp` | `cubic-bezier(0.23, 1, 0.32, 1)` | Exit — quick removal (150ms) |
| `ease-siza-soft` | `cubic-bezier(0.4, 0, 0.2, 1)` | Color/opacity transitions (100-200ms) |

## Duration Tokens
| Token | Value | Use |
|-------|-------|-----|
| fast | 100ms | Micro-interactions (button press, checkbox) |
| normal | 200ms | Hover, focus, reveal |
| slow | 300ms | Panel slides, modals entering |
| slower | 400ms | Complex entrances, page transitions |
| ambient | 75s | Background animations — imperceptible drift |

## Keyframes
```css
@keyframes siza-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes siza-scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes siza-slide-in-right {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes siza-pulse-glow {
  0%, 100% { box-shadow: 0 0 24px rgba(124,58,237,0.3); }
  50%      { box-shadow: 0 0 40px rgba(124,58,237,0.5); }
}
```

## Tailwind Animation Utilities
```js
animation: {
  'fade-in':        'siza-fade-in 0.3s ease-siza forwards',
  'fade-out':       'siza-fade-out 0.2s ease-siza-sharp forwards',
  'slide-in-right': 'siza-slide-in-right 0.3s ease-siza forwards',
  'scale-in':       'siza-scale-in 0.2s ease-siza forwards',
  'pulse-glow':     'siza-pulse-glow 3s ease-in-out infinite',
}
```

## 5-Layer Animated Background
```
L1 (base):  solid #121214 — the material
L2:         central radial glow — rgba(124,58,237,0.08) fading to transparent
L3:         conic-gradient mesh — brand 6% / indigo 4%, rotating 75s+
L4:         CSS dot grid — radial-gradient dots, 24px spacing, rgba(250,250,250,0.035)
L5 (top):   Canvas particle field — 60 particles
```

### Canvas Particles
- Count: 60
- Color: `rgba(124, 58, 237, opacity)` where opacity 0.05-0.35
- Velocity: 0.15 px/frame per axis
- Size: 1px radius
- Wrapping: modulo screen dimensions

## Motion Rules
1. **Respect `prefers-reduced-motion`** — all animations off
2. **Never animate layout props** (width, height, margin, padding) — transform + opacity only
3. **Background ≥75s duration**, <10% opacity changes
4. **Page transitions**: fade + slight translateY, never slide entire content
5. **Exits faster than entrances** — sharp curve, shorter duration
6. **Card hover lift**: `-translate-y-0.5` (2px) ONLY — no other value
