---
name: deploy-check
description: Validate deployment readiness for Siza (Vercel + Cloudflare Workers)
version: 2.1.0
tags: [deploy, vercel, cloudflare, ci, validation]
---

# Deploy Check

Pre-deploy validation for Siza. Runs all known failure-mode checks before deploying to Vercel (primary) or Cloudflare Workers (legacy).

## Checks to Run

### 1. Type Check
```bash
npm run type-check
```
- **PASS**: No TypeScript errors
- **FAIL**: Fix all type errors before deploying

### 2. Lint
```bash
npm run lint
```
- **PASS**: No lint errors
- **FAIL**: Run `npm run lint -- --fix` and review

### 3. Tests
```bash
cd apps/web && npx jest --forceExit --passWithNoTests 2>&1
```
- **PASS**: All suites pass, 0 failures
- **FAIL**: Fix failing tests before deploying

### 4. Build Verification (Vercel — Primary)
```bash
npm run build
```
- Verify `apps/web/.next/` directory exists
- Verify `apps/web/.next/BUILD_ID` exists
- **PASS**: Build completes without errors
- **FAIL**: Investigate build errors (check for missing env vars, import errors)

### 5. Build Verification (Cloudflare Workers — Legacy)
Only run if deploying to Workers:
```bash
cd apps/web && NODE_ENV=production npx opennextjs-cloudflare build
```
- Verify `.open-next/worker.js` exists
- Verify `.open-next/assets/` directory exists

### 6. Bundle Size Check (Workers only)
```bash
cd apps/web
# Stub WASM for accurate size
printf '\x00\x61\x73\x6d\x01\x00\x00\x00' > ../../node_modules/next/dist/compiled/@vercel/og/resvg.wasm
printf '\x00\x61\x73\x6d\x01\x00\x00\x00' > ../../node_modules/next/dist/compiled/@vercel/og/yoga.wasm
npx wrangler deploy --dry-run --outdir .wrangler-dry-run 2>&1 | grep "Total Upload"
```
- **PASS**: gzipped size < 3072 KiB
- **FAIL**: gzipped size >= 3072 KiB (audit new dependencies)

### 7. Environment Variables — Vercel
```bash
gh secret list -R Forge-Space/siza
```
Required secrets:
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_BASE_URL`
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`, `STRIPE_TEAM_PRICE_ID`
- `NEXT_PUBLIC_SENTRY_DSN`

Required variables:
- `NEXT_PUBLIC_ENABLE_STRIPE_BILLING=true`
- `NEXT_PUBLIC_ENABLE_USAGE_LIMITS=true`
- `NEXT_PUBLIC_ENABLE_ONBOARDING=true`

### 8. Environment Variables — Cloudflare (if applicable)
```bash
npx wrangler secret list --name siza-web 2>&1
```
Required: `GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_BASE_URL`

### 9. _redirects Check (Workers only)
```bash
[ ! -f apps/web/.open-next/assets/_redirects ] && echo "PASS" || echo "FAIL: _redirects exists — will cause infinite redirect"
```

### 10. Middleware Runtime
```bash
grep -n "runtime.*=.*'experimental-edge'" apps/web/src/middleware.ts
```
- **PASS**: Uses `experimental-edge`
- **FAIL**: Uses `edge` or `nodejs` (will break on Workers)

### 11. No Runtime Exports in API Routes
```bash
grep -rn "export const runtime" apps/web/src/app/api/ 2>/dev/null
```
- **PASS**: No matches (OpenNext handles runtime automatically)
- **FAIL**: Found runtime exports (remove them for Workers, acceptable for Vercel)

### 12. Route Coverage
```bash
npm run routes:check
```
- **PASS**: `✓ All N API routes have tests`
- **FAIL**: Run `npm run routes:scaffold <path>` then write assertions

### 13. Vercel Cron Config
```bash
cat vercel.json | python3 -c "import json,sys; d=json.load(sys.stdin); [print(c['path'], c['schedule']) for c in d.get('crons',[])]" 2>/dev/null || echo "No vercel.json or no crons"
```
- Verify each cron path has `CRON_SECRET` auth guard in route handler
- Verify cron route has unit test covering 401 and happy path

### 14. CI Workflow Status
```bash
gh run list --repo Forge-Space/siza --workflow ci.yml --limit 3 --json status,conclusion,headBranch
```
- **PASS**: Latest run on current branch is green
- **WARN**: No run yet for this branch — push and wait for CI

## Output Format
```
Deploy Check Results (target: Vercel):
  [PASS/FAIL] Type check: clean
  [PASS/FAIL] Lint: clean
  [PASS/FAIL] Tests: N passed, M failed
  [PASS/FAIL] Route coverage: N/N routes tested
  [PASS/FAIL] Build: .next/BUILD_ID exists
  [PASS/FAIL] GitHub secrets: X/17 set
  [PASS/FAIL] GitHub variables: X/3 set
  [PASS/FAIL] Middleware runtime: experimental-edge
  [PASS/FAIL] No API route runtime exports
  [PASS/FAIL] Cron routes: auth guards verified
  [PASS/FAIL] CI status: green on current branch

Overall: READY TO DEPLOY / BLOCKED (N issues)
```

## Cleanup (Workers only)
After checking, restore WASM files and remove dry-run output:
```bash
cd apps/web/../.. && npm rebuild next 2>/dev/null || true
rm -rf apps/web/.wrangler-dry-run
```

## Deploy Commands
```bash
# Vercel (primary) — triggered by merge to main
git push origin main  # deploy-web.yml auto-triggers

# Manual Vercel deploy
npx vercel build --prod && npx vercel deploy --prebuilt --prod

# Cloudflare Workers (legacy)
cd apps/web && NODE_ENV=production npx opennextjs-cloudflare build && npx wrangler deploy
```
