---
description: Work with React + Next.js + Tailwind frontends. Use when editing UI components, pages, hooks, or frontend tests.
---

# Frontend: React + Next.js + Tailwind

## When to use

- Creating or editing React components in `apps/web/src/components/`
- Working on Next.js App Router pages in `apps/web/src/app/`
- Modifying Zustand stores or TanStack Query hooks
- Writing or updating Jest unit tests for components
- Styling with Tailwind CSS + shadcn/ui

## Key directories

- `apps/web/src/app/` — App Router pages and layouts
- `apps/web/src/components/ui/` — shadcn/ui base components (don't modify directly)
- `apps/web/src/components/dashboard/` — Dashboard UI
- `apps/web/src/components/generator/` — AI generation UI (GeneratorForm, CodeEditor)
- `apps/web/src/components/templates/` — Template library UI
- `apps/web/src/components/ai-keys/` — BYOK key management UI
- `apps/web/src/hooks/` — Custom React hooks
- `apps/web/src/stores/` — Zustand global stores
- `apps/web/src/lib/` — Utilities, Supabase factories, helpers

## Design system

- **Theme**: Dark mode only. `dark` class forced on `<html>`. No light mode.
- **Background**: `hsl(240, 8%, 10%)` — dark gray (not pure black)
- **Primary**: `hsl(262, 70%, 60%)` — desaturated purple
- **Colors**: defined in `globals.css` `:root` only — no `.dark` selector
- **Components**: shadcn/ui — import from `@/components/ui/<name>`
- **Icons**: Lucide React — `import { IconName } from 'lucide-react'`
- **Utility**: `cn()` from `@/lib/utils` for conditional class merging

## Component pattern

```tsx
interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          Action
        </Button>
      )}
    </div>
  );
}
```

## State pattern

- Global: Zustand store in `src/stores/`
- Server: TanStack Query hook in `src/hooks/`
- Local: `useState` for UI-only state

## Testing

- Unit tests: `apps/web/src/__tests__/` with Jest + React Testing Library
- E2E tests: `apps/web/e2e/` with Playwright
- Run: `npm run test` (unit), `npm run test:e2e` (E2E)

## MCP tools for reference

- **Context7**: Next.js 16, React 18, Tailwind CSS, shadcn/ui, Zustand, TanStack Query docs
- **Brave Search / Exa**: shadcn/ui component examples, Tailwind utilities
