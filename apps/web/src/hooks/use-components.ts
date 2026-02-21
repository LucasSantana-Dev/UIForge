/**
 * Components React Query Hooks
 * Hooks for managing components via API routes
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Types
export interface Component {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  description?: string;
  component_type: string;
  framework: string;
  code_storage_path?: string;
  props?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ComponentWithCode extends Component {
  code_content: string;
}

export interface CreateComponentInput {
  project_id: string;
  name: string;
  description?: string;
  component_type: string;
  framework: string;
  code_content: string;
  props?: Record<string, any>;
}

export interface UpdateComponentInput {
  name?: string;
  description?: string;
  component_type?: string;
  framework?: string;
  code_content?: string;
  props?: Record<string, any>;
}

/**
 * Fetch components for a project
 */
export function useComponents(projectId: string | undefined) {
  return useQuery({
    queryKey: ['components', 'list', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');

      const response = await fetch(`/api/components?project_id=${projectId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch components');
      }

      const data = await response.json();
      return data.components as Component[];
    },
    enabled: !!projectId,
  });
}

/**
 * Fetch a single component with code
 */
export function useComponent(componentId: string | undefined) {
  return useQuery({
    queryKey: ['components', 'item', componentId],
    queryFn: async () => {
      if (!componentId) throw new Error('Component ID is required');

      const response = await fetch(`/api/components/${componentId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch component');
      }

      const data = await response.json();
      return data.component as ComponentWithCode;
    },
    enabled: !!componentId,
  });
}

/**
 * Create a new component
 */
export function useCreateComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateComponentInput) => {
      const response = await fetch('/api/components', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create component');
      }

      const data = await response.json();
      return data.component as Component;
    },
    onSuccess: (component) => {
      // Invalidate components list for the project
      queryClient.invalidateQueries({
        queryKey: ['components', 'list', component.project_id],
      });
    },
  });
}

/**
 * Update a component
 */
export function useUpdateComponent(componentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateComponentInput) => {
      const response = await fetch(`/api/components/${componentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update component');
      }

      const data = await response.json();
      return data.component as Component;
    },
    onSuccess: (component) => {
      // Invalidate both the single component and the list
      queryClient.invalidateQueries({
        queryKey: ['components', 'item', componentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['components', 'list', component.project_id],
      });
    },
  });
}

/**
 * Delete a component
 */
export function useDeleteComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ componentId, projectId }: { componentId: string; projectId: string }) => {
      const response = await fetch(`/api/components/${componentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete component');
      }

      return { componentId, projectId };
    },
    onSuccess: (_, variables) => {
      // Invalidate components list for the project
      queryClient.invalidateQueries({
        queryKey: ['components', 'list', variables.projectId],
      });
      // Remove the single component from cache
      queryClient.removeQueries({
        queryKey: ['components', 'item', variables.componentId],
      });
    },
  });
}
