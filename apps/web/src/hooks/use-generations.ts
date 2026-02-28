/**
 * Generations React Query Hooks
 * Hooks for managing component generations via API routes
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Types
export interface Generation {
  id: string;
  project_id: string;
  user_id: string;
  prompt: string;
  component_name: string;
  generated_code: string;
  framework: string;
  component_library?: string;
  style?: string;
  typescript: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  tokens_used?: number;
  generation_time_ms?: number;
  error_message?: string;
  quality_score?: number;
  parent_generation_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGenerationInput {
  project_id: string;
  prompt: string;
  component_name: string;
  generated_code: string;
  framework: string;
  component_library?: string;
  style?: string;
  typescript: boolean;
  tokens_used?: number;
  generation_time_ms?: number;
}

/**
 * Fetch generations for a project
 */
export function useGenerations(projectId: string | undefined) {
  return useQuery({
    queryKey: ['generations', 'list', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');

      const response = await fetch(`/api/generations?project_id=${projectId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch generations');
      }

      const data = await response.json();
      return data.generations as Generation[];
    },
    enabled: !!projectId,
  });
}

/**
 * Fetch a single generation
 */
export function useGeneration(generationId: string | undefined) {
  return useQuery({
    queryKey: ['generations', 'item', generationId],
    queryFn: async () => {
      if (!generationId) throw new Error('Generation ID is required');

      const response = await fetch(`/api/generations/${generationId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch generation');
      }

      const data = await response.json();
      return data.generation as Generation;
    },
    enabled: !!generationId,
  });
}

/**
 * Create a new generation record
 */
export function useCreateGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateGenerationInput) => {
      const response = await fetch('/api/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create generation');
      }

      const data = await response.json();
      return data.generation as Generation;
    },
    onSuccess: (generation) => {
      // Invalidate generations list for the project
      queryClient.invalidateQueries({
        queryKey: ['generations', 'list', generation.project_id],
      });
    },
  });
}

/**
 * Update a generation status
 */
export function useUpdateGeneration(generationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Generation>) => {
      const response = await fetch(`/api/generations/${generationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update generation');
      }

      const data = await response.json();
      return data.generation as Generation;
    },
    onSuccess: (generation) => {
      // Invalidate both the single generation and the list
      queryClient.invalidateQueries({
        queryKey: ['generations', 'item', generationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['generations', 'list', generation.project_id],
      });
    },
  });
}

/**
 * Delete a generation
 */
export function useDeleteGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      generationId,
      projectId,
    }: {
      generationId: string;
      projectId: string;
    }) => {
      const response = await fetch(`/api/generations/${generationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete generation');
      }

      return { generationId, projectId };
    },
    onSuccess: (_, variables) => {
      // Invalidate generations list for the project
      queryClient.invalidateQueries({
        queryKey: ['generations', 'list', variables.projectId],
      });
      // Remove the single generation from cache
      queryClient.removeQueries({
        queryKey: ['generations', 'item', variables.generationId],
      });
    },
  });
}
