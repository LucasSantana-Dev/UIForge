# Stripe Billing System

## Plan Tiers
- **Free**: No Stripe subscription, default on signup
- **Pro**: Monthly subscription, higher limits
- **Team**: Multi-seat, team billing

## Key Architecture
- `getPlanFromPriceId()` in `lib/stripe/plans.ts` — single source of truth for plan resolution
- Webhook handler: `app/api/stripe/webhook/route.ts` — must handle all 3 plan types
- DB constraints: `plan_limits` + `subscriptions` tables with CHECK constraints

## Webhook Events Handled
- `checkout.session.completed` — create subscription record
- `customer.subscription.updated` — sync plan changes
- `customer.subscription.deleted` — downgrade to free

## Key Files
- `lib/stripe/plans.ts` — Plan definitions, price ID mapping
- `lib/stripe/server.ts` — Stripe server SDK initialization
- `lib/stripe/client.ts` — Stripe client SDK
- `app/api/stripe/webhook/route.ts` — Webhook handler
- `components/billing/` — PricingCard, SubscriptionStatus, UsageChart, UpgradePrompt

## Local Testing
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Testing (v0.4.0)
- 19 webhook tests in `__tests__/lib/stripe/webhooks.test.ts`
- Covers: verifyWebhookSignature, isEventProcessed, handleCheckoutCompleted, handleSubscriptionUpdated, handleSubscriptionDeleted, processWebhookEvent
- Plan detection: pro, team, unknown (defaults to pro), missing (defaults to free)

## Production State (2026-02-25)
- GitHub secrets: 6 Stripe keys configured (sandbox/test mode)
- Webhook endpoint: `we_1T4Wal...` → `siza-web.uiforge.workers.dev/api/stripe/webhook`
- Feature flags: `ENABLE_STRIPE_BILLING=false`, `ENABLE_USAGE_LIMITS=false`
- Missing: `SUPABASE_SERVICE_ROLE_KEY` (needed for webhook DB writes)
- To enable: flip both flags to `true`, add service role key, redeploy
