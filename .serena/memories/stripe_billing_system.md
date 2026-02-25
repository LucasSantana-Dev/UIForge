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

## Bug Fixes (v0.3.0)
- `getPlanFromPriceId()` was missing Team plan mapping
- Team plan migration added (supabase migration)
- `STRIPE_TEAM_PRICE_ID` env var required
- 5 webhook integration tests added
