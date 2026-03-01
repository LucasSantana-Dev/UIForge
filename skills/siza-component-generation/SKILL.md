---
name: siza-component-generation
description: Generate production-ready UI components with accessibility, responsive design, and quality gates
version: 1.0.0
author: Forge Space
tags: [ui, components, accessibility, responsive, typescript, react, vue, angular, svelte]
---

# Siza Component Generation

## Overview
Generate production-ready UI components that meet enterprise quality standards. This skill encodes best practices for component architecture, accessibility, responsive design, and framework-specific patterns.

## Instructions

### Component Structure

When generating any UI component:

1. **Props/Interface Definition**
   - Define TypeScript interfaces for all props
   - Use discriminated unions for variant-based props
   - Include JSDoc comments for complex props
   - Provide sensible defaults for optional props
   - Example:
     ```typescript
     interface ButtonProps {
       /** Visual style variant */
       variant: 'primary' | 'secondary' | 'ghost' | 'danger';
       /** Size preset */
       size?: 'sm' | 'md' | 'lg';
       /** Disabled state */
       disabled?: boolean;
       /** Loading state with spinner */
       loading?: boolean;
       /** Full width button */
       fullWidth?: boolean;
       /** Icon to display (before text) */
       icon?: React.ReactNode;
       /** Click handler */
       onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
       children: React.ReactNode;
     }
     ```

2. **Semantic HTML**
   - Use correct semantic elements (`<button>` not `<div>` for clickable actions)
   - Use `<nav>` for navigation, `<article>` for content, `<section>` for grouping
   - Avoid div soup - each element should have semantic purpose
   - Use heading hierarchy correctly (h1 → h2 → h3, no skipping levels)

3. **Accessibility (ARIA)**
   - Add ARIA labels when visual text is insufficient: `aria-label="Close dialog"`
   - Use `aria-describedby` to associate help text with inputs
   - Implement `aria-expanded`, `aria-controls` for disclosure widgets
   - Add `aria-live` regions for dynamic content updates
   - Use `aria-current="page"` for current navigation item
   - Implement proper focus management with `useRef` and `.focus()`
   - Example dropdown:
     ```typescript
     <button
       aria-expanded={isOpen}
       aria-controls="menu-list"
       aria-haspopup="true"
       onClick={toggle}
     >
       Menu
     </button>
     <ul id="menu-list" role="menu" hidden={!isOpen}>
       <li role="menuitem">Item 1</li>
     </ul>
     ```

4. **Keyboard Navigation**
   - All interactive elements must be keyboard accessible
   - Implement arrow key navigation for lists/menus
   - Use Tab/Shift+Tab for focus traversal
   - Escape key to close modals/dropdowns
   - Enter/Space to activate buttons/checkboxes
   - Home/End for first/last item in lists
   - Example keyboard handler:
     ```typescript
     const handleKeyDown = (e: KeyboardEvent) => {
       switch (e.key) {
         case 'Escape':
           closeModal();
           break;
         case 'ArrowDown':
           e.preventDefault();
           focusNextItem();
           break;
         case 'ArrowUp':
           e.preventDefault();
           focusPreviousItem();
           break;
       }
     };
     ```

5. **Focus Management**
   - Trap focus inside modals/dialogs
   - Restore focus to trigger element when closing
   - Provide visible focus indicators (never `outline: none` without replacement)
   - Use `:focus-visible` for keyboard-only focus styles
   - Example focus trap:
     ```typescript
     useEffect(() => {
       if (!isOpen) return;
       const focusableElements = modalRef.current?.querySelectorAll(
         'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
       );
       const firstElement = focusableElements?.[0] as HTMLElement;
       const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

       const trapFocus = (e: KeyboardEvent) => {
         if (e.key !== 'Tab') return;
         if (e.shiftKey && document.activeElement === firstElement) {
           e.preventDefault();
           lastElement?.focus();
         } else if (!e.shiftKey && document.activeElement === lastElement) {
           e.preventDefault();
           firstElement?.focus();
         }
       };

       document.addEventListener('keydown', trapFocus);
       firstElement?.focus();
       return () => document.removeEventListener('keydown', trapFocus);
     }, [isOpen]);
     ```

6. **Responsive Design**
   - Use CSS custom properties for theming and spacing
   - Implement responsive breakpoints: `sm: 640px, md: 768px, lg: 1024px, xl: 1280px`
   - Use fluid typography: `clamp(1rem, 2vw, 1.5rem)`
   - Prefer CSS Grid for 2D layouts, Flexbox for 1D
   - Use container queries when appropriate
   - Test at mobile (375px), tablet (768px), desktop (1440px)
   - Example responsive card:
     ```css
     .card {
       display: grid;
       grid-template-columns: 1fr;
       gap: 1rem;
     }
     @media (min-width: 768px) {
       .card {
         grid-template-columns: 200px 1fr;
         gap: 2rem;
       }
     }
     ```

7. **State Management**
   - Use local state (`useState`) for UI-only state
   - Lift state up when shared between siblings
   - Use context for deep prop drilling (theme, auth)
   - Implement controlled vs uncontrolled pattern based on use case
   - Provide both controlled and uncontrolled APIs when possible
   - Example controlled input:
     ```typescript
     interface InputProps {
       value?: string; // Controlled
       defaultValue?: string; // Uncontrolled
       onChange?: (value: string) => void;
     }

     const Input = ({ value: controlledValue, defaultValue, onChange }: InputProps) => {
       const [internalValue, setInternalValue] = useState(defaultValue ?? '');
       const isControlled = controlledValue !== undefined;
       const value = isControlled ? controlledValue : internalValue;

       const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
         if (!isControlled) setInternalValue(e.target.value);
         onChange?.(e.target.value);
       };

       return <input value={value} onChange={handleChange} />;
     };
     ```

8. **Event Handling**
   - Use TypeScript event types: `React.MouseEvent`, `React.KeyboardEvent`
   - Prevent default when necessary: `e.preventDefault()`
   - Stop propagation carefully (usually avoid it)
   - Debounce expensive operations (search, validation)
   - Use passive event listeners for scroll/touch when possible

### Framework-Specific Patterns

#### React
- Use functional components with hooks
- Memoize expensive computations with `useMemo`
- Memoize callbacks with `useCallback` when passing to children
- Use `React.memo()` for expensive pure components
- Implement error boundaries for component tree errors
- Use portals for modals/tooltips: `ReactDOM.createPortal()`

#### Vue
- Use Composition API (`<script setup>`)
- Define props with `defineProps<PropsInterface>()`
- Emit events with `defineEmits<{(e: 'update', value: string): void}>()`
- Use `computed()` for derived state
- Use `watch()` for side effects
- Provide/inject for dependency injection

#### Angular
- Use standalone components (no NgModule)
- Define inputs with `@Input()` decorator
- Define outputs with `@Output() EventEmitter`
- Use signals for reactive state
- Implement `OnPush` change detection when possible
- Use `@ViewChild` for template refs

#### Svelte
- Use `<script lang="ts">` for TypeScript
- Define props with `export let propName: Type`
- Use reactive declarations: `$: doubled = count * 2`
- Bind values with `bind:value={variable}`
- Dispatch events with `createEventDispatcher()`
- Use stores for shared state

### Quality Gates

Before considering a component complete, verify:

1. **No Inline Styles**
   - All styles in CSS modules, styled-components, or Tailwind classes
   - Exception: dynamic values (colors, transforms) can use CSS variables

2. **TypeScript Strict Mode**
   - No `any` types (use `unknown` and type guards)
   - All props interfaces exported
   - Return types declared for complex functions

3. **Accessibility Checklist**
   - [ ] Color contrast >= 4.5:1 for text, 3:1 for UI elements
   - [ ] All interactive elements keyboard accessible
   - [ ] Focus visible and well-managed
   - [ ] Screen reader tested (or ARIA attributes validated)
   - [ ] No reliance on color alone for information

4. **Performance**
   - Avoid unnecessary re-renders
   - Lazy load heavy components
   - Virtualize long lists (>100 items)
   - Optimize images (WebP, lazy loading, responsive srcset)

5. **Error Handling**
   - Handle loading states
   - Handle error states with retry option
   - Handle empty states with helpful message
   - Validate user input before submission

## Examples

### Example 1: Accessible Button Component

**Prompt:** "Create a reusable button component with variants and loading state"

**Expected Output:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  onClick,
  children,
  type = 'button',
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`button button--${variant} button--${size} ${fullWidth ? 'button--full' : ''}`}
    >
      {loading && <span className="spinner" aria-hidden="true" />}
      {!loading && icon && <span className="button__icon">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
```

### Example 2: Accessible Modal

**Prompt:** "Create a modal dialog component with focus trap"

**Expected Output:** Modal with portal rendering, focus trap, Escape key handling, backdrop click, and proper ARIA attributes.

### Example 3: Responsive Card Grid

**Prompt:** "Create a responsive card grid that shows 1 column on mobile, 2 on tablet, 3 on desktop"

**Expected Output:** CSS Grid layout with media queries and gap spacing that scales with viewport.

## Common Component Patterns

### Button
- Variants: primary, secondary, ghost, danger, link
- States: default, hover, active, focus, disabled, loading
- Sizes: sm, md, lg
- Icons: leading, trailing, icon-only

### Input
- Types: text, email, password, number, tel, url, search
- States: default, focus, error, disabled, readonly
- Features: prefix/suffix icons, character count, validation message

### Card
- Structure: header, media, content, footer
- Variants: elevated, outlined, filled
- Interactive: hover effects, clickable cards with proper semantics

### Modal/Dialog
- Structure: backdrop, container, header, content, footer
- Focus trap, Escape to close, click outside to close
- Scroll lock on body when open
- Return focus to trigger on close

### Dropdown/Select
- Keyboard navigation (arrow keys, type-ahead)
- Multi-select with checkboxes
- Search/filter for long lists
- Loading state for async options
- Proper ARIA roles (listbox, option)

### Tabs
- Keyboard navigation (arrow keys, Home/End)
- Proper ARIA roles (tablist, tab, tabpanel)
- URL sync for shareable state
- Lazy loading tab content

### Tooltip
- Hover and focus triggers
- Proper positioning (top, bottom, left, right)
- Auto-flip when near viewport edge
- Accessible description with `aria-describedby`

## Quality Rules

1. **All components must be keyboard navigable** - Test every interactive element with Tab, Enter, Space, Escape, Arrow keys
2. **No div buttons** - Use `<button>` for actions, `<a>` for navigation
3. **Color contrast must meet WCAG AA** - 4.5:1 for text, 3:1 for UI components
4. **Loading states must be indicated** - Visual spinner + `aria-busy="true"`
5. **Error states must be associated** - Use `aria-describedby` to link error messages to inputs
6. **Focus must be visible** - Custom `:focus-visible` styles, never just `outline: none`
7. **Mobile-first responsive** - Start with mobile styles, add complexity at larger breakpoints
8. **TypeScript strict mode** - No `any`, all props typed, return types for complex functions
9. **Semantic HTML first** - Use the right element for the job, add ARIA only when necessary
10. **Test with screen reader** - Or at minimum, validate ARIA attributes match expected patterns
