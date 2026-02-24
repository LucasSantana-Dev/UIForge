alter table public.generations
  add column if not exists component_name text,
  add column if not exists generated_code text,
  add column if not exists component_library text,
  add column if not exists style text,
  add column if not exists typescript boolean default false;

alter table public.generations
  add constraint component_name_length
  check (component_name is null or char_length(component_name) <= 100);

alter table public.generations
  drop constraint if exists generations_status_check;

alter table public.generations
  add constraint generations_status_check
  check (status in ('pending', 'in_progress', 'processing', 'completed', 'failed'));
