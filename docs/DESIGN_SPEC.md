# Siza Web Application — Complete Design & Engineering Specification

> **Version:** 1.0
> **Date:** February 2026
> **Scope:** Full-stack specification for the Siza UI generation platform

---

## 1. Product Overview

**Siza** is a precision UI generation platform named after Álvaro Siza Vieira (Pritzker Prize 1992). Like its namesake, Siza treats every component as architectural: purposeful, refined, and built to last.

### Brand Positioning

- **Tagline:** *"Design that thinks. Code that lasts."*
- **Secondary Tagline:** *"Precision UI generation for the exacting developer."*
- **Voice:** Authoritative, precise, minimal. Never chatty.
- **Audience:** Senior frontend developers and design-conscious engineers.

---

## 2. Theme Implementation

### 2.1 CSS Custom Properties (globals.css)

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --primary: 262 80% 50%;
    --primary-foreground: 0 0% 98%;
    --surface-0: 240 9% 7%;
    --surface-1: 240 8% 10%;
    --surface-2: 240 7% 13%;
    --surface-3: 240 5% 17%;
    --surface-4: 240 4% 25%;
    --text-primary: 0 0% 98%;
    --text-secondary: 240 5% 64%;
    --text-muted: 240 4% 46%;
    --text-disabled: 240 4% 32%;
    --brand: 262 80% 58%;
    --brand-light: 262 76% 67%;
    --brand-dark: 264 76% 48%;
    --brand-indigo: 239 84% 67%;
  }

  .dark {
    --background: 240 9% 7%;
    --foreground: 0 0% 98%;
    --card: 240 8% 10%;
    --card-foreground: 0 0% 98%;
    --border: 240 5% 17%;
    --input: 240 7% 13%;
    --primary: 262 80% 58%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 7% 13%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 8% 10%;
    --muted-foreground: 240 5% 64%;
    --accent: 240 5% 17%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 98%;
    --ring: 262 80% 58%;
    --radius: 0.375rem;
  }
}
```

### 2.2 Siza Mesh Background

```css
.siza-mesh {
  background:
    radial-gradient(ellipse 80% 60% at 10% 20%, rgba(124, 58, 237, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse 60% 80% at 85% 75%, rgba(99, 102, 241, 0.06) 0%, transparent 55%),
    radial-gradient(ellipse 40% 40% at 50% 10%, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse 70% 50% at 20% 90%, rgba(67, 56, 202, 0.04) 0%, transparent 60%),
    hsl(var(--background));
}
```

---

## 3. Typography System

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Hero | Outfit | 64px | 700 | 1.1 | -0.03em |
| Display | Outfit | 36px | 600 | 1.2 | -0.02em |
| Title | Inter | 20px | 600 | 1.3 | -0.01em |
| Body | Inter | 15px | 400 | 1.6 | 0 |
| Small | Inter | 13px | 400 | 1.5 | 0.01em |
| Code | JetBrains Mono | 14px | 400 | 1.7 | 0 |

---

## 4. Animation & Motion System

| Token | Value | Use Case |
|-------|-------|----------|
| instant | 100ms | Checkbox toggle |
| fast | 150ms | Hover color |
| normal | 200ms | Button press |
| medium | 300ms | Modal open |
| slow | 400ms | Page reveal |
| ease-siza | cubic-bezier(0.16, 1, 0.3, 1) | All reveals |
| ease-sharp | cubic-bezier(0.23, 1, 0.32, 1) | Menus |
| ease-soft | cubic-bezier(0.4, 0, 0.2, 1) | Exit animations |

---

## 5. Page Specifications

### 5.1 Landing Page
- Full dark mesh background, sticky nav, hero with tagline
- Capability badges (scrolling marquee), feature grid (6 cards)
- How it works (3 steps), code showcase, testimonials, pricing, footer

### 5.2 Auth Pages
- Centered card on mesh background, no sidebar
- Sign In, Sign Up, Forgot Password, Verify Email

### 5.3 Dashboard — Projects
- Grid/list view with project cards
- Search, filter by framework, sort options
- New project modal

### 5.4 Dashboard — Generate
- 3-panel: GeneratorForm | CodeEditor | LivePreview
- SSE streaming with typewriter effect
- Save to project flow

### 5.5 Dashboard — Templates
- Browsable template gallery with category filters
- Use template → pre-fills generate form

### 5.6 Dashboard — AI Keys
- BYOK key management (OpenAI, Anthropic, Gemini)
- AES-256 encrypted local storage

### 5.7 Dashboard — Settings
- Profile, AI Keys, Billing, Danger Zone sub-pages

### 5.8 Error Pages
- 404 and 500 with dark mesh backgrounds

---

## 6. Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| surface-0 | #121214 | Page background |
| surface-1 | #18181B | Cards, sidebar |
| surface-2 | #1E1E22 | Inputs, elevated |
| surface-3 | #27272A | Borders |
| surface-4 | #3F3F46 | Hover states |
| text-primary | #FAFAFA | Headings, labels |
| text-secondary | #A1A1AA | Descriptions |
| text-muted | #71717A | Timestamps |
| brand | #7C3AED | Primary actions |
| brand-light | #8B5CF6 | Hover states |
| brand-dark | #6D28D9 | Active states |
| brand-indigo | #6366F1 | Gradient accent |

---

## 7. Implementation Priorities

### Phase 1 — Critical
1. Apply dark mode class
2. Rebrand Siza → Siza
3. Retheme all components with Siza tokens
4. Add missing CRUD routes
5. Fix LivePreview placeholder

### Phase 2 — High Value
6. Animation system (Framer Motion)
7. Tailwind config full update
8. DB-backed Templates API
9. User Profiles table
10. Usage tracking

### Phase 3 — Differentiators
11. Live Preview (Sandpack)
12. Component Versioning
13. Wireframe AI API
14. Landing page rebuild
15. OG image generation

---

*Reference designs: https://v0-siza-ui-design.vercel.app/ and https://dark-mode-assets--devlucassantana.replit.app*
