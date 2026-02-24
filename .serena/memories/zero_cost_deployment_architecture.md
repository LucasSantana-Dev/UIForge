# Siza Zero-Cost Deployment Architecture

## Hosting Strategy
All services use free tier plans - zero infrastructure cost.

## Frontend Hosting
- **Platform**: Vercel (migrated from Cloudflare Pages)
- **Framework**: Next.js 14
- **Deployment**: Auto-deploy from `main` branch via GitHub integration
- **Domain**: siza.dev (planned)
- **CDN**: Vercel Edge Network (global)
- **Free Tier**: 100GB bandwidth/month, unlimited deployments

## API Hosting
- **Platform**: Cloudflare Workers
- **Endpoint**: api.siza.workers.dev
- **Runtime**: V8 isolates (edge)
- **Free Tier**: 100k requests/day, 10ms CPU time per request
- **Deployment**: Wrangler CLI (`npx wrangler deploy`)

## Database & Auth
- **Platform**: Supabase
- **Services**: PostgreSQL + Auth + Storage
- **Free Tier**: 500MB database, 1GB file storage, 50k monthly active users
- **Connection**: Direct from Cloudflare Workers via connection pooling
- **Region**: US East (closest to Cloudflare edge)

## AI Services
- **Model**: BYOK (bring your own keys)
- **Providers**: OpenAI, Anthropic
- **Cost**: User-provided API keys (no platform cost)
- **Encryption**: AES-256-GCM for key storage

## CI/CD
- **Platform**: GitHub Actions
- **Free Tier**: 2000 minutes/month for private repos
- **Workflows**: Lint, test, build on PR
- **Auto-deploy**: Vercel/Cloudflare on merge to `main`

## Monitoring
- **Frontend**: Vercel Analytics (free tier)
- **API**: Cloudflare Workers Analytics (free tier)
- **Database**: Supabase dashboard metrics

## Cost Summary
- Total monthly cost: $0 (within free tier limits)
- Scales to ~50k MAU before paid tier required
