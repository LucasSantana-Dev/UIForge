# Siza

> **Zero-cost AI-powered UI generation platform**
>
> Transform ideas into production-ready code with AI. Built with Next.js 16, Supabase, and modern web technologies. 100% free.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.0-blue)](https://www.typescriptlang.org/)
[![Test Coverage](https://img.shields.io/badge/Coverage-25%25-red)](https://github.com/Forge-Space/siza/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](CONTRIBUTING.md)
[![Code Quality](https://img.shields.io/badge/Quality-A-brightgreen)](https://github.com/Forge-Space/siza/actions)
[![Security](https://img.shields.io/badge/Security-Passed-brightgreen)](https://github.com/Forge-Space/siza/security)
[![Deployment](https://img.shields.io/badge/Deploy-Cloudflare_Workers-orange)](https://workers.cloudflare.com/)
[![Database](https://img.shields.io/badge/Database-Supabase-3ECF8E)](https://supabase.com/)
[![UI Framework](https://img.shields.io/badge/UI-shadcn/ui-000000)](https://ui.shadcn.com/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind_CSS-06B6D4)](https://tailwindcss.com/)
[![Monorepo](https://img.shields.io/badge/Monorepo-Turborepo-FF6B35)](https://turbo.build/)
[![AI Integration](https://img.shields.io/badge/AI-MCP-8B5CF6)](https://modelcontextprotocol.io/)
[![Free](https://img.shields.io/badge/Free-Forever-10B981)](https://siza-web.uiforge.workers.dev)

**Live**: [siza-web.uiforge.workers.dev](https://siza-web.uiforge.workers.dev)

## Features

- 🎨 **AI-Powered Generation** - Natural language or screenshot to production-ready UI components
- 🔐 **Privacy-First** - Bring Your Own Key (BYOK) with client-side encryption
- 💰 **Zero-Cost** - 100% free tier architecture (up to 50,000 users)
- 🚀 **Modern Stack** - Next.js 16, Supabase, shadcn/ui, TypeScript
- 📱 **Responsive Design** - Mobile-first with dark mode optimized
- ⚡ **Real-time Updates** - Live collaboration via Supabase subscriptions
- 🎯 **Production Ready** - Monaco editor, live preview, export functionality
- 🧪 **Well Tested** - 80%+ test coverage with Playwright E2E tests

## 🏗️ Architecture

### Frontend Layer
- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui design system
- **State**: Zustand (minimal re-renders)
- **Editor**: Monaco Editor (VS Code engine)
- **Hosting**: Cloudflare Workers via OpenNext (unlimited bandwidth)

### Backend Layer
- **Database**: PostgreSQL 15 via Supabase
- **Auth**: Supabase Auth (Email/Password + OAuth)
- **Storage**: Supabase Storage (1GB free tier)
- **Realtime**: Supabase Realtime subscriptions
- **API**: Next.js API routes + MCP integration

### AI Integration
- **Primary**: Gemini 2.0 Flash (15 RPM free tier) via direct SDK calls
- **Vision**: Multimodal image input — upload UI screenshots for analysis and generation
- **BYOK**: Bring Your Own Key (Google AI) with client-side AES-256 encryption
- **Streaming**: Server-Sent Events (SSE) for real-time generation output
- **Protocol**: Model Context Protocol (MCP) for extensible AI tools

## 🚀 Quick Start

### Prerequisites

- **Node.js** 22.x or later
- **npm** 10.x or later
- **Docker Desktop** (for local Supabase)
- **Git** for version control

### Installation

```bash
# Clone the repository
git clone https://github.com/Forge-Space/siza.git
cd siza

# Install dependencies
npm install

# Start local Supabase (first time takes 10-15 minutes)
supabase start

# Apply database migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > apps/web/src/lib/supabase/database.types.ts

# Start development server
npm run dev
```

**Access Points**:
- 🌐 Web App: http://localhost:3000
- 🗄️ Supabase Studio: http://localhost:54323

### Environment Setup

Create `apps/web/.env.local`:

```env
# Supabase (Local)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key

# Feature Flags
NEXT_PUBLIC_ENABLE_BYOK=true
NEXT_PUBLIC_ENABLE_GEMINI_FALLBACK=true
```

> 💡 **Tip**: Use the credentials shown after `supabase start` to fill in the environment variables.

## 📁 Project Structure

```
siza/
├── apps/
│   ├── web/                 # Next.js 16 frontend application
│   │   ├── src/
│   │   │   ├── app/         # App Router pages & API routes
│   │   │   ├── components/  # React components (shadcn/ui)
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── lib/         # Utilities & configurations
│   │   │   └── stores/      # Zustand state management
│   │   ├── e2e/             # Playwright E2E tests
│   │   └── public/          # Static assets
│   └── api/                 # Cloudflare Workers API
├── packages/
│   └── eslint-config/       # Shared ESLint configuration
├── supabase/                # Database migrations & setup
├── turbo.json              # Turborepo configuration
└── package.json            # Root package configuration
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev                 # Start development server (localhost:3000)
npm run build               # Build for production
npm run start               # Start production server

# Code Quality
npm run lint                # Run ESLint
npm run lint:fix            # Fix ESLint issues
npm run format              # Format code with Prettier
npm run type-check          # TypeScript type checking

# Testing
npm test                    # Run unit tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
npm run test:e2e            # Run E2E tests
npm run test:e2e:ui         # Playwright UI mode

# Dependencies
npm run deps:check          # Check for updates
npm run deps:update         # Update dependencies
npm run clean               # Clean all build artifacts
```

### Technology Stack

**Frontend**:
- ⚛️ React 19 with Next.js 16 App Router
- 🎨 Tailwind CSS + shadcn/ui component library
- 📝 TypeScript (strict mode)
- 🔄 Zustand for state management
- 📝 React Hook Form + Zod validation
- 🎨 Monaco Editor for code editing
- 🧪 Jest + React Testing Library
- 🎭 Playwright for E2E testing

**Backend**:
- 🗄️ Supabase (PostgreSQL 15)
- 🔐 Supabase Auth (Email + OAuth)
- 📁 Supabase Storage (1GB free)
- ⚡ Supabase Realtime subscriptions
- 🤖 Model Context Protocol (MCP) integration

**Infrastructure**:
- 🌐 Cloudflare Workers via OpenNext (hosting)
- 🐳 Docker & Docker Compose
- 🔄 GitHub Actions (CI/CD)
- 📊 Turborepo (monorepo management)

### Key Features Implementation

#### ✅ Completed Features
- **Authentication**: Email/password + Google/GitHub OAuth
- **Database**: Complete schema with RLS policies
- **Storage**: Secure file upload with policies
- **UI System**: shadcn/ui components (8+ components)
- **Project Management**: Full CRUD operations
- **Code Editor**: Monaco integration with syntax highlighting
- **Component Generation**: SSE streaming with quality gates and RAG enrichment
- **Image Recognition**: Upload UI screenshots for AI-powered component generation
- **BYOK**: Bring Your Own Key with client-side AES-256 encryption
- **Real-time Updates**: Supabase subscriptions
- **Cloudflare Workers Deployment**: OpenNext adapter with `nodejs_compat`, automated CI/CD

#### 🚧 In Progress
- **Live Preview**: Iframe sandbox for components
- **Export Features**: Download and deployment options

#### ⏳ Planned Features
- **Template Library**: Pre-built component templates
- **Collaboration**: Real-time multi-user editing
- **Advanced Export**: GitHub, Vercel, Netlify deployment

## 🚀 Deployment

### Production Deployment

#### Frontend (Cloudflare Workers via OpenNext)

Deployment is automated via GitHub Actions (`deploy-web.yml`) on push to `dev` or `main`.

1. **Set GitHub Secrets**:
   - `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_BASE_URL`

2. **Manual Deploy**: Use the "Deploy Web App (Admin Only)" workflow dispatch

3. **Environment Variables** (set in Cloudflare dashboard):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
   NEXT_PUBLIC_BASE_URL=https://siza.com
   NEXT_PUBLIC_ENABLE_BYOK=true
   NEXT_PUBLIC_ENABLE_GEMINI_FALLBACK=true
   ```

#### Backend (Supabase Cloud)

1. **Create Project**: Go to [database.new](https://database.new)
2. **Apply Migrations**: `supabase db push`
3. **Configure Auth**: Set up OAuth providers
4. **Set up Storage**: Create buckets and policies

### Zero-Cost Architecture

Siza maintains 100% free operation through:

- **Cloudflare Workers**: Unlimited hosting & bandwidth
- **Supabase Free Tier**: 50,000 MAU, 500MB DB, 1GB storage
- **Gemini API**: 60 requests/minute fallback
- **GitHub Actions**: 2,000 build minutes/month

**Scaling Strategy**:
- Monitor usage via Supabase dashboard
- Optimize database queries and indexing
- Compress files and clean up old data
- Upgrade to Pro tiers only when needed (still cost-effective)

## 🧪 Testing

### Test Strategy

- **Unit Tests**: Jest + React Testing Library (80% coverage target)
- **E2E Tests**: Playwright for critical user flows
- **Component Tests**: Isolated component testing
- **Performance**: Core Web Vitals monitoring
- **Accessibility**: WCAG 2.1 AA compliance

### Running Tests

```bash
# Unit tests
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report

# E2E tests
npm run test:e2e            # Run E2E tests
npm run test:e2e:ui         # Playwright UI mode
npm run test:e2e:debug      # Debug mode
```

### Test Coverage Areas

- ✅ Authentication flows (signin, signup, OAuth)
- ✅ Project CRUD operations
- ✅ Component generation UI
- 🚧 AI integration (with mocking)
- ⏳ File upload and storage
- ⏳ Real-time collaboration

## 📖 Documentation

- **[Setup Guide](./docs/SETUP_GUIDE.md)** - Detailed setup instructions
- **[Database Schema](./docs/DATABASE_SCHEMA.md)** - Database structure and RLS policies
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment steps
- **[Dark Mode Guide](./docs/DARK_MODE_GUIDE.md)** - UI design system documentation
- **[Project Plan](./plan.MD)** - Complete project roadmap and architecture

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Install** dependencies: `npm install`
4. **Make** your changes
5. **Test** your changes: `npm test` and `npm run test:e2e`
6. **Format** code: `npm run format`
7. **Commit** changes: `git commit -m 'Add amazing feature'`
8. **Push** to branch: `git push origin feature/amazing-feature`
9. **Open** a Pull Request

### Code Standards

- **TypeScript**: Strict mode, no `any` types
- **ESLint**: Follow Next.js configuration
- **Prettier**: Auto-format on commit
- **Components**: Use shadcn/ui design system
- **Tests**: 80% coverage required for new features
- **Docs**: Update relevant documentation

### Project Structure Guidelines

- **Components**: Place in `apps/web/src/components/`
- **Pages**: Use App Router structure in `apps/web/src/app/`
- **Hooks**: Custom hooks in `apps/web/src/hooks/`
- **Stores**: Zustand stores in `apps/web/src/stores/`
- **Utils**: Helper functions in `apps/web/src/lib/`
- **Types**: TypeScript types in `apps/web/src/types/`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Supabase](https://supabase.com)** - Amazing open-source Firebase alternative
- **[Next.js](https://nextjs.org/)** - React framework for production
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful component library
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - VS Code editor in the browser
- **[Model Context Protocol](https://modelcontextprotocol.io/)** - AI integration standard

## 📞 Support

- 📖 **Documentation**: Check the [docs](./docs/) folder
- 🐛 **Issues**: [Open an issue on GitHub](https://github.com/Forge-Space/siza/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Forge-Space/siza/discussions)
- 📧 **Email**: support@siza.dev

---

<div align="center">
  <p>Built with ❤️ by the Siza team</p>
  <p>Making AI-powered UI development accessible to everyone</p>
</div>
