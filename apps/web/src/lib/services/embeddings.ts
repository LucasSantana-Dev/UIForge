import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';

const EMBEDDING_MODEL = 'gemini-embedding-001';

export interface SimilarGeneration {
  id: string;
  prompt: string;
  generated_code: string;
  framework: string;
  quality_score: number;
  similarity: number;
}

export interface SimilarPattern {
  id: string;
  name: string;
  category: string;
  description: string;
  code: string;
  framework: string;
  similarity: number;
}

export async function generateEmbedding(
  text: string,
  taskType: TaskType = TaskType.RETRIEVAL_DOCUMENT,
  apiKey?: string
): Promise<number[]> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) throw new Error('Gemini API key required for embeddings');

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent({
    content: { role: 'user', parts: [{ text }] },
    taskType,
  });
  return result.embedding.values;
}

export async function findSimilarGenerations(
  queryEmbedding: number[],
  options?: {
    threshold?: number;
    limit?: number;
    minQuality?: number;
  }
): Promise<SimilarGeneration[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('match_generations', {
    query_embedding: `[${queryEmbedding.join(',')}]`,
    match_threshold: options?.threshold ?? 0.7,
    match_count: options?.limit ?? 5,
    min_quality: options?.minQuality ?? 0.7,
  });

  if (error) throw error;
  return (data as SimilarGeneration[]) ?? [];
}

export async function findSimilarPatterns(
  queryEmbedding: number[],
  options?: { threshold?: number; limit?: number }
): Promise<SimilarPattern[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('match_patterns', {
    query_embedding: `[${queryEmbedding.join(',')}]`,
    match_threshold: options?.threshold ?? 0.5,
    match_count: options?.limit ?? 3,
  });

  if (error) throw error;
  return (data as SimilarPattern[]) ?? [];
}

export async function storeGenerationEmbedding(
  generationId: string,
  prompt: string,
  apiKey?: string
): Promise<void> {
  const embedding = await generateEmbedding(prompt, TaskType.RETRIEVAL_DOCUMENT, apiKey);
  const supabase = await createClient();
  const { error } = await supabase
    .from('generations')
    .update({
      prompt_embedding: `[${embedding.join(',')}]` as unknown as string,
    })
    .eq('id', generationId);

  if (error) throw error;
}

export async function updateQualityScore(
  generationId: string,
  score: number,
  feedback?: string
): Promise<void> {
  const supabase = await createClient();
  const update: Record<string, unknown> = { quality_score: score };
  if (feedback !== undefined) update.user_feedback = feedback;

  const { error } = await supabase.from('generations').update(update).eq('id', generationId);

  if (error) throw error;
}
