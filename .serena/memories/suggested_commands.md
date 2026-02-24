# Siza Common Development Commands

## Development Server
```bash
npm run dev              # Start Next.js dev server (localhost:3000)
npm run dev:api          # Start Cloudflare Workers dev server (localhost:8787)
```

## Build & Production
```bash
npm run build            # Production build (Next.js)
npm run build:api        # Build Cloudflare Workers API
npm run start            # Start production server (after build)
```

## Code Quality
```bash
npm run lint             # ESLint + Prettier check
npm run lint:fix         # ESLint + Prettier auto-fix
npm run format           # Prettier format all files
npm run type-check       # TypeScript type checking
```

## Testing
```bash
npm run test             # Jest unit tests
npm run test:watch       # Jest watch mode
npm run test:coverage    # Generate coverage report
npm run e2e              # Playwright E2E tests
npm run e2e:ui           # Playwright UI mode
```

## Database (Supabase)
```bash
npm run db:migrate       # Run database migrations
npm run db:reset         # Reset local database
npm run db:seed          # Seed database with test data
npx supabase status      # Check Supabase connection
```

## Deployment (Cloudflare Workers via OpenNext)
```bash
NODE_ENV=production npx opennextjs-cloudflare build  # Build for Workers
npx wrangler deploy                                   # Deploy to Cloudflare Workers
npx wrangler pages dev                                # Local Workers preview
```

## Utilities
```bash
npm run clean            # Clean build artifacts
npm run deps:update      # Check for dependency updates
npm run analyze          # Analyze bundle size
```

## Production Health & Deploy
```bash
curl https://siza-web.uiforge.workers.dev/api/health    # Check production health
cd apps/web && ./scripts/deploy.sh                        # Manual deploy script
gh workflow run deploy-web.yml --ref dev -R Forge-Space/siza  # Trigger CI deploy
```

## Git Workflow
```bash
git checkout -b feat/feature-name    # Create feature branch
npm run lint && npm run test         # Pre-commit checks
git commit -m "feat: description"    # Conventional commit
```
