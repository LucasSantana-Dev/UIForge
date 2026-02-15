# UIForge Webapp - Quick Start

Get up and running in 5 minutes.

## Prerequisites

- Node.js 20+
- Docker Desktop
- Supabase CLI

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start Supabase
supabase start

# 3. Copy environment variables (from supabase start output)
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your Supabase credentials

# 4. Start dev server
npm run dev
```

## Access

- **Web App**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323
- **API Docs**: See `docs/DATABASE_SCHEMA.md`

## Next Steps

1. Create an account at http://localhost:3000/sign-up
2. Create your first project
3. Generate a component

## Documentation

- [Setup Guide](docs/SETUP_GUIDE.md) - Detailed setup instructions
- [Database Schema](docs/DATABASE_SCHEMA.md) - Database documentation
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment
- [Project Plan](plan.MD) - Complete project documentation

## Troubleshooting

**Supabase won't start?**
- Ensure Docker Desktop is running
- Try: `supabase stop --no-backup && supabase start`

**Build fails?**
- Clear cache: `rm -rf .next node_modules && npm install`
- Check Node version: `node --version` (should be 20+)

**Database errors?**
- Apply migrations: `supabase db reset`
- Check connection: `supabase status`

## Support

See [SETUP_GUIDE.md](docs/SETUP_GUIDE.md) for detailed troubleshooting.
