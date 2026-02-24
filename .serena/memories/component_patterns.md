# Siza Component Patterns

## Button
### Variants
- **Primary**: `bg-brand hover:bg-brand-light active:bg-brand-dark text-white font-medium`
- **Secondary**: `bg-transparent border border-surface-3 hover:border-brand/50 text-text-secondary hover:text-text-primary`
- **Ghost**: `bg-transparent hover:bg-surface-2 text-text-secondary hover:text-text-primary`
- **Destructive**: `bg-transparent border border-error/30 hover:bg-error/10 hover:border-error/60 text-error`

### Sizes
| Size | Height | Padding | Font | Radius |
|------|--------|---------|------|--------|
| sm | h-8 | px-3 | 13px | rounded-md |
| md | h-9 | px-4 | text-sm (14px) | rounded-md |
| lg | h-11 | px-5 | 15px | rounded-md |

All buttons: `transition-all duration-150 ease-siza focus-visible:outline-none focus-visible:shadow-glow-focus`

## Input
```
h-9 px-3 bg-surface-1 border border-surface-3
text-sm text-text-primary placeholder:text-text-muted rounded-md
hover:border-surface-4
focus:outline-none focus:border-brand focus:shadow-glow-focus
transition-all duration-150 ease-siza
```

## Card
### Default
`bg-surface-1 border border-surface-3 rounded-xl p-6 shadow-card transition-all duration-200 ease-siza`

### Interactive (hover lift)
Add: `cursor-pointer hover:border-brand/35 hover:shadow-card-hover hover:-translate-y-0.5`
The `-translate-y-0.5` (2px) is the ONLY approved card lift value.

### Feature Card Pattern
Icon container: `w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center mb-4`
Icon: `w-5 h-5 text-brand strokeWidth={1.5}`
Title: `text-h4 text-text-primary mb-2`
Description: `text-body-sm text-text-secondary leading-relaxed`

## Badge
- **Default**: `px-2 py-0.5 rounded text-label bg-surface-3 text-text-secondary`
- **Brand**: `px-2 py-0.5 rounded text-label bg-brand/15 text-brand-light border border-brand/20`
- **Success**: `bg-success/10 text-success border border-success/20`
- **Error**: `bg-error/10 text-error border border-error/20`

## Sidebar Navigation
- Width: `w-60`, full height, `border-r border-surface-3 bg-surface-0`
- Logo area: `h-14 flex items-center px-4 border-b border-surface-3`
- Nav items: `px-3 py-2 rounded-lg text-sm font-medium gap-3`
- Active: `bg-brand/15 text-brand-light`
- Inactive: `text-text-secondary hover:text-text-primary hover:bg-surface-2`
- Icons: `w-4 h-4 strokeWidth={1.5}`

## Modal / Dialog
- Backdrop: `fixed inset-0 bg-black/60 backdrop-blur-sm z-50`
- Panel: `max-w-md bg-surface-1 border border-surface-3 rounded-2xl shadow-card p-6`
- Close button: `text-text-muted hover:text-text-primary`
- Actions: `flex justify-end gap-3`

## Code Block
- Container: `bg-surface-0 border border-surface-3 rounded-xl overflow-hidden`
- Header: `px-4 py-2 border-b border-surface-3 bg-surface-1` with lang label + copy button
- Code: `p-4 text-sm font-mono text-text-primary leading-relaxed`

## Loading States
- Spinner: `w-5 h-5 rounded-full border-2 border-surface-3 border-t-brand animate-spin`
- Skeleton: `bg-surface-2 rounded animate-pulse`
- Button loading: add spinner + "Generating..." text, `opacity-60 cursor-not-allowed`
