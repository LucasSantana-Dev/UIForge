import { getClient, paginationRange, handleRepoError, type PaginatedResult } from './base.repo';

export interface GoldenPathRow {
  id: string;
  owner_id: string | null;
  name: string;
  display_name: string;
  description: string | null;
  type: string;
  lifecycle: string;
  framework: string;
  language: string;
  tags: string[];
  parameters: Array<{
    name: string;
    type: string;
    required?: boolean;
    default?: unknown;
    description?: string;
  }>;
  steps: Array<{
    id: string;
    name: string;
    action: string;
    description?: string;
  }>;
  repository_url: string | null;
  documentation_url: string | null;
  icon: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface GoldenPathListParams {
  search?: string;
  type?: string;
  lifecycle?: string;
  framework?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export async function findGoldenPathById(id: string): Promise<GoldenPathRow | null> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('golden_path_templates')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return data as GoldenPathRow;
}

export async function findGoldenPathByName(name: string): Promise<GoldenPathRow | null> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('golden_path_templates')
    .select('*')
    .eq('name', name)
    .single();
  if (error || !data) return null;
  return data as GoldenPathRow;
}

export async function listGoldenPaths(
  params: GoldenPathListParams
): Promise<PaginatedResult<GoldenPathRow>> {
  const { search, type, lifecycle, framework, tags, page = 1, limit = 20 } = params;
  const { from, to } = paginationRange(page, limit);
  const supabase = await getClient();

  let query = supabase.from('golden_path_templates').select('*', { count: 'exact' }) as any;

  if (search) {
    query = query.or(`name.ilike.%${search}%,display_name.ilike.%${search}%`);
  }
  if (type) query = query.eq('type', type);
  if (lifecycle) query = query.eq('lifecycle', lifecycle);
  if (framework) query = query.eq('framework', framework);
  if (tags && tags.length > 0) query = query.overlaps('tags', tags);

  query = query.order('updated_at', { ascending: false }).range(from, to);

  const { data, error, count } = await query;
  if (error) handleRepoError(error, 'listGoldenPaths');

  const total = count || 0;
  return {
    data: (data || []) as GoldenPathRow[],
    total,
    page,
    limit,
    hasMore: from + limit < total,
  };
}

export async function insertGoldenPath(data: Record<string, unknown>): Promise<GoldenPathRow> {
  const supabase = await getClient();
  const { data: entry, error } = await supabase
    .from('golden_path_templates')
    .insert(data as any)
    .select()
    .single();
  if (error || !entry) {
    handleRepoError(error || new Error('Insert returned no data'), 'insertGoldenPath');
  }
  return entry as GoldenPathRow;
}

export async function updateGoldenPath(
  id: string,
  data: Record<string, unknown>
): Promise<GoldenPathRow> {
  const supabase = await getClient();
  const { data: updated, error } = await supabase
    .from('golden_path_templates')
    .update(data as any)
    .eq('id', id)
    .select()
    .single();
  if (error || !updated) {
    handleRepoError(error || new Error('Update returned no data'), 'updateGoldenPath');
  }
  return updated as GoldenPathRow;
}

export async function deleteGoldenPath(id: string): Promise<void> {
  const supabase = await getClient();
  const { error } = await supabase.from('golden_path_templates').delete().eq('id', id);
  if (error) handleRepoError(error, 'deleteGoldenPath');
}

export async function getGoldenPathStats(): Promise<{
  total: number;
  byType: Record<string, number>;
  byLifecycle: Record<string, number>;
  byFramework: Record<string, number>;
}> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('golden_path_templates')
    .select('type, lifecycle, framework');

  if (error) handleRepoError(error, 'getGoldenPathStats');

  const entries = (data || []) as Array<{
    type: string;
    lifecycle: string;
    framework: string;
  }>;
  const byType: Record<string, number> = {};
  const byLifecycle: Record<string, number> = {};
  const byFramework: Record<string, number> = {};

  for (const entry of entries) {
    byType[entry.type] = (byType[entry.type] || 0) + 1;
    byLifecycle[entry.lifecycle] = (byLifecycle[entry.lifecycle] || 0) + 1;
    byFramework[entry.framework] = (byFramework[entry.framework] || 0) + 1;
  }

  return { total: entries.length, byType, byLifecycle, byFramework };
}
