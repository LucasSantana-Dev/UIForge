import {
  getClient,
  paginationRange,
  handleRepoError,
  type PaginatedResult,
} from './base.repo';

export interface ProjectRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  framework: string;
  component_library: string | null;
  is_public: boolean | null;
  is_template: boolean | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function findProjectById(
  projectId: string
): Promise<ProjectRow | null> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('projects')
    .select('id, user_id, is_public, framework, name, description, component_library, is_template, thumbnail_url, created_at, updated_at')
    .eq('id', projectId)
    .single();
  if (error || !data) return null;
  return data as ProjectRow;
}

export interface ProjectListParams {
  userId: string;
  search?: string;
  framework?: string;
  page?: number;
  limit?: number;
}

export async function listProjects(
  params: ProjectListParams
): Promise<PaginatedResult<ProjectRow>> {
  const { userId, search, framework, page = 1, limit = 20 } = params;
  const { from, to } = paginationRange(page, limit);
  const supabase = await getClient();

  let query = supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.ilike('name', '%' + search + '%');
  }
  if (framework) {
    query = query.eq('framework', framework);
  }

  const { data, error, count } = await query;
  if (error) {
    handleRepoError(error, 'listProjects');
  }

  const total = count || 0;
  return {
    data: (data || []) as ProjectRow[],
    total,
    page,
    limit,
    hasMore: from + limit < total,
  };
}

export async function insertProject(
  data: Record<string, unknown>
): Promise<ProjectRow> {
  const supabase = await getClient();
  const { data: project, error } = await supabase
    .from('projects')
    .insert(data as any)
    .select()
    .single();
  if (error || !project) {
    handleRepoError(error || new Error('Insert returned no data'), 'insertProject');
  }
  return project as ProjectRow;
}

export async function updateProject(
  id: string,
  data: Record<string, unknown>
): Promise<ProjectRow> {
  const supabase = await getClient();
  const { data: updated, error } = await supabase
    .from('projects')
    .update(data as any)
    .eq('id', id)
    .select()
    .single();
  if (error || !updated) {
    handleRepoError(error || new Error('Update returned no data'), 'updateProject');
  }
  return updated as ProjectRow;
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = await getClient();
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
  if (error) {
    handleRepoError(error, 'deleteProject');
  }
}
