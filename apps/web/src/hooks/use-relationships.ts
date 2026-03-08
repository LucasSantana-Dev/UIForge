'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { RelationshipWithEntries, RelationType } from '@/lib/repositories/relationship.repo';

interface RelationshipsResponse {
  data: RelationshipWithEntries[];
}

export function useRelationships(entityId: string) {
  return useQuery<RelationshipsResponse>({
    queryKey: ['relationships', entityId],
    queryFn: async () => {
      const res = await fetch(`/api/catalog/${entityId}/relationships`);
      if (!res.ok) throw new Error('Failed to fetch relationships');
      return res.json();
    },
    enabled: !!entityId,
  });
}

export function useCreateRelationship() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sourceId,
      targetId,
      type,
      metadata,
    }: {
      sourceId: string;
      targetId: string;
      type: RelationType;
      metadata?: Record<string, unknown>;
    }) => {
      const res = await fetch(`/api/catalog/${sourceId}/relationships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId, type, metadata }),
      });
      if (!res.ok) throw new Error('Failed to create relationship');
      return res.json();
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ['relationships', variables.sourceId],
      });
      qc.invalidateQueries({
        queryKey: ['relationships', variables.targetId],
      });
      qc.invalidateQueries({ queryKey: ['catalog-graph'] });
    },
  });
}

export function useDeleteRelationship() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      entityId,
      relationshipId,
    }: {
      entityId: string;
      relationshipId: string;
    }) => {
      const res = await fetch(
        `/api/catalog/${entityId}/relationships?relationshipId=${relationshipId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to delete relationship');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['relationships'] });
      qc.invalidateQueries({ queryKey: ['catalog-graph'] });
    },
  });
}
