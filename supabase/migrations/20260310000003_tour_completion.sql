alter table public.profiles
  add column if not exists tour_completed_at timestamptz;
