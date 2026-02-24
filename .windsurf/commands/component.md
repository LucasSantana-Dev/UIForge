# Generate Component

Generate a new React component for Siza with proper TypeScript, styling, and testing.

## Framework Options:
- react - React 19 with TypeScript
- vue - Vue 3 with Composition API  
- angular - Angular with standalone components
- svelte - Svelte with TypeScript

## Usage:
/component Button "A blue button with hover effects" react
/component Modal "Dialog modal with overlay" vue
/component Form "Contact form with validation" angular

## Generated Files:
- Component file with TypeScript
- Story file for documentation
- Test file with Jest/Testing Library
- CSS module with Tailwind classes
- Export in index file

## Quality Standards:
- Follow Siza design system (dark theme, purple primary)
- Use shadcn/ui components when applicable
- Include proper TypeScript interfaces
- Add accessibility attributes
- Include error boundaries
- Follow component naming conventions

## Design System:
- Primary: hsl(262, 70%, 60%) (purple)
- Background: hsl(240, 8%, 10%) (dark gray)
- Components: Import from @/components/ui/
- Icons: Use Lucide React
- Utilities: Use cn() from @/lib/utils

Current project: Siza web application
