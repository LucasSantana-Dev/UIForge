import { createClient } from '@/lib/supabase/server';
import { ForbiddenError, NotFoundError } from '@/lib/api/errors';

export async function verifyProjectOwnership(
  projectId: string,
  userId: string
): Promise<any> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('projects')
    .select('user_id')
    .eq('id', projectId)
    .single();

  if (!data) {
    throw new NotFoundError('Project not found');
  }

  if (data.user_id !== userId) {
    throw new ForbiddenError('You do not own this project');
  }

  return data;
}

export interface ProjectListQuery {
  search?: string;
  framework?: string;
  is_public?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function listProjects(
  userId: string,
  query: ProjectListQuery
): Promise<PaginatedResult<any>> {
  const supabase = await createClient();
  let dbQuery = supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  if (query.search) {
    dbQuery = dbQuery.or(
      'name.ilike.%' + query.search + '%,description.ilike.%' + query.search + '%'
    );
  }
  if (query.framework) {
    dbQuery = dbQuery.eq('framework', query.framework);
  }
  if (query.is_public !== undefined) {
    dbQuery = dbQuery.eq('is_public', query.is_public);
  }
  if (query.sort) {
    dbQuery = dbQuery.order(query.sort, { ascending: query.order === 'asc' });
  }

  const from = (query.page - 1) * query.limit;
  dbQuery = dbQuery.range(from, from + query.limit - 1);

  const { data, error, count } = await dbQuery;
  if (error) throw error;

  return {
    data: data || [],
    pagination: {
      page: query.page,
      limit: query.limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / query.limit),
    },
  };
}
