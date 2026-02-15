---
description: Work with code generation templates (React, Next.js, Vue, Angular). Use when editing template functions or scaffold output.
---

# Code Generation Templates

## When to use

- Editing `src/lib/templates/` — framework template functions
- Modifying `scaffold_full_application` or `generate_ui_component` tools
- Adding support for new frameworks or component types
- Changing Shadcn/ui setup for React/Next.js templates

## Structure

- **Templates**: `src/lib/templates/`
  - `react.ts` — React + Tailwind + Shadcn/ui
  - `nextjs.ts` — Next.js App Router + Tailwind + Shadcn/ui
  - `vue.ts` — Vue 3 Composition API + Pinia
  - `angular.ts` — Angular standalone components + Signals
  - `prototype-shell.ts` — Base HTML shell for prototypes
- **Style audit**: `src/lib/style-audit.ts` — Tailwind config + CSS vars parser
- **Tailwind mapper**: `src/lib/tailwind-mapper.ts` — Figma props → Tailwind utilities

## Conventions

- Templates are pure functions: `(config) => IGeneratedFile[]`
- No side effects, no I/O, no external template engines
- All file content is generated as strings in-memory
- React/Next.js: include full Shadcn/ui setup (components.json, `cn` utility, Button/Input/Card)
- Vue: Composition API `<script setup>`, Pinia store
- Angular: standalone components, Signals service
- Use `IDesignContext` for style tokens in generated code

## Testing

- `scaffold.unit.test.ts`: each framework → expected file structure
- `generate-component.unit.test.ts`: style audit integration, component output
- `style-audit.unit.test.ts`: Tailwind config parsing
- `tailwind-mapper.unit.test.ts`: Figma props → Tailwind classes

## MCP tools for reference

- **Context7**: React, Next.js, Vue, Angular, Tailwind docs
- **v0**: UI component ideas (adapt to repo patterns)
