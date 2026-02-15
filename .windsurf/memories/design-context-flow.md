# Design Context Flow

## Overview

The `DesignContextStore` is the session-scoped singleton that holds the current design state (`IDesignContext`). It's the central coordination point between tools.

## Data flow

```text
[Context tools] → update store → [Design/Code tools] → read store → [Output]

fetch_design_inspiration  ─┐
figma_context_parser       ─┤→ designContextStore.update()
generate_ui_component      ─┘   (style audit step)

generate_ui_component      ─┐
generate_prototype         ─┤→ designContextStore.get()
generate_design_image      ─┘

application://current-styles → designContextStore.get() → JSON response
```

## IDesignContext shape

- `typography`: fontFamily, headingFont, fontSize scale, fontWeight, lineHeight
- `colorPalette`: primary, secondary, accent, background, foreground, muted, border, destructive (with foreground variants)
- `spacing`: unit (px), scale array
- `borderRadius`: sm, md, lg, full
- `shadows`: sm, md, lg
- `iconSet`: optional icon library name
- `animationLib`: optional animation library name
- `buttonVariants`: optional array of button style variants

## Rules

- Always use `structuredClone` when reading/writing context (prevent mutation)
- Default context provides sensible Inter/Tailwind-like defaults
- Tools may accept an optional `design_context` input to override the store
- The `current-styles` resource is read-only for the AI agent
