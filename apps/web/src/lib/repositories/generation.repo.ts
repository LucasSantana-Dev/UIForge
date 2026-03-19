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
  correlation_id?: string;
}

export interface GenerationUpdate {
  status?: string;
  generated_code?: string;
  ai_provider?: string;
  quality_score?: number;
  error_message?: string;
  github_pr_id?: string;
}

export interface GenerationSecurityReportUpsert {
  generation_id: string;
  user_id: string;
  report_version: string;
  scanner_name: string;
  scanner_version: string;
  scanner_execution: 'success' | 'error';
  scanner_error_message?: string | null;
  summary_total_findings: number;
  summary_by_severity: Record<string, number>;
  summary_by_risk_level: Record<string, number>;
  findings: Array<Record<string, unknown>>;
  highest_risk_level?: 'high' | 'medium' | 'low' | null;
  highest_severity?: 'critical' | 'high' | 'medium' | 'low' | 'info' | null;
  dast_status: string;
  dast_mode: string;
  dast_reason: string;
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

export async function upsertGenerationSecurityReport(
  data: GenerationSecurityReportUpsert
): Promise<void> {
  const supabase = await getClient();
  await supabase
    .from('generation_security_reports')
    .upsert(data as any, { onConflict: 'generation_id' });
}
