# UIForge Web Application

Zero-cost web application for AI-driven UI generation. Built with Next.js 15, Supabase, and Cloudflare Pages.

## Architecture

- **Frontend**: Next.js 15 + React + TypeScript + Tailwind CSS (Cloudflare Pages)
- **Backend**: Supabase (Auth + Database + Storage + Realtime)
- **Database**: PostgreSQL 15 (Supabase)
- **AI**: BYOK (Bring Your Own Key) + Gemini API fallback
- **Auth**: Supabase Auth (Email/Password + OAuth)
- **Storage**: Supabase Storage (1GB free tier)

## Project Structure

```
uiforge-webapp/
├── apps/
│   ├── web/          # Frontend React application
│   └── api/          # Cloudflare Workers API
├── packages/
│   └── shared/       # Shared types and utilities
├── turbo.json        # Turborepo configuration
└── package.json      # Root package.json
```

## Development

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Format code
npm run format
```

## Deployment

### Frontend (Cloudflare Pages)
- Automatic deployment from Git
- Connected to `apps/web` directory
- Build command: `npm run build --workspace=apps/web`
- Output directory: `apps/web/dist`

### Backend (Cloudflare Workers)
- Deploy via Wrangler CLI
- Command: `npm run deploy --workspace=apps/api`

## Environment Variables

See `.env.example` files in each app directory.

## License

MIT
