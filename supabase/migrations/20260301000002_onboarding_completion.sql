alter table public.profiles
  add column onboarding_completed_at timestamp with time zone;

comment on column public.profiles.onboarding_completed_at is
  'Timestamp when user completed onboarding wizard. NULL = not completed.';
