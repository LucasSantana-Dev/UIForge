---
name: siza-accessibility-audit
description: Audit UI components for WCAG 2.1 AA compliance with keyboard navigation, ARIA, and screen reader support
version: 1.0.0
author: Forge Space
tags: [accessibility, wcag, aria, keyboard, screen-reader, a11y, audit]
---

# Siza Accessibility Audit

## Overview
Perform comprehensive accessibility audits on UI components and pages to ensure WCAG 2.1 AA compliance. This skill encodes best practices for keyboard navigation, ARIA patterns, color contrast, screen reader support, and common accessibility anti-patterns to avoid.

## Instructions

### WCAG 2.1 AA Checklist

The Web Content Accessibility Guidelines (WCAG) 2.1 Level AA is the legal standard for most jurisdictions. Audit against these four principles:

#### 1. Perceivable - Information must be presentable to users in ways they can perceive

**1.1 Text Alternatives**
- [ ] All images have `alt` text describing their content/function
- [ ] Decorative images use `alt=""` or `role="presentation"`
- [ ] Complex images (charts, diagrams) have long descriptions via `aria-describedby`
- [ ] Form inputs have associated labels (not just placeholder)
- [ ] Icon-only buttons have `aria-label` or visible text

**1.2 Time-based Media**
- [ ] Videos have captions/subtitles
- [ ] Audio content has transcripts
- [ ] Auto-playing media can be paused

**1.3 Adaptable**
- [ ] Content order makes sense when CSS is disabled
- [ ] Forms use proper semantic HTML (`<label>`, `<fieldset>`, `<legend>`)
- [ ] Tables use `<th>` with `scope` attribute
- [ ] Lists use `<ul>`, `<ol>`, `<li>` elements
- [ ] Headings follow logical hierarchy (h1 → h2 → h3, no skipping)

**1.4 Distinguishable**
- [ ] Text contrast ≥ 4.5:1 for normal text (or ≥ 3:1 for large text ≥18px)
- [ ] UI components contrast ≥ 3:1 (buttons, borders, icons)
- [ ] Color is not the only means of conveying information
- [ ] Text can be resized to 200% without loss of content
- [ ] Images of text are avoided (use real text when possible)
- [ ] Focus indicators are visible (contrast ≥ 3:1 against background)

#### 2. Operable - User interface components must be operable

**2.1 Keyboard Accessible**
- [ ] All interactive elements are keyboard accessible (no mouse-only)
- [ ] Tab order follows visual order
- [ ] No keyboard traps (can tab in and out of all components)
- [ ] Custom widgets implement expected keyboard patterns
- [ ] Skip links provided for repetitive navigation

**2.2 Enough Time**
- [ ] Auto-updating content can be paused/stopped
- [ ] Session timeouts have warnings and extension option
- [ ] No time limits on reading/interaction (or can be extended)

**2.3 Seizures and Physical Reactions**
- [ ] No content flashes more than 3 times per second
- [ ] Animation can be disabled (respect `prefers-reduced-motion`)

**2.4 Navigable**
- [ ] Page has a unique, descriptive `<title>`
- [ ] Focus order is logical and intuitive
- [ ] Link text describes destination ("Read more about X" not "Click here")
- [ ] Multiple ways to find pages (navigation, search, sitemap)
- [ ] Headings and labels are descriptive
- [ ] Current focus is visible

**2.5 Input Modalities**
- [ ] All functionality works with pointer (mouse, touch, stylus)
- [ ] Dragging operations have keyboard alternative
- [ ] Click targets are at least 44×44px (or 24×24px with spacing)

#### 3. Understandable - Information and operation must be understandable

**3.1 Readable**
- [ ] Page language is declared (`<html lang="en">`)
- [ ] Language changes within page are marked (`<span lang="es">`)
- [ ] Unusual words/jargon have definitions or glossary
- [ ] Abbreviations/acronyms expanded on first use

**3.2 Predictable**
- [ ] Navigation is consistent across pages
- [ ] Components behave consistently
- [ ] Focus doesn't trigger unexpected context changes
- [ ] Input doesn't trigger unexpected context changes (without warning)

**3.3 Input Assistance**
- [ ] Form errors are identified and described
- [ ] Labels and instructions provided for user input
- [ ] Error suggestions provided when known
- [ ] Important actions are reversible or confirmable
- [ ] Form data can be reviewed before submission

#### 4. Robust - Content must be robust enough to work with assistive technologies

**4.1 Compatible**
- [ ] Valid HTML (no syntax errors that affect assistive tech)
- [ ] Elements have complete start/end tags
- [ ] IDs are unique on the page
- [ ] ARIA attributes are used correctly
- [ ] Status messages use `role="status"`, `role="alert"`, or `aria-live`

### Common ARIA Patterns and When to Use Them

ARIA (Accessible Rich Internet Applications) should only be used when native HTML is insufficient. First rule: **Use semantic HTML before adding ARIA**.

#### Button Pattern
```html
<!-- ✅ Good: Native button (preferred) -->
<button type="button" onclick="handleClick()">Click me</button>

<!-- ⚠️ Acceptable: When div is unavoidable (rare) -->
<div role="button" tabindex="0" onclick="handleClick()" onkeydown="handleKeyDown(event)">
  Click me
</div>
```

#### Link Pattern
```html
<!-- ✅ Good: Native link -->
<a href="/about">About us</a>

<!-- ✅ Good: Link with icon, text alternative -->
<a href="/profile" aria-label="View profile">
  <UserIcon aria-hidden="true" />
</a>
```

#### Disclosure (Show/Hide) Pattern
```html
<button
  aria-expanded={isOpen}
  aria-controls="content-id"
  onClick={() => setIsOpen(!isOpen)}
>
  {isOpen ? 'Hide' : 'Show'} details
</button>
<div id="content-id" hidden={!isOpen}>
  Hidden content revealed when expanded
</div>
```

#### Modal Dialog Pattern
```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Confirm delete</h2>
  <p id="dialog-description">Are you sure you want to delete this item?</p>
  <button onClick={handleConfirm}>Delete</button>
  <button onClick={handleCancel}>Cancel</button>
</div>
```

**Dialog requirements:**
- Focus trap (tab cycles within dialog)
- Escape key closes dialog
- Focus returns to trigger element on close
- Background content is inert (aria-hidden or pointer-events: none)

#### Combobox (Autocomplete) Pattern
```html
<label for="search-input">Search</label>
<input
  id="search-input"
  type="text"
  role="combobox"
  aria-expanded={isOpen}
  aria-controls="suggestions-list"
  aria-activedescendant={activeOptionId}
  aria-autocomplete="list"
  value={query}
  onChange={handleChange}
  onKeyDown={handleKeyDown}
/>
<ul id="suggestions-list" role="listbox" hidden={!isOpen}>
  {suggestions.map((item, i) => (
    <li key={item.id} role="option" id={`option-${i}`} aria-selected={i === activeIndex}>
      {item.label}
    </li>
  ))}
</ul>
```

**Combobox keyboard behavior:**
- ArrowDown: Focus first/next option
- ArrowUp: Focus previous option
- Enter: Select focused option
- Escape: Close suggestions, clear input

#### Tabs Pattern
```html
<div className="tabs">
  <div role="tablist" aria-label="Product information">
    <button
      role="tab"
      aria-selected={activeTab === 'description'}
      aria-controls="panel-description"
      id="tab-description"
      tabIndex={activeTab === 'description' ? 0 : -1}
      onClick={() => setActiveTab('description')}
    >
      Description
    </button>
    <button
      role="tab"
      aria-selected={activeTab === 'specs'}
      aria-controls="panel-specs"
      id="tab-specs"
      tabIndex={activeTab === 'specs' ? 0 : -1}
      onClick={() => setActiveTab('specs')}
    >
      Specifications
    </button>
  </div>

  <div
    role="tabpanel"
    id="panel-description"
    aria-labelledby="tab-description"
    hidden={activeTab !== 'description'}
  >
    Product description content
  </div>

  <div
    role="tabpanel"
    id="panel-specs"
    aria-labelledby="tab-specs"
    hidden={activeTab !== 'specs'}
  >
    Specifications content
  </div>
</div>
```

**Tabs keyboard behavior:**
- ArrowLeft/ArrowRight: Navigate between tabs
- Home: First tab
- End: Last tab
- Tab: Move focus into active panel

#### Menu/Dropdown Pattern
```html
<button
  aria-expanded={isOpen}
  aria-controls="menu-list"
  aria-haspopup="true"
  onClick={toggleMenu}
>
  Options
</button>

<ul id="menu-list" role="menu" hidden={!isOpen}>
  <li role="menuitem">
    <button onClick={handleEdit}>Edit</button>
  </li>
  <li role="menuitem">
    <button onClick={handleDelete}>Delete</button>
  </li>
</ul>
```

**Menu keyboard behavior:**
- ArrowDown/ArrowUp: Navigate items
- Home/End: First/last item
- Escape: Close menu
- Enter/Space: Activate item

#### Alert/Toast Pattern
```html
<!-- For important messages that require immediate attention -->
<div role="alert" className="toast toast--error">
  <p>Failed to save changes. Please try again.</p>
</div>

<!-- For status messages that don't require interruption -->
<div role="status" aria-live="polite" aria-atomic="true">
  <p>Loading data...</p>
</div>

<!-- For critical warnings -->
<div role="alert" aria-live="assertive">
  <p>Your session will expire in 2 minutes.</p>
</div>
```

**Live region politeness:**
- `aria-live="polite"` - Announced when screen reader is idle
- `aria-live="assertive"` - Announced immediately, interrupting current speech
- `role="alert"` - Implies `aria-live="assertive"`
- `role="status"` - Implies `aria-live="polite"`

### Keyboard Navigation Requirements

All interactive elements must be keyboard accessible. Test these patterns:

#### Tab Navigation
- **Tab** - Move to next focusable element
- **Shift+Tab** - Move to previous focusable element
- **Enter** - Activate buttons, links, submit forms
- **Space** - Activate buttons, toggle checkboxes

#### Arrow Key Navigation (for composite widgets)
- **Lists/Menus** - Up/Down arrows navigate items
- **Grids/Tables** - Arrow keys navigate cells
- **Tabs** - Left/Right arrows navigate tabs
- **Sliders** - Left/Right or Up/Down to adjust value

#### Special Keys
- **Escape** - Close modals, dropdowns, cancel operations
- **Home** - First item in list, beginning of line in input
- **End** - Last item in list, end of line in input
- **Page Up/Page Down** - Scroll or large increments

#### Focus Order
```typescript
// Ensure custom tab order matches visual order
<div>
  <button tabIndex={0}>First</button>
  <button tabIndex={0}>Second</button>
  <button tabIndex={-1}>Not in tab order</button>
  <a href="#skip" tabIndex={1}>Skip navigation</a> {/* Avoid tabIndex > 0 */}
</div>
```

**Best practices:**
- Use `tabIndex={0}` to add elements to natural tab order
- Use `tabIndex={-1}` to remove from tab order (but still focusable via JS)
- **Avoid `tabIndex > 0`** - Creates confusing tab order

### Focus Management Patterns

#### Focus Trap (Modal/Dialog)
```typescript
useEffect(() => {
  if (!isOpen) return;

  const focusableElements = modalRef.current?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements?.[0] as HTMLElement;
  const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  document.addEventListener('keydown', handleTabKey);
  firstElement?.focus();

  return () => document.removeEventListener('keydown', handleTabKey);
}, [isOpen]);
```

#### Focus Restoration
```typescript
// Save reference to trigger element
const triggerRef = useRef<HTMLElement | null>(null);

const openModal = (event: React.MouseEvent<HTMLButtonElement>) => {
  triggerRef.current = event.currentTarget;
  setIsOpen(true);
};

const closeModal = () => {
  setIsOpen(false);
  // Restore focus to trigger element
  triggerRef.current?.focus();
};
```

#### Skip Links
```html
<!-- First focusable element on page -->
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

<!-- CSS: Only visible on focus -->
<style>
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--primary);
    color: white;
    padding: 8px;
    z-index: 100;
  }

  .skip-link:focus {
    top: 0;
  }
</style>

<!-- Main content -->
<main id="main-content" tabindex="-1">
  Page content
</main>
```

### Color Contrast Requirements

WCAG 2.1 AA requires:
- **Normal text** (< 18px) - 4.5:1 contrast ratio
- **Large text** (≥ 18px or ≥ 14px bold) - 3:1 contrast ratio
- **UI components** (buttons, borders, icons) - 3:1 contrast ratio
- **Focus indicators** - 3:1 contrast against background

#### Testing Contrast
```typescript
// Calculate relative luminance
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// Calculate contrast ratio
const getContrastRatio = (color1: string, color2: string): number => {
  const lum1 = getLuminance(...hexToRgb(color1));
  const lum2 = getLuminance(...hexToRgb(color2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
};

// Check if contrast meets WCAG AA
const meetsWCAG_AA = (textColor: string, bgColor: string, isLargeText = false): boolean => {
  const ratio = getContrastRatio(textColor, bgColor);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
};
```

#### Fixing Low Contrast
```css
/* ❌ Bad: Insufficient contrast (2.5:1) */
.button {
  background: #3B82F6;
  color: #93C5FD;
}

/* ✅ Good: Sufficient contrast (4.8:1) */
.button {
  background: #2563EB;
  color: #FFFFFF;
}
```

### Screen Reader Support

#### Labeling and Descriptions
```html
<!-- Input with label and description -->
<label for="email">Email address</label>
<input
  id="email"
  type="email"
  aria-describedby="email-help"
  required
  aria-required="true"
/>
<span id="email-help">We'll never share your email.</span>

<!-- Icon button with accessible name -->
<button aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>

<!-- Image with alt text -->
<img src="chart.png" alt="Bar chart showing 40% increase in sales" />
```

#### Hiding Content from Screen Readers
```html
<!-- Visually hidden but accessible to screen readers -->
<span className="sr-only">New notifications</span>

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>

<!-- Hidden from screen readers (decorative) -->
<span aria-hidden="true">🎉</span>
```

#### Announcing Dynamic Content
```typescript
const [message, setMessage] = useState('');

const handleSave = async () => {
  await saveData();
  setMessage('Changes saved successfully');
  // Screen reader announces message
};

return (
  <>
    <button onClick={handleSave}>Save</button>
    <div role="status" aria-live="polite" aria-atomic="true">
      {message}
    </div>
  </>
);
```

### Common Accessibility Anti-Patterns to Avoid

#### 1. Div Buttons
```html
<!-- ❌ Bad: Not keyboard accessible, no role -->
<div onclick="handleClick()">Click me</div>

<!-- ✅ Good: Use native button -->
<button onClick={handleClick}>Click me</button>
```

#### 2. Placeholder as Label
```html
<!-- ❌ Bad: Placeholder disappears on input -->
<input type="text" placeholder="Enter your name" />

<!-- ✅ Good: Label persists -->
<label for="name">Name</label>
<input id="name" type="text" placeholder="John Doe" />
```

#### 3. Click Here Links
```html
<!-- ❌ Bad: Meaningless out of context -->
<a href="/report.pdf">Click here</a> to download the annual report.

<!-- ✅ Good: Descriptive link text -->
<a href="/report.pdf">Download the annual report</a>
```

#### 4. Disabled Buttons Without Explanation
```html
<!-- ❌ Bad: No explanation why disabled -->
<button disabled>Submit</button>

<!-- ✅ Good: Tooltip or aria-describedby explains -->
<button disabled aria-describedby="submit-help">Submit</button>
<span id="submit-help">Fill all required fields to enable submit</span>
```

#### 5. Auto-playing Video/Audio
```html
<!-- ❌ Bad: Auto-plays, distracting -->
<video src="intro.mp4" autoplay loop />

<!-- ✅ Good: User control -->
<video src="intro.mp4" controls>
  <track kind="captions" src="captions.vtt" srclang="en" label="English" />
</video>
```

#### 6. Color-Only Information
```html
<!-- ❌ Bad: Relies only on color -->
<span style="color: red;">Error</span>
<span style="color: green;">Success</span>

<!-- ✅ Good: Icon + color -->
<span className="status status--error">
  <ErrorIcon aria-hidden="true" /> Error
</span>
<span className="status status--success">
  <CheckIcon aria-hidden="true" /> Success
</span>
```

#### 7. Missing Focus Indicators
```css
/* ❌ Bad: Removes focus indicator without replacement */
button:focus {
  outline: none;
}

/* ✅ Good: Custom focus indicator */
button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

## Examples

### Example 1: Accessible Form

**Prompt:** "Audit this login form for accessibility issues"

**Expected Output:**
- Check all inputs have labels
- Verify error messages are associated with inputs
- Check contrast ratios for text and borders
- Ensure keyboard navigation works
- Test focus indicators
- Verify submit button disabled state handling

### Example 2: Data Table Audit

**Prompt:** "Audit this data table for WCAG 2.1 AA compliance"

**Expected Output:**
- Check `<th>` elements have `scope` attribute
- Verify keyboard navigation for sortable columns
- Check aria-sort on sorted column
- Ensure row selection checkboxes are keyboard accessible
- Verify color contrast for all table text
- Test screen reader row/column announcements

### Example 3: Modal Dialog Audit

**Prompt:** "Check this modal dialog for accessibility"

**Expected Output:**
- Verify `role="dialog"` and `aria-modal="true"`
- Check focus trap implementation
- Verify Escape key closes modal
- Check focus restoration to trigger
- Ensure background is inert
- Verify heading structure (`aria-labelledby`)

## Quality Rules

1. **All images need alt text** - Decorative images use `alt=""`
2. **All form inputs need labels** - Not just placeholders
3. **Color contrast must meet 4.5:1** - Test with contrast checker
4. **Everything works with keyboard** - Tab, Enter, Space, Arrow keys, Escape
5. **Focus is always visible** - Custom focus styles must have 3:1 contrast
6. **ARIA used correctly** - Use native HTML first, ARIA as enhancement
7. **No keyboard traps** - Can tab in and out of all components
8. **Semantic HTML** - Use `<button>`, `<nav>`, `<main>`, not `<div>` with ARIA
9. **Test with screen reader** - NVDA (Windows), VoiceOver (Mac), or validate ARIA
10. **Motion can be disabled** - Respect `prefers-reduced-motion` media query
