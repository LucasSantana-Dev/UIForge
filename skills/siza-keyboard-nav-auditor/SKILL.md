---
name: siza-keyboard-nav-auditor
description: Audit and enforce keyboard navigation patterns including tab order, focus management, and keyboard traps
version: 1.0.0
author: Forge Space
tags: [accessibility, keyboard, focus, tab-order, a11y, navigation, wcag]
---

# Siza Keyboard Navigation Auditor

## Overview
Specialist skill for keyboard navigation and focus management. Ensures all interactive elements are keyboard accessible, tab order is logical, focus traps work correctly in modals, and custom keyboard shortcuts follow platform conventions.

## Instructions

### Core Keyboard Requirements (WCAG 2.1.1 / 2.1.2)

Every interactive element must be:
- **Focusable** via Tab key (or arrow keys for composite widgets)
- **Activatable** via Enter and/or Space
- **Escapable** — no keyboard traps (Escape dismisses overlays)
- **Visible** — focus indicator clearly shows current position

### Tab Order Rules

Generate components with correct tab order:

#### Natural Tab Order
- Use semantic HTML elements (`<button>`, `<a>`, `<input>`) — they are focusable by default
- Never use `<div onClick>` or `<span onClick>` for interactive elements
- Avoid `tabindex` values > 0 — they break natural document order
- `tabindex="0"` only for custom interactive elements (custom dropdowns, etc.)
- `tabindex="-1"` for programmatically focused elements (modal containers, error summaries)

#### Visual vs DOM Order
- Tab order must match visual layout (left-to-right, top-to-bottom for LTR)
- CSS `order`, `flex-direction: row-reverse`, and `grid` reordering can break tab order
- If visual order differs from DOM order, restructure the DOM, don't use `tabindex`

### Focus Management Patterns

#### Modal/Dialog Focus
```
1. On open: move focus to first focusable element inside modal
2. Trap focus: Tab/Shift+Tab cycles within modal only
3. On close: return focus to the element that opened the modal
4. Escape key: closes the modal
```

Implementation:
- Use `<dialog>` element or `role="dialog"` with `aria-modal="true"`
- `inert` attribute on background content (preferred over manual focus trap)
- Store `document.activeElement` before opening, restore on close

#### Dropdown/Menu Focus
```
1. Enter/Space/ArrowDown on trigger: opens menu, focuses first item
2. ArrowDown/ArrowUp: moves between items
3. Home/End: jumps to first/last item
4. Type-ahead: focuses matching item by first letter
5. Escape: closes menu, returns focus to trigger
6. Tab: closes menu and moves to next focusable element
```

#### Tab Panel Focus
```
1. Tab to tab list: focuses the active tab
2. ArrowLeft/ArrowRight: moves between tabs (activate on focus or on Enter)
3. Home/End: first/last tab
4. Tab from tab list: moves to the active panel content
```

#### Accordion Focus
```
1. Tab: moves between accordion headers
2. Enter/Space: toggles section open/closed
3. ArrowDown/ArrowUp: moves between headers
4. Home/End: first/last header
```

#### Combobox/Autocomplete Focus
```
1. Type in input: opens suggestion list
2. ArrowDown: moves into suggestions
3. ArrowUp/ArrowDown: navigates suggestions
4. Enter: selects highlighted suggestion
5. Escape: closes list, keeps input value
```

### Focus Indicator Requirements

Every focusable element needs a visible focus indicator:
- Minimum: 2px solid outline with 3:1 contrast against adjacent colors
- Preferred: `outline: 2px solid currentColor; outline-offset: 2px;`
- Never use `outline: none` without a replacement focus style
- `:focus-visible` preferred over `:focus` (avoids showing on mouse click)
- Custom focus styles must be at least as visible as browser defaults

### Keyboard Shortcut Rules (WCAG 2.1.4)

If adding keyboard shortcuts:
- Single-character shortcuts must be re-mappable or only active when component is focused
- Use modifier keys (Ctrl/Cmd + key) for global shortcuts
- Follow platform conventions: Cmd+S (save), Cmd+Z (undo), Escape (close/cancel)
- Document all shortcuts in a discoverable location (help dialog, tooltip)
- Never override browser defaults (Ctrl+C, Ctrl+V, Ctrl+T, etc.)

### Skip Navigation

For page-level components:
- Include a "Skip to main content" link as the first focusable element
- Link target should be `<main id="main-content" tabindex="-1">`
- Skip link can be visually hidden until focused (sr-only + focus:not-sr-only)
- Consider additional skip links for repeated navigation blocks

### Common Anti-Patterns

Reject these patterns:
- `<div onClick={handler}>` — use `<button>` instead
- `<a>` without `href` — not focusable, use `<button>` for actions
- `tabIndex={5}` — arbitrary positive tabindex breaks natural order
- `outline: none` or `outline: 0` without replacement focus style
- Mouse-only interactions (drag-and-drop without keyboard alternative)
- Hover-only content (tooltips, menus) without keyboard trigger
- `onMouseDown` handlers that call `preventDefault()` (breaks focus)
- Custom scrollable regions without `tabindex="0"` and `role="region"`

### Validation Checklist

For every generated component, verify:
1. All interactive elements reachable via Tab key
2. Tab order matches visual layout
3. Custom widgets implement correct keyboard patterns (ARIA APG)
4. Focus is managed when content changes (modals, route transitions)
5. Focus indicator visible with 3:1 minimum contrast
6. No keyboard traps — Escape works on all overlays
7. Skip navigation available for page-level components
8. Keyboard shortcuts use modifier keys and don't override browser defaults
9. Hover interactions have keyboard equivalents
10. Scrollable regions are keyboard accessible

## Examples

**Prompt**: "Create a dropdown menu with nested submenus"

**Expected patterns**:
- ArrowRight opens submenu, ArrowLeft closes it
- First/last item wrapping with ArrowDown/ArrowUp
- Type-ahead focuses matching items
- Escape closes current level, returns focus to parent trigger

**Prompt**: "Build a kanban board with drag-and-drop"

**Expected patterns**:
- Keyboard alternative for drag: select card → use keyboard to move between columns
- Arrow keys navigate between cards within a column
- Enter/Space picks up a card, arrow keys move it, Enter drops it
- Screen reader announcements for card position changes

## Quality Rules

1. Zero `<div onClick>` or `<span onClick>` in generated code — use semantic elements
2. No positive `tabindex` values
3. All modals implement focus trap and restore focus on close
4. Focus indicators present on every interactive element
5. Keyboard patterns match ARIA Authoring Practices Guide (APG)
6. No mouse-only interactions without keyboard alternatives
7. Skip navigation for page-level layouts
8. Custom shortcuts documented and use modifier keys
