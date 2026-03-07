'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { GoldenPathRow } from '@/lib/repositories/golden-path.repo';

export interface GoldenPathsResponse {
  data: GoldenPathRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export type GoldenPathFilters = GoldenPathsParams;

interface GoldenPathsParams {
  search?: string;
  type?: string;
  lifecycle?: string;
  framework?: string;
  stack?: string;
  language?: string;
  tags?: string;
  page?: number;
  limit?: number;
}

async function fetchGoldenPaths(params: GoldenPathsParams = {}): Promise<GoldenPathsResponse> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const url = `/api/golden-paths?${searchParams.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch golden paths');
  const json = await res.json();
  return json.data as GoldenPathsResponse;
}

async function fetchGoldenPath(id: string): Promise<GoldenPathRow> {
  const res = await fetch(`/api/golden-paths/${id}`);
  if (!res.ok) throw new Error('Failed to fetch golden path');
  const json = await res.json();
  return json.data as GoldenPathRow;
}

export function useGoldenPaths(params: GoldenPathsParams = {}) {
  return useQuery({
    queryKey: ['golden-paths', params],
    queryFn: () => fetchGoldenPaths(params),
  });
}

export function useGoldenPath(id: string) {
  return useQuery({
    queryKey: ['golden-path', id],
    queryFn: () => fetchGoldenPath(id),
    enabled: !!id,
  });
}

export function useCreateGoldenPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch('/api/golden-paths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create golden path');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['golden-paths'] });
    },
  });
}

export function useDeleteGoldenPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/golden-paths/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete golden path');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['golden-paths'] });
    },
  });
}

export function useScaffoldProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      goldenPathId: string;
      projectName: string;
      parameters?: Record<string, unknown>;
    }) => {
      const res = await fetch('/api/golden-paths/scaffold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          golden_path_id: params.goldenPathId,
          project_name: params.projectName,
          parameters: params.parameters,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to scaffold project');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['golden-paths'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
