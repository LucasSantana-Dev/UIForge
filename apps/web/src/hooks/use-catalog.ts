'use client';

import { useQuery } from '@tanstack/react-query';
import type { CatalogEntryRow } from '@/lib/repositories/catalog.repo';

export interface CatalogFilters {
  search?: string;
  type?: string;
  lifecycle?: string;
  tags?: string;
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
