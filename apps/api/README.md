# UIForge API

Express API server with self-hosted MCP server, Gemini AI integration, and WebSocket collaboration.

## Features

- ✅ **Express API**: RESTful endpoints with SSE streaming
- ✅ **Self-hosted MCP Server**: Custom tools for component generation
- ✅ **Gemini Integration**: Free tier AI (1,500 req/day)
- ✅ **WebSocket**: Real-time collaboration
- ✅ **Supabase Auth**: JWT verification
- ✅ **Rate Limiting**: Per-user and global limits
- ✅ **Zero Cost**: Deploys to Cloudflare Workers free tier

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- Supabase account
- Gemini API key (free tier)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
```

### Environment Variables

Required variables in `.env`:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Gemini API (get free key at https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your-gemini-api-key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Server runs on http://localhost:3001
# Health check: http://localhost:3001/health
```

### Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Build

```bash
# TypeScript compilation
npm run build

# Type check only
npm run type-check
```

### Docker

```bash
# Build Docker image
docker build -t uiforge-api .

# Run with Docker Compose (from project root)
cd ../..
docker-compose up -d api

# View logs
docker-compose logs -f api
```

### Deployment

```bash
# Deploy to Cloudflare Workers
npm run deploy

# Development preview
npm run wrangler:dev
```

## Project Structure

```
apps/api/
├── src/
│   ├── server.ts              # Main Express app
│   ├── config/
│   │   ├── env.ts            # Environment validation
│   │   └── cors.ts           # CORS configuration
│   ├── middleware/
│   │   ├── auth.ts           # Supabase auth verification
│   │   ├── rateLimit.ts      # Rate limiting
│   │   └── errorHandler.ts   # Global error handler
│   ├── routes/
│   │   └── health.ts         # Health check endpoint
│   └── utils/
│       └── logger.ts         # Logging utility
├── tests/                    # Tests (coming soon)
├── wrangler.toml            # Cloudflare Workers config
├── package.json
└── tsconfig.json
```

## API Endpoints

### Health Check

```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-16T17:00:00.000Z",
  "services": {
    "supabase": "connected",
    "gemini": "available",
    "mcp": "not_implemented",
    "websocket": "not_implemented"
  },
  "version": "0.1.0"
}
```

## Rate Limits

- **Generation**: 10 requests/hour per user
- **Gemini API**: 15 requests/minute (global)
- **WebSocket**: 100 messages/minute per user

## Next Steps

- [ ] Phase 2: Self-hosted MCP Server + Gemini Integration
- [ ] Phase 3: Streaming Generation API
- [ ] Phase 4: WebSocket Collaboration
- [ ] Phase 5: Integration, Testing & Deployment

## License

Private - UIForge Project
