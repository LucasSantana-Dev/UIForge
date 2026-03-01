---
name: siza-design-to-code
description: Convert screenshots and wireframes to production code with color extraction and layout analysis
version: 1.0.0
author: Forge Space
tags: [design, screenshot, wireframe, vision, color-extraction, layout, conversion]
---

# Siza Design to Code

## Overview
Convert visual designs (screenshots, wireframes, mockups) into production-ready component code. This skill guides AI vision analysis for color extraction, layout detection, spacing inference, and component hierarchy identification.

## Instructions

### Image Analysis Instructions for AI Vision

When analyzing a design image (screenshot, wireframe, or mockup), follow this systematic approach:

#### 1. Overall Layout Structure

**Identify the primary layout pattern:**
- **Single column** - Mobile-first, centered content
- **Two column** - Sidebar + main content
- **Grid layout** - Cards or items in rows/columns
- **Hero section** - Large header image/video with overlay text
- **Dashboard** - Navigation + metrics + charts + tables
- **Form layout** - Vertical stack of form fields

**Determine layout technique:**
- CSS Grid for 2D layouts (both rows and columns matter)
- Flexbox for 1D layouts (single row or column)
- Absolute positioning for overlays (modals, tooltips)
- Fixed positioning for sticky headers/footers

**Example analysis:**
```
Layout: Two-column layout with sidebar navigation on left
Technique: CSS Grid with grid-template-columns: 250px 1fr
Sidebar: Fixed height, vertical nav list, logo at top
Main: Padding around content, scrollable
```

#### 2. Color Extraction and Palette Generation

**Extract colors systematically:**
1. **Primary color** - Dominant brand color (buttons, links, highlights)
2. **Secondary color** - Supporting color (badges, icons, accents)
3. **Background colors** - Page background, card backgrounds, section backgrounds
4. **Text colors** - Headings, body text, muted text, link text
5. **Border colors** - Dividers, card borders, input borders
6. **State colors** - Success (green), error (red), warning (yellow), info (blue)

**Generate color variables:**
```css
:root {
  /* Brand colors */
  --primary: #3B82F6;
  --primary-hover: #2563EB;
  --primary-light: #DBEAFE;
  --secondary: #8B5CF6;

  /* Neutral colors */
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-300: #D1D5DB;
  --gray-400: #9CA3AF;
  --gray-500: #6B7280;
  --gray-600: #4B5563;
  --gray-700: #374151;
  --gray-800: #1F2937;
  --gray-900: #111827;

  /* Semantic colors */
  --success: #10B981;
  --error: #EF4444;
  --warning: #F59E0B;
  --info: #3B82F6;

  /* Surface colors */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --bg-tertiary: #F3F4F6;

  /* Text colors */
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-tertiary: #9CA3AF;

  /* Border colors */
  --border-color: #E5E7EB;
  --border-focus: #3B82F6;
}
```

**Dark mode consideration:**
If the design has a dark theme, create a dark color scheme:
```css
[data-theme="dark"] {
  --bg-primary: #111827;
  --bg-secondary: #1F2937;
  --bg-tertiary: #374151;
  --text-primary: #F9FAFB;
  --text-secondary: #D1D5DB;
  --border-color: #374151;
}
```

#### 3. Component Hierarchy Identification

**Break down the design into component tree:**

1. **Layout components** - Header, Sidebar, Main, Footer
2. **Container components** - Card, Panel, Section, Grid
3. **Content components** - Heading, Paragraph, Image, Icon
4. **Interactive components** - Button, Input, Select, Checkbox, Link
5. **Composite components** - Navigation, Form, Table, Modal

**Example hierarchy:**
```
DashboardLayout
├── Sidebar
│   ├── Logo
│   ├── Navigation
│   │   ├── NavItem (active)
│   │   ├── NavItem
│   │   └── NavItem
│   └── UserProfile
├── Header
│   ├── SearchBar
│   ├── NotificationBell
│   └── UserAvatar
└── Main
    ├── PageHeader
    │   ├── Heading
    │   └── ActionButton
    ├── MetricsGrid
    │   ├── MetricCard
    │   ├── MetricCard
    │   └── MetricCard
    └── DataTable
```

**Identify reusable patterns:**
- If you see the same visual pattern repeated (cards, buttons, inputs), create a reusable component
- Extract common styles into utility classes or component variants
- Look for micro-interactions (hover states, transitions, animations)

#### 4. Spacing and Sizing Inference

**Establish spacing scale:**
Analyze the visual rhythm and infer spacing values:
- **Tight spacing** - 4px, 8px (within components)
- **Medium spacing** - 12px, 16px, 24px (between components)
- **Loose spacing** - 32px, 48px, 64px (between sections)

Create spacing scale:
```css
:root {
  --spacing-1: 0.25rem;  /* 4px */
  --spacing-2: 0.5rem;   /* 8px */
  --spacing-3: 0.75rem;  /* 12px */
  --spacing-4: 1rem;     /* 16px */
  --spacing-5: 1.25rem;  /* 20px */
  --spacing-6: 1.5rem;   /* 24px */
  --spacing-8: 2rem;     /* 32px */
  --spacing-10: 2.5rem;  /* 40px */
  --spacing-12: 3rem;    /* 48px */
  --spacing-16: 4rem;    /* 64px */
}
```

**Infer element sizes:**
- **Button height** - Typically 36px (small), 40px (medium), 48px (large)
- **Input height** - Match button height for visual consistency
- **Card padding** - Usually 16px - 24px
- **Container max-width** - 1280px - 1440px for desktop content
- **Icon size** - 16px, 20px, 24px based on context

**Border radius scale:**
```css
:root {
  --radius-sm: 0.25rem;  /* 4px - inputs, small buttons */
  --radius-md: 0.375rem; /* 6px - cards, buttons */
  --radius-lg: 0.5rem;   /* 8px - large cards, modals */
  --radius-xl: 0.75rem;  /* 12px - hero sections */
  --radius-full: 9999px; /* Pills, avatars */
}
```

#### 5. Typography Matching

**Analyze text hierarchy:**
1. **Font family** - Sans-serif (Inter, Roboto) or serif (Merriweather, Georgia)?
2. **Font weights** - Light (300), Regular (400), Medium (500), Semibold (600), Bold (700)?
3. **Font sizes** - Establish type scale
4. **Line heights** - Tighter for headings (1.2), looser for body (1.6)
5. **Letter spacing** - Headings often have tighter tracking

**Create type scale:**
```css
:root {
  /* Font families */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-serif: 'Merriweather', Georgia, serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Font sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */

  /* Line heights */
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;

  /* Font weights */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

**Apply to heading styles:**
```css
h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

h2 {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  color: var(--text-primary);
}

p {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
}
```

#### 6. Shadow and Elevation System

**Identify shadow layers:**
- **No shadow** - Flat elements, inline with surface
- **Small shadow** - Slight elevation (cards, dropdowns)
- **Medium shadow** - Moderate elevation (modals, popovers)
- **Large shadow** - High elevation (dialogs, drawers)

**Create shadow scale:**
```css
:root {
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
```

#### 7. Interactive State Analysis

**Identify state variations:**
1. **Default state** - Normal appearance
2. **Hover state** - Slightly darker/lighter, cursor pointer
3. **Active/pressed state** - Even darker, slightly smaller scale
4. **Focus state** - Outline or ring for keyboard navigation
5. **Disabled state** - Reduced opacity, no pointer events
6. **Loading state** - Spinner or skeleton
7. **Error state** - Red border/text, error icon

**Example button states:**
```css
.button {
  background: var(--primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.button:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.button:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button.loading {
  position: relative;
  color: transparent;
}

.button.loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### How to Handle Ambiguous Designs

When design details are unclear:

1. **Typography ambiguity** - Use system font stack and common sizes
2. **Missing spacing** - Apply consistent spacing scale (8px grid)
3. **Unclear interactions** - Implement standard hover/focus states
4. **Missing responsive behavior** - Default to mobile-first responsive
5. **Color variations** - Generate lighter/darker shades programmatically
6. **Icon ambiguity** - Use common icon library (Heroicons, Lucide)

**Programmatic color generation:**
```typescript
const lighten = (color: string, amount: number): string => {
  // HSL manipulation to create lighter shade
  const hsl = hexToHSL(color);
  return hslToHex({ ...hsl, l: Math.min(hsl.l + amount, 100) });
};

const darken = (color: string, amount: number): string => {
  const hsl = hexToHSL(color);
  return hslToHex({ ...hsl, l: Math.max(hsl.l - amount, 0) });
};

// Usage
const primaryLight = lighten('#3B82F6', 20);
const primaryDark = darken('#3B82F6', 15);
```

### Conversion Workflow

1. **Analyze image** - Apply all analysis steps above
2. **Extract design tokens** - Colors, spacing, typography, shadows
3. **Identify component hierarchy** - Break into reusable components
4. **Write semantic HTML** - Proper elements, ARIA when needed
5. **Apply styling** - CSS using design tokens
6. **Add interactivity** - Event handlers, state management
7. **Make responsive** - Mobile-first media queries
8. **Test accessibility** - Keyboard navigation, screen reader, color contrast

### Responsive Conversion Strategy

**Mobile-first approach:**
```css
/* Mobile styles (default) */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 1rem;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    padding: 1.5rem;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    padding: 2rem;
  }
}
```

**Fluid typography:**
```css
h1 {
  font-size: clamp(1.875rem, 5vw, 3rem);
}

p {
  font-size: clamp(0.875rem, 2vw, 1rem);
}
```

**Container queries for components:**
```css
.card {
  container-type: inline-size;
}

.card__content {
  display: flex;
  flex-direction: column;
}

@container (min-width: 400px) {
  .card__content {
    flex-direction: row;
    gap: 1rem;
  }
}
```

## Examples

### Example 1: Hero Section from Screenshot

**Prompt:** "Convert this hero section screenshot to code" (image with large heading, subtitle, CTA buttons, background image)

**Expected Output:**
1. Color palette with primary color from CTA button
2. Typography scale matching heading and body text sizes
3. HTML structure with semantic elements
4. CSS with background image, overlay gradient, responsive text sizing
5. Proper heading hierarchy (h1, p, buttons)

### Example 2: Card Grid from Wireframe

**Prompt:** "Convert this card grid wireframe to code" (image showing 3-column grid of cards)

**Expected Output:**
1. Spacing scale inferred from gaps between cards
2. CSS Grid layout with responsive columns (1 → 2 → 3)
3. Card component with padding, border, shadow
4. Reusable Card component with props

### Example 3: Form from Mockup

**Prompt:** "Convert this contact form mockup to code" (image with inputs, labels, submit button)

**Expected Output:**
1. Form component with accessible markup
2. Input styles matching border, padding, focus states
3. Button styles matching size and color
4. Proper label association
5. Validation error state styling

### Example 4: Navigation from Design

**Prompt:** "Convert this navigation bar design to code" (image with logo, nav links, user menu)

**Expected Output:**
1. Semantic nav element
2. Flexbox layout for logo + links + user menu
3. Hover states for links
4. Responsive: hamburger menu on mobile
5. Active link indicator

## Quality Rules

1. **Always extract complete color palette** - Don't hardcode colors, use CSS variables
2. **Establish spacing scale** - Consistent spacing across all components
3. **Match typography exactly** - Font family, size, weight, line height
4. **Infer responsive behavior** - Even if only desktop design provided
5. **Use semantic HTML** - Header, nav, main, section, article, footer
6. **Create reusable components** - If a pattern repeats, make it a component
7. **Add interactive states** - Hover, focus, active, disabled
8. **Maintain aspect ratios** - For images and media elements
9. **Check color contrast** - Ensure WCAG AA compliance (4.5:1 for text)
10. **Document assumptions** - Note where design was ambiguous and decisions made
