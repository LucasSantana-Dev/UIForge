import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface EntityPermissionEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  team_id: string | null;
  user_id: string | null;
  permission: string;
  granted_by: string | null;
  granted_at: string;
  team?: { id: string; name: string; slug: string };
  profile?: { id: string; full_name: string; avatar_url: string | null };
}

export function useEntityPermissions(entityType: string, entityId: string) {
  return useQuery<{ data: EntityPermissionEntry[] }>({
    queryKey: ['entity-permissions', entityType, entityId],
    queryFn: async () => {
      const res = await fetch(`/api/permissions?entityType=${entityType}&entityId=${entityId}`);
      if (!res.ok) throw new Error('Failed to fetch permissions');
      return res.json();
    },
    enabled: !!entityType && !!entityId,
  });
}

export function useGrantPermission(entityType: string, entityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { permission: string; teamId?: string; userId?: string }) => {
      const res = await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType, entityId, ...data }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to grant permission');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['entity-permissions', entityType, entityId],
      });
    },
  });
}

export function useRevokePermission(entityType: string, entityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (permissionId: string) => {
      const res = await fetch(`/api/permissions?id=${permissionId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to revoke permission');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['entity-permissions', entityType, entityId],
      });
    },
  });
}
