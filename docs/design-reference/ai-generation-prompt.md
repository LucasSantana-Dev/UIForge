# Siza AI Generation Prompt

Copy-paste this prompt into v0.dev, Lovable, Bolt, or similar AI UI generation tools.

---

## The Prompt

```
Build a complete web application for "Siza" — an AI-powered UI component generation platform for developers.
Siza lets developers describe a component in natural language and get production-ready code with accessibility,
responsive design, and framework-specific output (React, Next.js, Vue, etc.).

## Tech Stack
- Next.js 16 (App Router, Server Components)
- React 19
- TypeScript strict mode
- Tailwind CSS 4
- shadcn/ui components (Radix primitives)
- Lucide React icons
- Recharts for dashboard charts
- Sonner for toast notifications

## Brand Identity
Product name: "Siza"
Logo: Custom SVG S-curve icon (stroke #7C3AED, 22x22px) + "siza" in Outfit font, 17px bold, tracking -0.02em.
Tagline: "AI-Powered UI Generation"
Personality: Premium developer tool — like Linear meets Vercel. Not generic SaaS.

## Color System (Dark-First)

CSS custom properties:

--background: #121214 (page background, near-black with subtle warmth)
--foreground: #FAFAFA (primary text)
--card: #18181B (card surfaces, sidebar, inputs — zinc-900)
--primary: #7C3AED (brand purple — buttons, focus rings, active states)
--primary-hover: #8B5CF6 (purple-500, hover states, accent text)
--primary-active: #6D28D9 (purple-700, pressed states)
--accent-bg: rgba(124, 58, 237, 0.12) (subtle purple tint for badges, highlights)
--border: #27272A (zinc-800, all borders)
--border-hover: #3F3F46 (zinc-700, hover borders)
--muted-text: #A1A1AA (zinc-400, secondary text, placeholders)
--muted-text-dim: #71717A (zinc-500, breadcrumbs, timestamps)
--destructive: #EF4444 (errors)
--success: #22C55E (success indicators)
--warning: #EAB308 (warnings)
--info: #60A5FA (informational)
--secondary-accent: #6366F1 (indigo-500, mesh gradient secondary color)

IMPORTANT: Do NOT use pure black (#000000). The darkest background is #121214.
All surfaces use zinc scale: #121214 → #18181B → #27272A → #3F3F46.

## Typography

Three font families loaded via next/font/google with display: swap:
- Display font (headings): Outfit — geometric sans, modern feel
- Body font: Inter — highly legible, optimized for screens
- Code font: JetBrains Mono — developer-focused monospace

Type scale:
- Hero H1: 40px mobile → 52px sm → 64px md, line-height 1.08, tracking -0.03em, Outfit bold
- Section H2: 32px, line-height 1.2, tracking -0.02em, Outfit bold
- Dashboard heading: 24px, Outfit bold, tracking -0.02em
- Card titles: 16px, Inter semibold
- Section labels: 11px uppercase, tracking 0.08em, Inter medium, muted text color
- Body large: 18-20px, line-height 1.7-1.75
- Body: 14px, line-height 1.6
- Small: 13px, line-height 1.6
- Code: 12-13px, JetBrains Mono, line-height 1.65-1.9

## Border Radius
Base: 12px (--radius: 0.75rem)
Scale: sm 8px, md 10px, lg 12px, xl 16px
Badges/pills: fully rounded

## Spacing
Section vertical padding: 96px (py-24)
Section horizontal: 24px mobile (px-6) → 80px desktop (lg:px-20)
Max content width: 1280px centered
Card padding: 20-24px
Gap scale: 8 / 12 / 16 / 24 / 32 / 48 / 64px

## Visual Effects

### Particle Animation (Hero)
Canvas-based particle system:
- 40 particles, purple-tinted (rgba(139, 92, 246, 0.1-0.35))
- Size 1.5-4px, slow drift velocity (-0.125 to +0.125 px/frame)
- Sinusoidal pulse (opacity oscillation)
- Connection lines between particles within 120px: rgba(124, 58, 237, 0.04), 0.5px stroke
- Wrap around canvas edges

### Hero 5-Layer Stack (bottom to top)
1. Background image with 30% opacity + gradient overlay (from #121214/40 via transparent to #121214)
2. Rotating mesh gradient (conic, 30s rotation): purple (#7C3AED at 6% opacity) and indigo (#6366F1 at 4%)
3. Dot grid pattern: rgba(250,250,250,0.035) 1px dots on 28x28px grid
4. Canvas particle system (described above)
5. Central radial glow: 700x700px, rgba(124,58,237,0.12) fading to transparent, pulsing 6s (opacity 0.5→0.8, scale 1→1.06)

### Glassmorphism (Navbar)
- Sticky top-0, z-50, 64px height
- backdrop-filter: blur(12px)
- Background: rgba(18,18,20,0.95) → rgba(18,18,20,0.85) on scroll (20px threshold)
- Border bottom: 1px solid #27272A
- 300ms transition

### Entrance Animations
- Staggered reveal on scroll (IntersectionObserver, 10% threshold)
- Initial: opacity 0, translateY(16px)
- Final: opacity 1, translateY(0)
- Duration: 600ms ease
- Stagger delays: 0, 80, 160, 240, 320, 400ms between elements

### Button Effects
- Primary hover: bg shifts to #8B5CF6 + box-shadow: 0 0 30px rgba(124,58,237,0.3)
- Active: scale(0.98) + bg #6D28D9
- Focus: ring-2 ring-#7C3AED ring-offset-2 ring-offset-#121214

## Landing Page Structure (10 sections)

1. **Navbar** — Sticky glassmorphic. Logo left, nav center (Platform, Tools, About, Roadmap), Sign In + Get Started right. Mobile: hamburger → full overlay menu.

2. **Hero** (min-height 90vh) — 5-layer visual stack. Content: small purple badge "AI-Powered", large heading "Generate production UI components with AI", subheading describing the value prop, two CTAs (Get Started primary + View Docs secondary), terminal mockup showing a generation command with typed output. All entrance-animated with stagger.

3. **ContextBar** — Horizontal stats ribbon. Animated count-up numbers (cubic ease-out). Metrics like: Components Generated, Active Users, Frameworks Supported. 11px uppercase labels.

4. **Capabilities** — 3-column grid (responsive 1→2→3). Six feature cards with icon, title, description. Icons in 40px circles with rgba(124,58,237,0.12) bg. Hover: border brightens, subtle glow.

5. **CodeShowcase** — 2-column layout. Left: description + feature bullets. Right: syntax-highlighted code block (dark bg, JetBrains Mono) showing component generation output.

6. **Ecosystem** — 4-card grid showing related projects/repos. Each card: icon, name, description, status badge. Plus architecture diagram image below.

7. **DashboardPreview** — Full-width mockup of the dashboard UI in a browser chrome frame. Shows the create-component page with form and preview.

8. **LocalFirst** — Feature highlight: local AI with Ollama. Cost comparison table showing cloud vs local pricing. Privacy and speed benefits.

9. **CtaSection** — Centered final CTA. Large heading, subtext, primary button with glow effect.

10. **Footer** — Multi-column links (Product, Resources, Company, Legal). Logo + copyright. Border top #27272A.

## Dashboard (18 pages)

Shell: 250px fixed sidebar (bg #18181B, border-right #27272A) + fluid content area.
Top header: 56px, bg #18181B/50 + backdrop-blur-sm, breadcrumb navigation.

Sidebar navigation groups:
- Overview: Dashboard (home), Analytics, GitHub
- Create: New Component, New Application, Image Generator, Figma Prototype
- Manage: Components, Tools, Gateway, API Keys, Deployments
- Configure: Rules, MCPs & Skills, Design Patterns, BFF Generator, Docs, Settings

### Key Dashboard Pages

**Dashboard Home** — Stats cards (2→4 column grid), recent activity feed, quick actions.

**Create Component** — 5:3 grid split. Left (62.5%): component type selector, framework dropdown, style preset, props configuration, generate button. Right (37.5%): live preview panel with rendered output, copy/download actions.

**Components List** — Data table with search, column sorting, pagination, filters. Each row: name, framework, created date, quality score, actions.

**Analytics** — Recharts line/bar/area charts. Time range selector. Metrics: generations, quality scores, acceptance rates.

**API Keys** — Table with key name, prefix, created date, last used, revoke action. Create key dialog.

**Settings** — Tab groups (General, Appearance, API, Notifications). Form sections with labels, inputs, toggles, save buttons.

## Component Specifications

### Button Variants
- Primary: bg #7C3AED, text white, hover #8B5CF6 + glow, active scale(0.98) + #6D28D9
- Secondary: bg #18181B/50, border #27272A, hover border #3F3F46
- Ghost: transparent, text #A1A1AA, hover text #FAFAFA
- Destructive: bg #EF4444
- Sizes: sm (36px/13px), md (40px/14px), lg (48px/15px)

### Card
- bg #18181B, border 1px #27272A, radius 12px, padding 20-24px
- Hover: border #3F3F46, box-shadow 0 0 20px rgba(124,58,237,0.1)

### Input
- bg #18181B, border 1px #27272A, radius 10px, padding 12px x 10px
- Focus: ring-2 ring-#7C3AED ring-offset-2 ring-offset-#121214
- Placeholder: #A1A1AA

### Badge
- bg rgba(124,58,237,0.12), border 1px rgba(124,58,237,0.3), pill-shaped
- 11-12px font, purple text

### Data Table
- Header bg #18181B, text 12px uppercase tracking-wide #71717A
- Row hover: bg rgba(255,255,255,0.02)
- Border between rows: 1px #27272A
- Sort indicators, column visibility toggles, pagination

## Quality Requirements
- WCAG AA contrast ratios (4.5:1 text, 3:1 UI elements)
- TypeScript strict mode, no any types
- All interactive elements keyboard accessible
- Proper focus management and focus rings
- Semantic HTML (nav, main, aside, section, article)
- Mobile-first responsive (sm: 640, md: 768, lg: 1024, xl: 1280)
- Lighthouse: Performance 95+, Accessibility 95+, Best Practices 95+
- Use Server Components by default, Client Components only when needed (interactivity, hooks, browser APIs)
- Proper loading states (skeleton components, spinners)
- Error boundaries with graceful fallbacks
- Animated transitions between states (150-600ms)

## Anti-Patterns to AVOID
- Do NOT use pure white or pure black backgrounds
- Do NOT use lorem ipsum — write realistic UI copy about AI component generation
- Do NOT use generic stock illustrations — use code blocks, terminal output, and UI mockups
- Do NOT use blue as primary color — the brand is purple #7C3AED
- Do NOT use rounded-full on cards (only badges/avatars)
- Do NOT use thin 1px fonts — minimum font-weight 400
- Do NOT make everything glow — glow effects only on primary buttons and hero elements
- Do NOT use gradient text everywhere — reserve for hero heading and section titles
- Do NOT add light mode — this is dark-only
- Do NOT use generic dashboard templates — every page should feel purpose-built for UI generation
```

---

## Usage Notes

**For v0.dev**: Paste the entire prompt. v0 handles Next.js + shadcn/ui natively. It will generate the full app structure. You may need to follow up with "now build the dashboard pages" for all 18 pages.

**For Lovable**: Paste the full prompt. Lovable works best when you specify the tech stack explicitly. It may generate a Vite app instead of Next.js — specify Next.js App Router in a follow-up if needed.

**For Bolt**: Paste the full prompt. Bolt generates complete file structures. Follow up with specific dashboard pages if the initial output only covers the landing page.

**For Cursor/Windsurf**: Use as a project specification file. Place in the project root or reference in composer/chat.

## Iteration Tips

After initial generation, use these follow-up prompts:

1. "Add the particle animation canvas to the hero section using requestAnimationFrame, exactly as specified"
2. "Build all 18 dashboard pages with the sidebar navigation described above"
3. "Add scroll-triggered entrance animations to all landing page sections"
4. "Implement the glassmorphic navbar with scroll-aware background opacity"
5. "Create the data table component with sorting, search, pagination, and column visibility"
