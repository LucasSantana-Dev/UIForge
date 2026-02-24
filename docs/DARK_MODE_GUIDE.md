# Siza Dark Mode Guide

## Overview

Siza is a **dark-mode only** application, optimized for extended use and reduced eye strain. The color palette has been carefully designed following dark mode best practices.

## Design Principles

### 1. Dark Gray Instead of Pure Black
- **Background**: `hsl(240, 8%, 10%)` - Not pure black (#000000)
- **Rationale**: Pure black can cause eye strain and halation effects on OLED screens
- **Benefit**: Softer on the eyes during extended use

### 2. Desaturated Colors
- **Primary Purple**: `hsl(262, 70%, 60%)` - Reduced from 83% to 70% saturation
- **Rationale**: Highly saturated colors on dark backgrounds cause eye strain
- **Benefit**: Comfortable viewing without losing brand identity

### 3. Elevated Surfaces
- **Background**: `10%` lightness
- **Cards**: `14%` lightness
- **Secondary**: `20%` lightness
- **Rationale**: Clear visual hierarchy through subtle elevation
- **Benefit**: Easy to distinguish content areas

### 4. High Contrast Text
- **Foreground**: `95%` lightness on `10%` background
- **Contrast Ratio**: ~16:1 (exceeds WCAG AAA)
- **Muted Text**: `70%` lightness for less important content
- **Benefit**: Excellent readability

## Color Palette

### Base Colors

```css
--background: 240 8% 10%;      /* Dark gray base */
--foreground: 240 5% 95%;      /* Near white text */
--card: 240 7% 14%;            /* Elevated surface */
--border: 240 6% 22%;          /* Subtle borders */
```

### Brand Colors

```css
--primary: 262 70% 60%;        /* Desaturated purple */
--primary-foreground: 0 0% 100%; /* White on purple */
--accent: 262 60% 30%;         /* Dark purple accent */
```

### Semantic Colors

```css
--secondary: 240 6% 20%;       /* Gray elevation */
--muted: 240 6% 18%;           /* Muted backgrounds */
--muted-foreground: 240 5% 70%; /* Muted text */
--destructive: 0 60% 55%;      /* Desaturated red */
```

## Purple Scale (Dark-Optimized)

All purple shades are desaturated for comfortable viewing:

- `purple-50`: `hsl(262, 80%, 85%)` - Lightest (text on dark)
- `purple-100`: `hsl(262, 75%, 80%)`
- `purple-200`: `hsl(262, 70%, 75%)`
- `purple-300`: `hsl(262, 70%, 70%)`
- `purple-400`: `hsl(262, 70%, 65%)`
- `purple-500`: `hsl(262, 70%, 60%)` - **Primary brand color**
- `purple-600`: `hsl(262, 65%, 55%)`
- `purple-700`: `hsl(262, 60%, 45%)`
- `purple-800`: `hsl(262, 55%, 35%)`
- `purple-900`: `hsl(262, 50%, 25%)` - Darkest

## Implementation Details

### Forced Dark Mode

The application forces dark mode by adding the `dark` class to the `<html>` element:

```tsx
// src/app/layout.tsx
<html lang="en" className={`${inter.className} dark`}>
```

### No Theme Toggle

The theme toggle has been removed from the TopBar component since the application is dark-mode only.

### CSS Variables

All colors are defined once in `:root` without a `.dark` selector:

```css
@layer base {
  :root {
    /* All dark mode colors defined here */
    --background: 240 8% 10%;
    /* ... */
  }
}
```

## Best Practices

### Do's ✅

1. **Use design tokens** - Always use CSS variables (`bg-background`, `text-foreground`)
2. **Maintain elevation** - Use `bg-card` for elevated surfaces
3. **Use muted colors** - Use `text-muted-foreground` for less important text
4. **Test contrast** - Ensure all text meets WCAG AA standards (4.5:1 minimum)
5. **Use purple sparingly** - Reserve `primary` color for important actions

### Don'ts ❌

1. **Don't use pure black** - Always use `bg-background` instead of `bg-black`
2. **Don't use pure white** - Use `text-foreground` instead of `text-white`
3. **Don't oversaturate** - Stick to the desaturated purple palette
4. **Don't add light mode** - The app is intentionally dark-only
5. **Don't use bright colors** - All colors should be comfortable for extended viewing

## Accessibility

### Contrast Ratios

All color combinations meet or exceed WCAG standards:

- **Primary text**: 16:1 (AAA) - `foreground` on `background`
- **Muted text**: 7:1 (AAA) - `muted-foreground` on `background`
- **Primary button**: 4.5:1 (AA) - `primary-foreground` on `primary`
- **Border contrast**: 3:1 (minimum for non-text)

### Focus Indicators

All interactive elements have clear focus indicators using the `ring` color:

```tsx
<Button className="focus:ring-2 focus:ring-ring">
  Click me
</Button>
```

## Usage Examples

### Primary Actions

```tsx
<Button>Primary Action</Button>
<Button variant="default">Create Project</Button>
```

### Secondary Actions

```tsx
<Button variant="secondary">Cancel</Button>
<Button variant="ghost">View Details</Button>
```

### Cards and Surfaces

```tsx
<Card>
  <CardHeader>
    <CardTitle>Elevated Surface</CardTitle>
    <CardDescription className="text-muted-foreground">
      Subtle description text
    </CardDescription>
  </CardHeader>
  <CardContent>
    Content with proper elevation
  </CardContent>
</Card>
```

### Custom Purple Accents

```tsx
<div className="bg-purple-900 text-purple-50">
  Dark purple background with light text
</div>

<h1 className="text-purple-500">
  Primary purple heading
</h1>
```

## Chart Colors

For data visualization, use the harmonious purple palette:

```css
--chart-1: 262 70% 60%;  /* Primary purple */
--chart-2: 280 60% 65%;  /* Violet */
--chart-3: 240 50% 70%;  /* Blue-gray */
--chart-4: 262 80% 75%;  /* Light purple */
--chart-5: 290 55% 60%;  /* Magenta-purple */
```

## Performance Considerations

### Why Dark-Only?

1. **Consistency** - No need to test and maintain two themes
2. **Performance** - No theme switching logic or state management
3. **Brand Identity** - Strong, consistent visual identity
4. **User Experience** - Optimized for developers who prefer dark mode
5. **Reduced Complexity** - Simpler codebase and fewer edge cases

### OLED Benefits

On OLED screens, dark mode provides:
- Lower power consumption
- Reduced blue light exposure
- Better contrast in low-light environments
- Less eye strain during extended use

## Migration Notes

If you need to add light mode in the future:

1. Add `.dark` selector back to `globals.css`
2. Define light mode colors in `:root`
3. Move current colors to `.dark` selector
4. Remove `dark` class from `layout.tsx`
5. Add theme toggle back to `TopBar.tsx`
6. Update this documentation

## Resources

- [Dark Mode Best Practices](https://atmos.style/blog/dark-mode-ui-best-practices)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Material Design Dark Theme](https://material.io/design/color/dark-theme.html)
- [Apple Human Interface Guidelines - Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode)
