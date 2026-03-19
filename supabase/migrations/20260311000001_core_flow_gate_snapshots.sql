create table if not exists public.core_flow_gate_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_date date not null,
  total_users integer not null default 0 check (total_users >= 0),
  onboarded_users integer not null default 0 check (onboarded_users >= 0),
  users_with_project integer not null default 0 check (users_with_project >= 0),
  users_with_completed_generation integer not null default 0 check (users_with_completed_generation >= 0),
  qualified_users integer not null default 0 check (qualified_users >= 0),
  qualified_ratio numeric(5, 2) not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create unique index if not exists core_flow_gate_snapshots_snapshot_date_key
  on public.core_flow_gate_snapshots (snapshot_date);

create index if not exists core_flow_gate_snapshots_snapshot_date_idx
  on public.core_flow_gate_snapshots (snapshot_date desc);

drop trigger if exists on_core_flow_gate_snapshots_updated on public.core_flow_gate_snapshots;
create trigger on_core_flow_gate_snapshots_updated
  before update on public.core_flow_gate_snapshots
  for each row execute function public.handle_updated_at();

alter table public.core_flow_gate_snapshots enable row level security;

drop policy if exists "Service role manages core flow gate snapshots" on public.core_flow_gate_snapshots;
create policy "Service role manages core flow gate snapshots"
  on public.core_flow_gate_snapshots
  for all
  to service_role
  using (true)
  with check (true);
