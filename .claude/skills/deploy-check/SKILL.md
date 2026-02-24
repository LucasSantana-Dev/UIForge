---
name: deploy-check
description: Validate Cloudflare Workers deployment readiness for Siza
disable-model-invocation: true
---

# Deploy Check

Pre-deploy validation for Siza's Cloudflare Workers deployment. Checks all known failure modes before deploying.

## Checks to Run

### 1. Build Verification
```bash
cd apps/web && NODE_ENV=production npx opennextjs-cloudflare build
```
- Verify `.open-next/worker.js` exists
- Verify `.open-next/assets/` directory exists

### 2. Bundle Size Check
```bash
cd apps/web
# Stub WASM for accurate size
printf '\x00\x61\x73\x6d\x01\x00\x00\x00' > ../../node_modules/next/dist/compiled/@vercel/og/resvg.wasm
printf '\x00\x61\x73\x6d\x01\x00\x00\x00' > ../../node_modules/next/dist/compiled/@vercel/og/yoga.wasm
npx wrangler deploy --dry-run --outdir .wrangler-dry-run 2>&1 | grep "Total Upload"
```
- **PASS**: gzipped size < 3072 KiB
- **FAIL**: gzipped size >= 3072 KiB (investigate new dependencies adding weight)

### 3. _redirects Check
```bash
[ ! -f apps/web/.open-next/assets/_redirects ] && echo "PASS" || echo "FAIL: _redirects exists — will cause infinite redirect"
```

### 4. Environment Variables
Check Workers secrets are set:
```bash
npx wrangler secret list --name siza-web 2>&1
```
Required: `GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_BASE_URL`

### 5. GitHub Secrets
```bash
gh secret list -R Forge-Space/siza
```
Required: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_BASE_URL`

### 6. Middleware Runtime
```bash
grep -n "runtime.*=.*'experimental-edge'" apps/web/src/middleware.ts
```
- **PASS**: Uses `experimental-edge`
- **FAIL**: Uses `edge` or `nodejs` (will break on Workers)

### 7. No Runtime Exports in API Routes
```bash
grep -rn "export const runtime" apps/web/src/app/api/ 2>/dev/null
```
- **PASS**: No matches (OpenNext handles runtime automatically)
- **FAIL**: Found runtime exports (remove them)

## Output Format
```
Deploy Check Results:
  [PASS/FAIL] Build: .open-next/worker.js exists
  [PASS/FAIL] Bundle: XXXX KiB gzipped (limit: 3072 KiB)
  [PASS/FAIL] No _redirects file
  [PASS/FAIL] Workers secrets: X/4 set
  [PASS/FAIL] GitHub secrets: X/5 set
  [PASS/FAIL] Middleware runtime: experimental-edge
  [PASS/FAIL] No API route runtime exports

Overall: READY TO DEPLOY / BLOCKED (N issues)
```

## Cleanup
After checking, restore WASM files and remove dry-run output:
```bash
cd apps/web/../.. && npm rebuild next 2>/dev/null || true
rm -rf apps/web/.wrangler-dry-run
```
