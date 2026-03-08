import { getClient } from './base.repo';

export type RelationType =
  | 'dependsOn'
  | 'consumesAPI'
  | 'providesAPI'
  | 'ownedBy'
  | 'partOf'
  | 'hasPart'
  | 'implements'
  | 'deployedTo'
  | 'monitoredBy';

export interface EntityRelationshipRow {
  id: string;
  source_id: string;
  target_id: string;
  type: RelationType;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
}

export interface RelationshipWithEntries extends EntityRelationshipRow {
  source?: { id: string; name: string; display_name: string; type: string };
  target?: { id: string; name: string; display_name: string; type: string };
}

export async function getRelationshipsForEntity(
  entityId: string
): Promise<RelationshipWithEntries[]> {
  const supabase = await getClient();

  const [outbound, inbound] = await Promise.all([
    supabase
      .from('entity_relationships')
      .select(
        '*, target:catalog_entries!entity_relationships_target_id_fkey(id, name, display_name, type)'
      )
      .eq('source_id', entityId),
    supabase
      .from('entity_relationships')
      .select(
        '*, source:catalog_entries!entity_relationships_source_id_fkey(id, name, display_name, type)'
      )
      .eq('target_id', entityId),
  ]);

  if (outbound.error) throw outbound.error;
  if (inbound.error) throw inbound.error;

  return [
    ...((outbound.data ?? []) as RelationshipWithEntries[]),
    ...((inbound.data ?? []) as RelationshipWithEntries[]),
  ];
}

export async function getAllRelationships(): Promise<RelationshipWithEntries[]> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('entity_relationships')
    .select(
      '*, source:catalog_entries!entity_relationships_source_id_fkey(id, name, display_name, type), target:catalog_entries!entity_relationships_target_id_fkey(id, name, display_name, type)'
    )
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as RelationshipWithEntries[];
}

export async function createRelationship(
  sourceId: string,
  targetId: string,
  type: RelationType,
  userId: string,
  metadata?: Record<string, unknown>
): Promise<EntityRelationshipRow> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('entity_relationships')
    .insert({
      source_id: sourceId,
      target_id: targetId,
      type,
      created_by: userId,
      metadata: metadata ?? {},
    })
    .select()
    .single();

  if (error) throw error;
  return data as EntityRelationshipRow;
}

export async function deleteRelationship(id: string): Promise<void> {
  const supabase = await getClient();
  const { error } = await supabase.from('entity_relationships').delete().eq('id', id);
  if (error) throw error;
}
