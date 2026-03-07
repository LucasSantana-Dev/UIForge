import {
  findCatalogEntryById,
  findCatalogChildren,
  getCatalogDependencies,
  getCatalogDependents,
  getCatalogGraphData,
  getCatalogStats as repoGetCatalogStats,
  listCatalogEntries as repoListCatalogEntries,
  type CatalogGraphData,
  type CatalogListParams,
} from '@/lib/repositories/catalog.repo';
import { ForbiddenError, NotFoundError } from '@/lib/api/errors';
import { getClient } from '@/lib/repositories/base.repo';

export async function verifyCatalogOwnership(entryId: string, userId: string): Promise<any> {
  const entry = await findCatalogEntryById(entryId);

  if (!entry) {
    throw new NotFoundError('Catalog entry not found');
  }

  if (entry.owner_id !== userId) {
    throw new ForbiddenError('You do not own this catalog entry');
  }

  return entry;
}

export async function getCatalogEntryWithRelations(entryId: string): Promise<{
  entry: any;
  dependencies: any[];
  dependents: any[];
  children: any[];
  scorecard?: any;
}> {
  const entry = await findCatalogEntryById(entryId);
  if (!entry) {
    throw new NotFoundError('Catalog entry not found');
  }

  const [dependencies, dependents, children] = await Promise.all([
    getCatalogDependencies(entryId),
    getCatalogDependents(entryId),
    findCatalogChildren(entryId),
  ]);

  const result: any = { entry, dependencies, dependents, children };

  if (entry.project_id) {
    const supabase = await getClient();
    const { data: scorecard } = await supabase
      .from('project_scorecards')
      .select('*')
      .eq('project_id', entry.project_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (scorecard) {
      result.scorecard = scorecard;
    }
  }

  return result;
}

export interface CatalogListQuery {
  search?: string;
  type?: string;
  lifecycle?: string;
  tags?: string;
  parent_id?: string;
  page?: number;
  limit?: number;
}

export async function listCatalogEntries(query: CatalogListQuery = {}): Promise<{
  data: any[];
  pagination: { page: number; limit: number; total: number; pages: number };
}> {
  const params: CatalogListParams = {
    search: query.search,
    type: query.type,
    lifecycle: query.lifecycle,
    tags: query.tags ? query.tags.split(',').map((t) => t.trim()) : undefined,
    parent_id: query.parent_id,
    page: query.page || 1,
    limit: query.limit || 10,
  };

  const result = await repoListCatalogEntries(params);

  return {
    data: result.data,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      pages: Math.max(1, Math.ceil(result.total / result.limit)),
    },
  };
}

export async function getCatalogGraph(): Promise<CatalogGraphData> {
  return getCatalogGraphData();
}

export async function getCatalogStats(): Promise<{
  total: number;
  production: number;
  servicesAndApis: number;
  libsAndComponents: number;
}> {
  const stats = await repoGetCatalogStats();
  return {
    total: stats.total,
    production: stats.byLifecycle['production'] || 0,
    servicesAndApis: (stats.byType['service'] || 0) + (stats.byType['api'] || 0),
    libsAndComponents: (stats.byType['library'] || 0) + (stats.byType['component'] || 0),
  };
}
