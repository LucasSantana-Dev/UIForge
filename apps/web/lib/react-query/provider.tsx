'use client';

import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactNode } from 'react';

import { queryClient } from './query-client';

interface ReactQueryProviderProps {
  children: ReactNode;
  client?: QueryClient;
}

export function ReactQueryProvider({ children, client = queryClient }: ReactQueryProviderProps) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

// Export the default client for easy access
export { queryClient as defaultQueryClient };
