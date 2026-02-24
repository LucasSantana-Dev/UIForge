/** @type {import('react-query').QueryClient} */
import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time in milliseconds that data remains fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Time in milliseconds that unused data is kept in cache
      gcTime: 10 * 60 * 1000, // 10 minutes
      // Number of times a failed query should be retried
      retry: 3,
      // Delay between retries in ms
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Whether queries should refetch on window focus
      refetchOnWindowFocus: false,
      // Whether queries should refetch on reconnect
      refetchOnReconnect: true,
      // Whether queries should refetch on mount
      refetchOnMount: false,
    },
    mutations: {
      // Number of times a failed mutation should be retried
      retry: 1,
      // Whether mutations should be rolled back on error
      throwOnError: false,
    },
  },
});

// Query keys factory for consistent key generation
export const queryKeys = {
  // Projects
  projects: ['projects'],
  project: (id: string) => ['projects', id],
  projectTemplates: ['projects', 'templates'],

  // Components
  components: (projectId: string) => ['projects', projectId, 'components'],
  component: (projectId: string, id: string) => ['projects', projectId, 'components', id],

  // Templates
  templates: ['templates'],
  template: (id: string) => ['templates', id],
  templateCategories: ['templates', 'categories'],

  // GitHub integration
  githubRepositories: ['github', 'repositories'],
  githubRepository: (id: string) => ['github', 'repositories', id],
  githubSync: (projectId: string) => ['github', 'sync', projectId],

  // Cache performance
  cacheMetrics: ['cache', 'metrics'],
  systemMetrics: ['system', 'metrics'],

  // User preferences
  userPreferences: ['user', 'preferences'],

  // Health checks
  health: ['health'],
  performance: ['performance'],
} as const;

// Default query options for different query types
export const queryOptions = {
  // Projects
  projects: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  },

  // Single project
  project: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
    refetchOnWindowFocus: true,
  },

  // Components
  components: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  },

  // Templates
  templates: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  },

  // GitHub
  github: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  },

  // Metrics
  metrics: {
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  },
} as const;

// Error boundary fallback for queries
export const queryErrorFallback = {
  retry: false,
  staleTime: 0,
  gcTime: 0,
};

// Mutation options
export const mutationOptions = {
  // Optimistic updates
  optimistic: {
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries();
    },
    onError: (_error: unknown, _variables: unknown, context: unknown) => {
      if (context && typeof context === 'object' && 'rollback' in context) {
        const { rollback } = context as { rollback: () => void };
        rollback();
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries();
    },
  },

  standard: {
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  },
} as const;

// Cache invalidation helpers
export const invalidateQueries = {
  // Invalidate all project-related queries
  projects: () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  },

  // Invalidate specific project
  project: (id: string) => {
    queryClient.invalidateQueries({ queryKey: ['projects', id] });
  },

  // Invalidate components for a project
  components: (projectId: string) => {
    queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'components'] });
  },

  // Invalidate templates
  templates: () => {
    queryClient.invalidateQueries({ queryKey: ['templates'] });
  },

  // Invalidate GitHub data
  github: () => {
    queryClient.invalidateQueries({ queryKey: ['github'] });
  },

  // Invalidate metrics
  metrics: () => {
    queryClient.invalidateQueries({ queryKey: ['cache', 'metrics'] });
    queryClient.invalidateQueries({ queryKey: ['system', 'metrics'] });
  },

  // Invalidate everything
  all: () => {
    queryClient.clear();
  },
};

// Prefetching helpers
export const prefetchQueries = {
  // Prefetch project data
  project: async (id: string, fetchProject: (id: string) => Promise<any>) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.project(id),
      queryFn: () => fetchProject(id),
      staleTime: 0, // Don't use stale data for prefetching
    });
  },

  // Prefetch projects list
  projects: async (fetchProjects: () => Promise<any>) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.projects,
      queryFn: fetchProjects,
      staleTime: 0,
    });
  },

  // Prefetch templates
  templates: async (fetchTemplates: () => Promise<any>) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.templates,
      queryFn: fetchTemplates,
      staleTime: 0,
    });
  },
};

// Custom hooks for common query patterns
export const useOptimisticMutation = (mutationFn: unknown, options?: Record<string, unknown>) => {
  return {
    mutationFn,
    onMutate: async () => {
      await queryClient.cancelQueries();
      const previousQueries = queryClient.getQueriesData({});
      return { previousQueries };
    },
    onError: (
      _error: unknown,
      _variables: unknown,
      context: { previousQueries?: [unknown, unknown][] } | undefined
    ) => {
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key as string[], data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries();
    },
    ...options,
  };
};
