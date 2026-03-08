import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Team {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  owner_id: string;
  created_at: string;
}

interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: { id: string; full_name: string; avatar_url: string | null };
}

interface TeamWithMembers extends Team {
  members: TeamMember[];
}

export function useTeams() {
  return useQuery<{ data: Team[] }>({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await fetch('/api/teams');
      if (!res.ok) throw new Error('Failed to fetch teams');
      return res.json();
    },
  });
}

export function useTeam(slug: string) {
  return useQuery<{ data: TeamWithMembers; userRole: string | null }>({
    queryKey: ['teams', slug],
    queryFn: async () => {
      const res = await fetch(`/api/teams/${slug}`);
      if (!res.ok) throw new Error('Failed to fetch team');
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; slug: string; description?: string }) => {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create team');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useAddTeamMember(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { userId: string; role: string }) => {
      const res = await fetch(`/api/teams/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add member');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', slug] });
    },
  });
}

export function useUpdateMemberRole(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { userId: string; role: string }) => {
      const res = await fetch(`/api/teams/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update role');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', slug] });
    },
  });
}

export function useRemoveTeamMember(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/teams/${slug}?userId=${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to remove member');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', slug] });
    },
  });
}
