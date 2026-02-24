-- RAG Foundation: pgvector embeddings for progressive learning
-- Enables semantic search over past generations and component patterns

create extension if not exists vector;

-- Add embedding + quality columns to generations
alter table public.generations
  add column if not exists prompt_embedding vector(3072),
  add column if not exists quality_score float,
  add column if not exists user_feedback text;

alter table public.generations
  add constraint quality_score_range
  check (quality_score is null or (quality_score >= 0 and quality_score <= 1));

-- Add embedding column to components
alter table public.components
  add column if not exists embedding vector(3072);

-- Component patterns library (curated few-shot examples)
create table if not exists public.component_patterns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text not null,
  code text not null,
  framework text not null,
  embedding vector(3072),
  usage_count integer default 0,
  avg_quality_score float,
  created_at timestamptz default now()
);

alter table public.component_patterns enable row level security;

create policy "Patterns are readable by authenticated users"
  on public.component_patterns for select
  to authenticated
  using (true);

-- IVFFlat indexes for cosine similarity (efficient for < 1M rows)
create index if not exists generations_embedding_idx
  on public.generations
  using ivfflat (prompt_embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists components_embedding_idx
  on public.components
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists patterns_embedding_idx
  on public.component_patterns
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Index on quality_score for filtering high-quality examples
create index if not exists generations_quality_idx
  on public.generations (quality_score desc)
  where quality_score is not null and quality_score > 0.7;

-- Similarity search function for generations
create or replace function public.match_generations(
  query_embedding vector(3072),
  match_threshold float default 0.7,
  match_count int default 5,
  min_quality float default 0.7
)
returns table (
  id uuid,
  prompt text,
  generated_code text,
  framework text,
  quality_score float,
  similarity float
)
language sql stable
as $$
  select
    g.id,
    g.prompt,
    g.generated_code,
    g.framework,
    g.quality_score,
    1 - (g.prompt_embedding <=> query_embedding) as similarity
  from public.generations g
  where g.prompt_embedding is not null
    and g.generated_code is not null
    and g.status = 'completed'
    and (g.quality_score is null or g.quality_score >= min_quality)
    and 1 - (g.prompt_embedding <=> query_embedding) > match_threshold
  order by g.prompt_embedding <=> query_embedding
  limit match_count;
$$;

-- Similarity search function for component patterns
create or replace function public.match_patterns(
  query_embedding vector(3072),
  match_threshold float default 0.5,
  match_count int default 3
)
returns table (
  id uuid,
  name text,
  category text,
  description text,
  code text,
  framework text,
  similarity float
)
language sql stable
as $$
  select
    p.id,
    p.name,
    p.category,
    p.description,
    p.code,
    p.framework,
    1 - (p.embedding <=> query_embedding) as similarity
  from public.component_patterns p
  where p.embedding is not null
    and 1 - (p.embedding <=> query_embedding) > match_threshold
  order by p.embedding <=> query_embedding
  limit match_count;
$$;
