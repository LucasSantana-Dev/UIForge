'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CatalogEntryRow, CatalogGraphData } from '@/lib/repositories/catalog.repo';

export interface CatalogFilters {
  search?: string;
  type?: string;
  lifecycle?: string;
  tags?: string;
  parent_id?: string;
  page?: number;
  limit?: number;
}

interface CatalogResponse {
  entries: CatalogEntryRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

async function fetchCatalog(filters: CatalogFilters): Promise<CatalogResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.type) params.set('type', filters.type);
  if (filters.lifecycle) params.set('lifecycle', filters.lifecycle);
  if (filters.tags) params.set('tags', filters.tags);
  if (filters.parent_id) params.set('parent_id', filters.parent_id);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  const res = await fetch(`/api/catalog?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch catalog');
  return res.json();
}

export function useCatalog(filters: CatalogFilters = {}) {
  return useQuery({
    queryKey: ['catalog', filters],
    queryFn: () => fetchCatalog(filters),
  });
}

async function fetchCatalogGraph(): Promise<CatalogGraphData> {
  const res = await fetch('/api/catalog/graph');
  if (!res.ok) throw new Error('Failed to fetch catalog graph');
  return res.json();
}

export function useCatalogGraph() {
  return useQuery({
    queryKey: ['catalog-graph'],
    queryFn: fetchCatalogGraph,
    staleTime: 30_000,
  });
}

async function fetchCatalogStats(): Promise<{
  total: number;
  production: number;
  servicesAndApis: number;
  libsAndComponents: number;
}> {
  const res = await fetch('/api/catalog/stats');
  if (!res.ok) throw new Error('Failed to fetch catalog stats');
  return res.json();
}

export function useCatalogStats() {
  return useQuery({
    queryKey: ['catalog-stats'],
    queryFn: fetchCatalogStats,
    staleTime: 30_000,
  });
}

export interface DiscoveredRepo {
  repoId: number;
  fullName: string;
  defaultBranch: string;
  description: string | null;
  language: string | null;
  installationId: number;
  entityCount: number;
  entities: Array<{ name: string; kind: string; type: string }>;
  docsDetected: boolean;
  docsUrl: string | null;
}

interface DiscoveryResponse {
  data: {
    discovered: DiscoveredRepo[];
    scanned: number;
    errors: Array<{ repo: string; error: string }>;
  };
}

async function fetchDiscovery(): Promise<DiscoveryResponse> {
  const res = await fetch('/api/catalog/discover');
  if (!res.ok) throw new Error('Failed to scan repositories');
  return res.json();
}

export function useCatalogDiscovery() {
  return useQuery({
    queryKey: ['catalog-discovery'],
    queryFn: fetchDiscovery,
    enabled: false,
  });
}

export function useImportDiscovered() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (repos: Array<{ installationId: number; fullName: string }>) => {
      const res = await fetch('/api/catalog/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repos }),
      });
      if (!res.ok) throw new Error('Failed to import');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      queryClient.invalidateQueries({ queryKey: ['catalog-stats'] });
    },
  });
}
