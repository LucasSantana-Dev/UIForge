create table if not exists public.generation_security_reports (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.generations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  report_version text not null default 'v1',
  scanner_name text not null,
  scanner_version text not null,
  scanner_execution text not null check (scanner_execution in ('success', 'error')),
  scanner_error_message text,
  summary_total_findings integer not null default 0 check (summary_total_findings >= 0),
  summary_by_severity jsonb not null default '{"critical":0,"high":0,"medium":0,"low":0,"info":0}'::jsonb,
  summary_by_risk_level jsonb not null default '{"high":0,"medium":0,"low":0}'::jsonb,
  findings jsonb not null default '[]'::jsonb,
  highest_risk_level text check (highest_risk_level in ('high', 'medium', 'low')),
  highest_severity text check (highest_severity in ('critical', 'high', 'medium', 'low', 'info')),
  dast_status text not null default 'not_executed',
  dast_mode text not null default 'hooks_only_v1',
  dast_reason text not null default '',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint generation_security_reports_generation_id_key unique (generation_id)
);

create index if not exists generation_security_reports_created_at_idx
  on public.generation_security_reports (created_at desc);

create index if not exists generation_security_reports_highest_risk_idx
  on public.generation_security_reports (highest_risk_level);

create index if not exists generation_security_reports_scanner_execution_idx
  on public.generation_security_reports (scanner_execution);

drop trigger if exists on_generation_security_reports_updated on public.generation_security_reports;
create trigger on_generation_security_reports_updated
  before update on public.generation_security_reports
  for each row execute function public.handle_updated_at();

alter table public.generation_security_reports enable row level security;

drop policy if exists "Users can view their own generation security reports"
  on public.generation_security_reports;
create policy "Users can view their own generation security reports"
  on public.generation_security_reports
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own generation security reports"
  on public.generation_security_reports;
create policy "Users can insert their own generation security reports"
  on public.generation_security_reports
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own generation security reports"
  on public.generation_security_reports;
create policy "Users can update their own generation security reports"
  on public.generation_security_reports
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Service role manages generation security reports"
  on public.generation_security_reports;
create policy "Service role manages generation security reports"
  on public.generation_security_reports
  for all
  to service_role
  using (true)
  with check (true);
