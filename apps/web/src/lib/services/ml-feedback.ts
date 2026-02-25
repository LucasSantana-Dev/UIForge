import { createClient } from '@/lib/supabase/server';

export type FeedbackType = 'explicit' | 'implicit';
export type FeedbackRating = 'positive' | 'negative' | 'neutral';

export interface MlFeedback {
  id: string;
  generation_id: string | null;
  user_id: string | null;
  prompt: string;
  component_type: string | null;
  variant: string | null;
  mood: string | null;
  industry: string | null;
  style: string | null;
  score: number;
  feedback_type: FeedbackType;
  rating: FeedbackRating | null;
  confidence: number | null;
  code_hash: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface FeedbackSummary {
  component_type: string | null;
  total_count: number;
  avg_score: number;
  positive_count: number;
  negative_count: number;
  explicit_count: number;
  implicit_count: number;
  avg_confidence: number | null;
}

export interface FeedbackTrend {
  bucket: string;
  avg_score: number;
  count: number;
}

export interface SimilarEmbedding {
  id: string;
  source_id: string;
  source_type: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

export async function recordFeedback(params: {
  generationId?: string;
  prompt: string;
  componentType?: string;
  variant?: string;
  mood?: string;
  industry?: string;
  style?: string;
  score: number;
  feedbackType: FeedbackType;
  rating?: FeedbackRating;
  confidence?: number;
  codeHash?: string;
  metadata?: Record<string, unknown>;
}): Promise<MlFeedback> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('ml_feedback')
    .insert({
      generation_id: params.generationId ?? null,
      user_id: user?.id ?? null,
      prompt: params.prompt,
      component_type: params.componentType ?? null,
      variant: params.variant ?? null,
      mood: params.mood ?? null,
      industry: params.industry ?? null,
      style: params.style ?? null,
      score: params.score,
      feedback_type: params.feedbackType,
      rating: params.rating ?? null,
      confidence: params.confidence ?? null,
      code_hash: params.codeHash ?? null,
      metadata: params.metadata ?? {},
    })
    .select()
    .single();

  if (error) throw error;
  return data as MlFeedback;
}

export async function getFeedbackSummary(options?: {
  componentType?: string;
  mood?: string;
  industry?: string;
  daysBack?: number;
}): Promise<FeedbackSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('ml_feedback_summary', {
    filter_component_type: options?.componentType ?? null,
    filter_mood: options?.mood ?? null,
    filter_industry: options?.industry ?? null,
    days_back: options?.daysBack ?? 30,
  });

  if (error) throw error;
  return (data as FeedbackSummary[]) ?? [];
}

export async function getFeedbackTrend(options?: {
  componentType?: string;
  daysBack?: number;
  bucketHours?: number;
}): Promise<FeedbackTrend[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('ml_feedback_trend', {
    filter_component_type: options?.componentType ?? null,
    days_back: options?.daysBack ?? 30,
    bucket_hours: options?.bucketHours ?? 24,
  });

  if (error) throw error;
  return (data as FeedbackTrend[]) ?? [];
}

export async function searchEmbeddings(
  queryEmbedding: number[],
  options?: {
    threshold?: number;
    limit?: number;
    sourceType?: string;
  }
): Promise<SimilarEmbedding[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('match_embeddings', {
    query_embedding: `[${queryEmbedding.join(',')}]`,
    match_threshold: options?.threshold ?? 0.5,
    match_count: options?.limit ?? 10,
    filter_source_type: options?.sourceType ?? null,
  });

  if (error) throw error;
  return (data as SimilarEmbedding[]) ?? [];
}

export async function upsertEmbedding(params: {
  sourceId: string;
  sourceType: string;
  content: string;
  embedding: number[];
  model?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('ml_embeddings').upsert(
    {
      source_id: params.sourceId,
      source_type: params.sourceType,
      content: params.content,
      embedding: `[${params.embedding.join(',')}]` as unknown as string,
      model: params.model ?? 'text-embedding-ada-002',
      metadata: params.metadata ?? {},
    },
    { onConflict: 'source_id,source_type' }
  );

  if (error) throw error;
}

export async function getTrainingRuns(adapter?: string): Promise<
  Array<{
    id: string;
    adapter: string;
    status: string;
    progress: number;
    examples_count: number;
    metrics: Record<string, unknown>;
    error: string | null;
    started_at: string | null;
    completed_at: string | null;
  }>
> {
  const supabase = await createClient();
  let query = supabase
    .from('ml_training_runs')
    .select('*')
    .order('created_at', { ascending: false });

  if (adapter) query = query.eq('adapter', adapter);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
