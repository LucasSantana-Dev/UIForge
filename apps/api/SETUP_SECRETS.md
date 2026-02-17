# Cloudflare Workers Secrets Setup

Run these commands from the `apps/api` directory to configure all required secrets:

```bash
# Navigate to API directory
cd apps/api

# Set Supabase URL (get from Supabase Dashboard > Settings > API)
wrangler secret put SUPABASE_URL
# Paste: https://your-project.supabase.co

# Set Supabase Anon Key (get from Supabase Dashboard > Settings > API)
wrangler secret put SUPABASE_ANON_KEY
# Paste: your-anon-key-here

# Set Gemini API Key (get from Google AI Studio)
wrangler secret put GEMINI_API_KEY
# Paste: your-gemini-api-key-here

# Set Figma Access Token (from your .env file)
wrangler secret put FIGMA_ACCESS_TOKEN
# Paste: your-figma-access-token-here
```

## Verify Secrets

After setting all secrets, deploy and test:

```bash
npm run deploy
curl https://api.uiforge.workers.dev/health
```

The health endpoint should return `status: "healthy"` with all services connected.

## Get Credentials

### Supabase
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings > API
4. Copy `URL` and `anon/public` key

### Gemini API
1. Go to https://aistudio.google.com/app/apikey
2. Create or copy your API key

### Figma Access Token
- Already in your `.env` file as `FIGMA_ACCESS_TOKEN`
- Get from: https://www.figma.com/developers/api#access-tokens
