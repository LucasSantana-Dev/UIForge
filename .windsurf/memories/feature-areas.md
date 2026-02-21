# UIForge Web App — Feature Areas & Implementation Details

## All 8 phases complete ✅

### Auth (Phase 1)
- Email/password signup + signin
- Google OAuth + GitHub OAuth (feature-flag controlled)
- Session management via `@supabase/ssr` + HTTP-only cookies
- Protected routes via `proxy.ts` (Next.js 16 replacement for `middleware.ts`)
- Password recovery flow

### Projects (Phase 2)
- CRUD: create, rename, delete projects
- Project thumbnails stored in `project-thumbnails` Supabase Storage bucket
- Metadata: name, description, framework, created_at, updated_at
- RLS: users can only access their own projects

### Component Generation (Phase 2 + 5)
- Natural language prompt → AI-generated component code
- Frameworks: React + Tailwind + Shadcn/ui, Next.js App Router, Vue 3, Angular
- Monaco Editor for code editing (`vs-dark` theme, `ssr: false`)
- Streaming generation via Cloudflare Workers + Gemini 1.5 Flash
- MCP tools: `generateComponent`, `validateCode`, `formatCode`

### Wireframes (Phase 3)
- SVG-based wireframe generation from descriptions
- MCP tool: `generateWireframe`
- Figma export with Auto Layout: `exportToFigma`
- Interactive wireframe preview in the dashboard

### Templates (Phase 7)
- 10+ production-ready templates:
  Navigation Bar, Hero Section, Contact Form, Pricing Card, Modal Dialog,
  Data Table, Sidebar Menu, Loading Spinner, Card Grid, Search Bar
- Search and filter by category/difficulty
- One-click instantiation → opens in generator with pre-filled prompt
- Template usage tracked via Google Analytics 4

### BYOK — Bring Your Own Key (Phase 6)
- Supported providers: OpenAI, Anthropic, Google AI
- AES-256 client-side encryption
- Storage: IndexedDB (never sent to server unencrypted)
- Fallback: Gemini 1.5 Flash (default, no key needed)
- UI: `components/ai-keys/` — `EditApiKeyDialog.tsx`, key list, usage stats

### Analytics (Phase 8)
- Google Analytics 4 (`NEXT_PUBLIC_GA_MEASUREMENT_ID`)
- Tracked events: template usage, component generation, page views
- Performance monitoring via Cloudflare Analytics

### Deployment (Phase 8)
- Cloudflare Pages: static export (`output: 'export'`)
- Cloudflare Workers: API (`apps/api/`)
- GitHub Actions CI/CD: `.github/workflows/deploy.yml`
- Security headers: X-Frame-Options, CSP, HSTS
- Custom domain support

## Future features (not yet implemented)

| Feature | Priority | Timeline |
|---------|----------|----------|
| Real-time collaboration | High | Q3 2026 |
| Multi-model AI support | Medium | Q3 2026 |
| Plugin system | Medium | Q4 2026 |
| Voice input generation | Low | Q4 2026 |
| Enterprise features | High | Q1 2027 |
| VS Code extension | Low | TBD |
| Figma plugin | Low | TBD |
| CLI tool | Medium | TBD |
