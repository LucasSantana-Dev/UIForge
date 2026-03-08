---
name: siza-color-contrast-checker
description: Validate WCAG 2.1 AA/AAA color contrast ratios for text, UI components, and interactive elements
version: 1.0.0
author: Forge Space
tags: [accessibility, wcag, contrast, color, a11y, dark-mode, color-blindness]
---

# Siza Color Contrast Checker

## Overview
Deep-dive specialist for color contrast validation. Ensures all text, UI components, and interactive elements meet WCAG 2.1 AA and AAA contrast requirements. Covers dark mode, color blindness simulation, and semantic color token usage.

## Instructions

### Contrast Ratio Requirements

Apply these minimum contrast ratios to all generated UI:

#### Text Contrast (WCAG 1.4.3 / 1.4.6)
- Normal text (<18px or <14px bold): **4.5:1** minimum (AA), 7:1 for AAA
- Large text (≥18px or ≥14px bold): **3:1** minimum (AA), 4.5:1 for AAA
- Placeholder text: **4.5:1** — treat as normal text, not decorative
- Disabled text: exempt from contrast requirements but should still be readable

#### Non-text Contrast (WCAG 1.4.11)
- UI components (buttons, inputs, toggles): **3:1** against adjacent colors
- Focus indicators: **3:1** against both the component and surrounding background
- Graphical objects (icons, charts, data viz): **3:1** for meaningful content
- State indicators (selected, hover, active): must maintain contrast in all states

### Contrast Calculation

Use relative luminance formula:
```
L = 0.2126 * R + 0.7152 * G + 0.0722 * B
(where R, G, B are linearized: value <= 0.04045 ? value/12.92 : ((value+0.055)/1.055)^2.4)
Contrast ratio = (L1 + 0.05) / (L2 + 0.05) where L1 > L2
```

### Semantic Color Token Rules

When generating UI with design tokens:
- Never use raw hex/rgb values — use semantic tokens (text-foreground, bg-primary, etc.)
- Verify token pairs: `text-foreground` on `bg-background` must pass 4.5:1
- Verify interactive pairs: `text-primary-foreground` on `bg-primary` must pass 4.5:1
- Verify muted pairs: `text-muted-foreground` on `bg-muted` must pass 4.5:1
- Verify destructive pairs: `text-destructive-foreground` on `bg-destructive` must pass 3:1

### Dark Mode Contrast

Dark mode requires extra attention:
- Light text on dark backgrounds: prefer `hsl(0 0% 98%)` over pure white `#fff` to reduce glare
- Background layers: ensure sufficient contrast between card/surface and page background
- Shadows: avoid relying on box-shadow for visual separation (invisible in dark mode) — use borders
- Charts/data viz: test all series colors against dark background, not just light
- Images with transparency: verify text over transparent images in both modes

### Color Blindness Considerations

Generate UI that works across all vision types:
- **Never use color alone** to convey meaning (add icons, patterns, or text labels)
- Red/green pairs: avoid for success/error — use green+icon / red+icon, or blue/orange alternatives
- Link text: underline links instead of relying only on color difference
- Status indicators: combine color with shape (checkmark, X, warning triangle)
- Charts: use patterns, shapes, or direct labels alongside color coding

### Common Anti-Patterns

Reject these patterns in generated code:
- `text-gray-400` on `bg-white` — fails 4.5:1 (ratio ~2.7:1)
- `text-gray-500` on `bg-gray-100` — often fails (ratio varies, check specific values)
- Gradient backgrounds with text overlay — contrast varies across the gradient
- Semi-transparent overlays (`bg-black/50`) with white text — actual contrast depends on underlying content
- `opacity-50` on interactive elements — reduces effective contrast below requirements
- `text-white` on light brand colors (light blue, yellow, orange) — usually fails

### Validation Checklist

For every generated component, verify:
1. All text meets minimum contrast against its direct background
2. Interactive elements have 3:1 contrast in default, hover, focus, and active states
3. Focus indicators are visible (not just outline-none with custom focus)
4. Error/success states use both color AND icon/text
5. Disabled states are visually distinct without relying solely on contrast reduction
6. Dark mode variants maintain all contrast requirements
7. Brand colors used for text pass contrast checks (common failure point)

## Examples

**Prompt**: "Create a notification banner with success, warning, and error variants"

**Expected output patterns**:
- Each variant uses an icon alongside the color indicator
- Text contrast verified against the colored background
- Close button has sufficient contrast in all variants
- Border or strong background difference for color-blind users

**Prompt**: "Build a data table with row selection"

**Expected output patterns**:
- Selected row uses background color change PLUS a checkbox indicator
- Hover state maintains text readability
- Alternating row colors (if used) both pass contrast with text
- Sort indicators use arrows, not just color

## Quality Rules

1. Every foreground/background color pair must meet WCAG 2.1 AA contrast minimums
2. No color used as the sole means of conveying information
3. All interactive states (hover, focus, active, disabled) maintain contrast
4. Dark mode implementations verified separately from light mode
5. Semantic color tokens used instead of raw color values
6. Focus indicators visible with at least 3:1 contrast
7. Charts and data visualizations labeled, not color-only
8. Semi-transparent overlays calculated for worst-case underlying content
