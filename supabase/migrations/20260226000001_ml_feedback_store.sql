-- ML Feedback & Embeddings Store
-- Replaces MongoDB-style document store with pgvector on Supabase
-- Supports: structured feedback, vector similarity search, training pipeline

-- ============================================================
-- 1. ML Feedback table (structured generation feedback)
-- ============================================================

create table if not exists public.ml_feedback (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid references public.generations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  prompt text not null,
  component_type text,
  variant text,
  mood text,
  industry text,
  style text,
  score real not null check (score >= -1 and score <= 2),
  feedback_type text not null check (feedback_type in ('explicit', 'implicit')),
  rating text check (rating in ('positive', 'negative', 'neutral')),
  confidence real check (confidence >= 0 and confidence <= 1),
  code_hash text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

alter table public.ml_feedback enable row level security;

create policy "Users can view own feedback"
  on public.ml_feedback for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own feedback"
  on public.ml_feedback for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Service role has full access to feedback"
  on public.ml_feedback for all
  to service_role
  using (true)
  with check (true);

create index ml_feedback_generation_idx on public.ml_feedback (generation_id);
create index ml_feedback_type_idx on public.ml_feedback (feedback_type);
create index ml_feedback_score_idx on public.ml_feedback (score desc);
create index ml_feedback_user_idx on public.ml_feedback (user_id);
create index ml_feedback_created_idx on public.ml_feedback (created_at desc);
create index ml_feedback_component_type_idx on public.ml_feedback (component_type)
  where component_type is not null;

-- ============================================================
-- 2. ML Embeddings table (generalized vector store)
-- ============================================================

create table if not exists public.ml_embeddings (
  id uuid primary key default gen_random_uuid(),
  source_id text not null,
  source_type text not null check (
    source_type in ('component', 'pattern', 'prompt', 'description', 'rule', 'generation')
  ),
  content text not null,
  embedding vector(1536),
  model text not null default 'text-embedding-ada-002',
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  unique (source_id, source_type)
);

alter table public.ml_embeddings enable row level security;

create policy "Embeddings are readable by authenticated users"
  on public.ml_embeddings for select
  to authenticated
  using (true);

create policy "Service role manages embeddings"
  on public.ml_embeddings for all
  to service_role
  using (true)
  with check (true);

create index ml_embeddings_source_type_idx on public.ml_embeddings (source_type);
create index ml_embeddings_model_idx on public.ml_embeddings (model);
create index ml_embeddings_hnsw_idx on public.ml_embeddings
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- ============================================================
-- 3. ML Training Runs table
-- ============================================================

create table if not exists public.ml_training_runs (
  id uuid primary key default gen_random_uuid(),
  adapter text not null check (
    adapter in ('quality-scorer', 'prompt-enhancer', 'style-recommender')
  ),
  status text not null default 'idle' check (
    status in ('idle', 'preparing', 'training', 'complete', 'failed')
  ),
  progress real not null default 0 check (progress >= 0 and progress <= 100),
  examples_count integer default 0,
  metrics jsonb default '{}',
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.ml_training_runs enable row level security;

create policy "Training runs are readable by authenticated users"
  on public.ml_training_runs for select
  to authenticated
  using (true);

create policy "Service role manages training runs"
  on public.ml_training_runs for all
  to service_role
  using (true)
  with check (true);

create index ml_training_runs_adapter_idx on public.ml_training_runs (adapter);
create index ml_training_runs_status_idx on public.ml_training_runs (status);

-- ============================================================
-- 4. HNSW indexes on existing vector columns (production only)
-- ============================================================

create index if not exists generations_embedding_hnsw_idx
  on public.generations
  using hnsw (prompt_embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

create index if not exists components_embedding_hnsw_idx
  on public.components
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

create index if not exists patterns_embedding_hnsw_idx
  on public.component_patterns
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- ============================================================
-- 5. Similarity search on ml_embeddings
-- ============================================================

create or replace function public.match_embeddings(
  query_embedding vector(1536),
  match_threshold float default 0.5,
  match_count int default 10,
  filter_source_type text default null
)
returns table (
  id uuid,
  source_id text,
  source_type text,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    e.id,
    e.source_id,
    e.source_type,
    e.content,
    e.metadata,
    1 - (e.embedding <=> query_embedding) as similarity
  from public.ml_embeddings e
  where e.embedding is not null
    and (filter_source_type is null or e.source_type = filter_source_type)
    and 1 - (e.embedding <=> query_embedding) > match_threshold
  order by e.embedding <=> query_embedding
  limit match_count;
$$;

-- ============================================================
-- 6. Feedback aggregation functions
-- ============================================================

create or replace function public.ml_feedback_summary(
  filter_component_type text default null,
  filter_mood text default null,
  filter_industry text default null,
  days_back int default 30
)
returns table (
  component_type text,
  total_count bigint,
  avg_score real,
  positive_count bigint,
  negative_count bigint,
  explicit_count bigint,
  implicit_count bigint,
  avg_confidence real
)
language sql stable
as $$
  select
    f.component_type,
    count(*) as total_count,
    avg(f.score)::real as avg_score,
    count(*) filter (where f.rating = 'positive') as positive_count,
    count(*) filter (where f.rating = 'negative') as negative_count,
    count(*) filter (where f.feedback_type = 'explicit') as explicit_count,
    count(*) filter (where f.feedback_type = 'implicit') as implicit_count,
    avg(f.confidence)::real as avg_confidence
  from public.ml_feedback f
  where f.created_at > now() - (days_back || ' days')::interval
    and (filter_component_type is null or f.component_type = filter_component_type)
    and (filter_mood is null or f.mood = filter_mood)
    and (filter_industry is null or f.industry = filter_industry)
  group by f.component_type
  order by total_count desc;
$$;

create or replace function public.ml_feedback_trend(
  filter_component_type text default null,
  days_back int default 30,
  bucket_hours int default 24
)
returns table (
  bucket timestamptz,
  avg_score real,
  count bigint
)
language sql stable
as $$
  select
    date_trunc('hour', f.created_at) -
      (extract(hour from f.created_at)::int % bucket_hours) * interval '1 hour'
      as bucket,
    avg(f.score)::real as avg_score,
    count(*) as count
  from public.ml_feedback f
  where f.created_at > now() - (days_back || ' days')::interval
    and (filter_component_type is null or f.component_type = filter_component_type)
  group by bucket
  order by bucket;
$$;
