import { getClient } from './base.repo';

export interface GenerationInsert {
  user_id: string;
  prompt: string;
  framework: string;
  status?: string;
  ai_provider?: string;
  model_used?: string;
  project_id?: string;
  parent_generation_id?: string | null;
}

export interface GenerationUpdate {
  status?: string;
  generated_code?: string;
  ai_provider?: string;
  quality_score?: number;
  error_message?: string;
  github_pr_id?: string;
}

export async function createGeneration(data: GenerationInsert): Promise<string | null> {
  const supabase = await getClient();
  const { data: gen } = await supabase
    .from('generations')
    .insert({
      ...data,
      status: data.status || 'processing',
    } as any)
    .select('id')
    .single();
  return gen?.id ?? null;
}

export async function updateGeneration(id: string, data: GenerationUpdate): Promise<void> {
  const supabase = await getClient();
  await supabase
    .from('generations')
    .update(data as any)
    .eq('id', id);
}

export async function findGenerationById(id: string): Promise<{
  id: string;
  parent_generation_id: string | null;
} | null> {
  const supabase = await getClient();
  const { data } = await supabase
    .from('generations')
    .select('id, parent_generation_id' as any)
    .eq('id', id)
    .single();
  return data as any;
}

export async function getParentGenerationId(id: string): Promise<string | null> {
  const supabase = await getClient();
  const {
    data,
  }: {
    data: { parent_generation_id: string | null } | null;
  } = await supabase
    .from('generations')
    .select('parent_generation_id' as any)
    .eq('id', id)
    .single();
  return data?.parent_generation_id ?? null;
}
