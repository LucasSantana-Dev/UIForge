-- Add conversation chain support for iterative refinement
-- parent_generation_id links a refinement to its predecessor

alter table public.generations
  add column if not exists parent_generation_id uuid references public.generations(id) on delete set null;

create index if not exists generations_parent_id_idx on public.generations (parent_generation_id);

-- Update ai_provider constraint to include mcp-gateway and mcp-specialist
alter table public.generations
  drop constraint if exists generations_ai_provider_check;
alter table public.generations
  add constraint generations_ai_provider_check
  check (ai_provider in ('openai', 'anthropic', 'google', 'gemini-fallback', 'mcp-gateway', 'mcp-specialist'));
