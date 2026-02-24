-- Subscriptions & Usage Tracking
-- Migration: 20260224000004
-- Description: Stripe billing tables, usage tracking, and plan limits

-- ============================================================================
-- PLAN LIMITS
-- ============================================================================

create table public.plan_limits (
  id uuid default gen_random_uuid() primary key,
  plan text not null unique check (plan in ('free', 'pro', 'enterprise')),
  generations_per_month integer not null,
  max_projects integer not null,
  max_components_per_project integer not null,
  features jsonb default '{}'::jsonb
);

alter table public.plan_limits enable row level security;

create policy "Anyone can read plan limits"
  on public.plan_limits for select
  to authenticated, anon
  using (true);

-- Seed plan limits
insert into public.plan_limits (plan, generations_per_month, max_projects, max_components_per_project, features)
values
  ('free', 10, 2, 50, '{"analytics": false, "multi_llm": false, "priority_support": false}'::jsonb),
  ('pro', 500, -1, -1, '{"analytics": true, "multi_llm": true, "priority_support": true}'::jsonb),
  ('enterprise', -1, -1, -1, '{"analytics": true, "multi_llm": true, "priority_support": true, "sso": true, "audit_log": true}'::jsonb);

-- ============================================================================
-- SUBSCRIPTIONS
-- ============================================================================

create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  user_id uuid references auth.users on delete cascade not null unique,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'enterprise')),
  status text not null default 'active' check (
    status in ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'paused')
  ),
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false
);

alter table public.subscriptions enable row level security;

create policy "Users can read their own subscription"
  on public.subscriptions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Service role manages subscriptions"
  on public.subscriptions for all
  to service_role
  using (true);

create or replace function public.update_subscription_timestamp()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row
  execute function public.update_subscription_timestamp();

-- ============================================================================
-- USAGE TRACKING
-- ============================================================================

create table public.usage_tracking (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  user_id uuid references auth.users on delete cascade not null,
  billing_period_start timestamp with time zone not null,
  billing_period_end timestamp with time zone not null,
  generations_count integer not null default 0,
  tokens_used bigint not null default 0,
  projects_count integer not null default 0,
  generations_limit integer not null default 10,
  projects_limit integer not null default 2,

  constraint unique_user_period unique (user_id, billing_period_start)
);

alter table public.usage_tracking enable row level security;

create policy "Users can read their own usage"
  on public.usage_tracking for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Service role manages usage"
  on public.usage_tracking for all
  to service_role
  using (true);

-- ============================================================================
-- STRIPE EVENTS (IDEMPOTENCY)
-- ============================================================================

create table public.stripe_events (
  id text primary key,
  type text not null,
  processed boolean not null default false,
  payload jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.stripe_events enable row level security;

create policy "Service role manages stripe events"
  on public.stripe_events for all
  to service_role
  using (true);

-- ============================================================================
-- AUTO-CREATE FREE SUBSCRIPTION FOR NEW USERS
-- ============================================================================

create or replace function public.create_default_subscription()
returns trigger as $$
begin
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created_subscription
  after insert on public.profiles
  for each row
  execute function public.create_default_subscription();
