import { getClient, paginationRange, handleRepoError, type PaginatedResult } from './base.repo';

export interface CatalogEntryRow {
  id: string;
  owner_id: string;
  name: string;
  display_name: string;
  type: string;
  lifecycle: string;
  description: string | null;
  team: string | null;
  repository_url: string | null;
  documentation_url: string | null;
  tags: string[];
  dependencies: string[];
  project_id: string | null;
  parent_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CatalogGraphData {
  nodes: CatalogEntryRow[];
  edges: Array<{
    source: string;
    target: string;
    type: 'dependency' | 'hierarchy';
  }>;
}

export async function findCatalogEntryById(id: string): Promise<CatalogEntryRow | null> {
  const supabase = await getClient();
  const { data, error } = await supabase.from('catalog_entries').select('*').eq('id', id).single();
  if (error || !data) return null;
  return data as CatalogEntryRow;
}

export async function findCatalogEntryByName(name: string): Promise<CatalogEntryRow | null> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('catalog_entries')
    .select('*')
    .eq('name', name)
    .single();
  if (error || !data) return null;
  return data as CatalogEntryRow;
}

export interface CatalogListParams {
  search?: string;
  type?: string;
  lifecycle?: string;
  tags?: string[];
  parent_id?: string;
  page?: number;
  limit?: number;
}

export async function listCatalogEntries(
  params: CatalogListParams
): Promise<PaginatedResult<CatalogEntryRow>> {
  const { search, type, lifecycle, tags, parent_id, page = 1, limit = 20 } = params;
  const { from, to } = paginationRange(page, limit);
  const supabase = await getClient();

  let query = supabase.from('catalog_entries').select('*', { count: 'exact' }) as any;

  if (search) {
    query = query.or(`name.ilike.%${search}%,display_name.ilike.%${search}%`);
  }
  if (type) {
    query = query.eq('type', type);
  }
  if (lifecycle) {
    query = query.eq('lifecycle', lifecycle);
  }
  if (tags && tags.length > 0) {
    query = query.overlaps('tags', tags);
  }
  if (parent_id) {
    query = query.eq('parent_id', parent_id);
  }

  query = query.order('updated_at', { ascending: false }).range(from, to);

  const { data, error, count } = await query;
  if (error) {
    handleRepoError(error, 'listCatalogEntries');
  }

  const total = count || 0;
  return {
    data: (data || []) as CatalogEntryRow[],
    total,
    page,
    limit,
    hasMore: from + limit < total,
  };
}

export async function insertCatalogEntry(data: Record<string, unknown>): Promise<CatalogEntryRow> {
  const supabase = await getClient();
  const { data: entry, error } = await supabase
    .from('catalog_entries')
    .insert(data as any)
    .select()
    .single();
  if (error || !entry) {
    handleRepoError(error || new Error('Insert returned no data'), 'insertCatalogEntry');
  }
  return entry as CatalogEntryRow;
}

export async function upsertCatalogEntry(data: Record<string, unknown>): Promise<CatalogEntryRow> {
  const supabase = await getClient();
  const { data: entry, error } = await supabase
    .from('catalog_entries')
    .upsert(data as any, { onConflict: 'name' })
    .select()
    .single();
  if (error || !entry) {
    handleRepoError(error || new Error('Upsert returned no data'), 'upsertCatalogEntry');
  }
  return entry as CatalogEntryRow;
}

export async function updateCatalogEntry(
  id: string,
  data: Record<string, unknown>
): Promise<CatalogEntryRow> {
  const supabase = await getClient();
  const { data: updated, error } = await supabase
    .from('catalog_entries')
    .update(data as any)
    .eq('id', id)
    .select()
    .single();
  if (error || !updated) {
    handleRepoError(error || new Error('Update returned no data'), 'updateCatalogEntry');
  }
  return updated as CatalogEntryRow;
}

export async function deleteCatalogEntry(id: string): Promise<void> {
  const supabase = await getClient();
  const { error } = await supabase.from('catalog_entries').delete().eq('id', id);
  if (error) {
    handleRepoError(error, 'deleteCatalogEntry');
  }
}

export async function getCatalogDependencies(id: string): Promise<CatalogEntryRow[]> {
  const entry = await findCatalogEntryById(id);
  if (!entry || entry.dependencies.length === 0) return [];

  const supabase = await getClient();
  const { data, error } = await supabase
    .from('catalog_entries')
    .select('*')
    .in('name', entry.dependencies);

  if (error) {
    handleRepoError(error, 'getCatalogDependencies');
  }
  return (data || []) as CatalogEntryRow[];
}

export async function getCatalogDependents(id: string): Promise<CatalogEntryRow[]> {
  const entry = await findCatalogEntryById(id);
  if (!entry) return [];

  const supabase = await getClient();
  const { data, error } = await supabase
    .from('catalog_entries')
    .select('*')
    .contains('dependencies', [entry.name]);

  if (error) {
    handleRepoError(error, 'getCatalogDependents');
  }
  return (data || []) as CatalogEntryRow[];
}

export async function findCatalogChildren(parentId: string): Promise<CatalogEntryRow[]> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('catalog_entries')
    .select('*')
    .eq('parent_id', parentId)
    .order('type')
    .order('name');

  if (error) {
    handleRepoError(error, 'findCatalogChildren');
  }
  return (data || []) as CatalogEntryRow[];
}

export async function getCatalogGraphData(): Promise<CatalogGraphData> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('catalog_entries')
    .select('*')
    .order('type')
    .order('name');

  if (error) {
    handleRepoError(error, 'getCatalogGraphData');
  }

  const nodes = (data || []) as CatalogEntryRow[];
  const edges: CatalogGraphData['edges'] = [];

  const nameToId = new Map(nodes.map((n) => [n.name, n.id]));

  for (const node of nodes) {
    if (node.parent_id) {
      edges.push({
        source: node.parent_id,
        target: node.id,
        type: 'hierarchy',
      });
    }

    for (const dep of node.dependencies) {
      const targetId = nameToId.get(dep);
      if (targetId) {
        edges.push({
          source: node.id,
          target: targetId,
          type: 'dependency',
        });
      }
    }
  }

  return { nodes, edges };
}

export async function getCatalogStats(): Promise<{
  total: number;
  byType: Record<string, number>;
  byLifecycle: Record<string, number>;
}> {
  const supabase = await getClient();
  const { data, error } = await supabase.from('catalog_entries').select('type, lifecycle');

  if (error) {
    handleRepoError(error, 'getCatalogStats');
  }

  const entries = (data || []) as Array<{
    type: string;
    lifecycle: string;
  }>;
  const byType: Record<string, number> = {};
  const byLifecycle: Record<string, number> = {};

  for (const entry of entries) {
    byType[entry.type] = (byType[entry.type] || 0) + 1;
    byLifecycle[entry.lifecycle] = (byLifecycle[entry.lifecycle] || 0) + 1;
  }

  return { total: entries.length, byType, byLifecycle };
}
