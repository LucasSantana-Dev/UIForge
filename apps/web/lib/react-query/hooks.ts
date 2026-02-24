'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';

import { queryKeys, queryOptions, invalidateQueries, prefetchQueries } from './query-client';

// Custom hook for projects
export function useProjects(options?: any) {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: async () => {
      // This would be replaced with actual API call
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      return response.json();
    },
    ...queryOptions.projects,
    ...options,
  });
}

// Custom hook for single project
export function useProject(id: string, options?: any) {
  return useQuery({
    queryKey: queryKeys.project(id),
    queryFn: async () => {
      // This would be replaced with actual API call
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      return response.json();
    },
    enabled: !!id,
    ...queryOptions.project,
    ...options,
  });
}

// Custom hook for project components
export function useComponents(projectId: string, options?: any) {
  return useQuery({
    queryKey: queryKeys.components(projectId),
    queryFn: async () => {
      // This would be replaced with actual API call
      const response = await fetch(`/api/projects/${projectId}/components`);
      if (!response.ok) {
        throw new Error('Failed to fetch components');
      }
      return response.json();
    },
    enabled: !!projectId,
    ...queryOptions.components,
    ...options,
  });
}

// Custom hook for templates
export function useTemplates(options?: any) {
  return useQuery({
    queryKey: queryKeys.templates,
    queryFn: async () => {
      // This would be replaced with actual API call
      const response = await fetch('/api/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      return response.json();
    },
    ...queryOptions.templates,
    ...options,
  });
}

// Custom hook for GitHub repositories
export function useGithubRepositories(options?: any) {
  return useQuery({
    queryKey: queryKeys.githubRepositories,
    queryFn: async () => {
      // This would be replaced with actual API call
      const response = await fetch('/api/github/repositories');
      if (!response.ok) {
        throw new Error('Failed to fetch GitHub repositories');
      }
      return response.json();
    },
    ...queryOptions.github,
    ...options,
  });
}

// Custom hook for cache metrics
export function useCacheMetrics(options?: any) {
  return useQuery({
    queryKey: queryKeys.cacheMetrics,
    queryFn: async () => {
      // This would be replaced with actual API call to MCP Gateway
      const response = await fetch('http://localhost:4444/monitoring/metrics/cache');
      if (!response.ok) {
        throw new Error('Failed to fetch cache metrics');
      }
      return response.json();
    },
    ...queryOptions.metrics,
    ...options,
  });
}

// Custom hook for system metrics
export function useSystemMetrics(options?: any) {
  return useQuery({
    queryKey: queryKeys.systemMetrics,
    queryFn: async () => {
      // This would be replaced with actual API call to MCP Gateway
      const response = await fetch('http://localhost:4444/monitoring/metrics/system');
      if (!response.ok) {
        throw new Error('Failed to fetch system metrics');
      }
      return response.json();
    },
    ...queryOptions.metrics,
    ...options,
  });
}

// Mutation hooks
export function useCreateProject() {
  return useMutation({
    mutationFn: async (projectData: any) => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      return response.json();
    },
    onSuccess: () => {
      invalidateQueries.projects();
    },
  });
}

export function useUpdateProject() {
  return useMutation({
    mutationFn: async ({ id, ...projectData }: any) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      invalidateQueries.project(variables.id);
      invalidateQueries.projects();
    },
  });
}

export function useDeleteProject() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      return response.json();
    },
    onSuccess: () => {
      invalidateQueries.projects();
    },
  });
}

// Prefetching hook
export function usePrefetch() {
  const prefetchProject = useCallback((id: string) => {
    prefetchQueries.project(id, (id: string) =>
      fetch(`/api/projects/${id}`).then((res) => res.json())
    );
  }, []);

  const prefetchProjects = useCallback(() => {
    prefetchQueries.projects(() => fetch('/api/projects').then((res) => res.json()));
  }, []);

  const prefetchTemplates = useCallback(() => {
    prefetchQueries.templates(() => fetch('/api/templates').then((res) => res.json()));
  }, []);

  return {
    prefetchProject,
    prefetchProjects,
    prefetchTemplates,
  };
}

// Cache management hook
export function useCacheManagement() {
  const clearCache = useCallback(() => {
    invalidateQueries.all();
  }, []);

  const refreshProjects = useCallback(() => {
    invalidateQueries.projects();
  }, []);

  const refreshProject = useCallback((id: string) => {
    invalidateQueries.project(id);
  }, []);

  const refreshComponents = useCallback((projectId: string) => {
    invalidateQueries.components(projectId);
  }, []);

  return {
    clearCache,
    refreshProjects,
    refreshProject,
    refreshComponents,
  };
}

// Health check hook
export function useHealthCheck(options?: any) {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: async () => {
      // This would be replaced with actual API call to MCP Gateway
      const response = await fetch('http://localhost:4444/monitoring/health');
      if (!response.ok) {
        throw new Error('Health check failed');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    ...options,
  });
}

// Performance summary hook
export function usePerformanceSummary(options?: any) {
  return useQuery({
    queryKey: queryKeys.performance,
    queryFn: async () => {
      // This would be replaced with actual API call to MCP Gateway
      const response = await fetch('http://localhost:4444/monitoring/performance');
      if (!response.ok) {
        throw new Error('Failed to fetch performance summary');
      }
      return response.json();
    },
    refetchInterval: 60000, // Refetch every minute
    ...options,
  });
}
