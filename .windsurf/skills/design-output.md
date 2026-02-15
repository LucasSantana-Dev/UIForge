---
description: Work with design output tools (prototypes, images, Figma). Use when editing prototype builder, image renderer, or Figma integration.
---

# Design Output (Prototypes, Images, Figma)

## When to use

- Editing `generate_prototype`, `generate_design_image`, or `figma_push_variables` tools
- Modifying `src/lib/prototype-builder.ts` or `src/lib/image-renderer.ts`
- Changing Figma API integration in `src/lib/figma-client.ts`
- Working with SVG/PNG generation via satori/resvg

## Structure

- **Prototype builder**: `src/lib/prototype-builder.ts` — HTML prototype assembly
- **Image renderer**: `src/lib/image-renderer.ts` — satori + resvg wrapper
- **Figma client**: `src/lib/figma-client.ts` — REST API (read + variables write)
- **Prototype shell**: `src/lib/templates/prototype-shell.ts` — base HTML template

## Prototype conventions

- Standalone HTML with embedded CSS/JS (no external deps except optional Tailwind CDN)
- Screen sections with `display:none` toggling for navigation
- Click/tap handlers for transitions (fade, slide, none)
- Responsive viewport meta for mobile preview
- Design context tokens applied as CSS custom properties

## Image generation conventions

- **Satori**: converts JSX layout → SVG. Supports subset of CSS (flexbox only, no grid).
- **Resvg**: rasterizes SVG → PNG. Returns base64-encoded content.
- Wireframe mode: grayscale boxes, placeholder text, simple outlines.
- Mockup mode: uses design context colors/fonts for high-fidelity look.
- Component preview: renders a single component with real styles.

## Figma API conventions

- `FIGMA_ACCESS_TOKEN` from env — never hardcode or log.
- Read: GET `/v1/files/:key/nodes` for design data.
- Write: POST `/v1/files/:key/variables` for design tokens (Variables API only).
- Figma REST API is read-only for design nodes — no creating frames/shapes.

## Testing

- `generate-prototype.unit.test.ts`: screen assembly, navigation, valid HTML
- `generate-image.unit.test.ts`: satori → valid SVG, PNG base64

## MCP tools for reference

- **Context7**: Satori, Resvg docs
- **Brave Search / Tavily**: Figma API reference, satori limitations
- **Sequential Thinking**: Complex prototype flow design
