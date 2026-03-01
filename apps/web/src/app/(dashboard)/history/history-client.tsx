'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Clock,
  ArrowRight,
  Code2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { GenerationCard } from '@/components/history/GenerationCard';
import { GenerationFilters, type HistoryFilters } from '@/components/history/GenerationFilters';

interface HistoryGeneration {
  id: string;
  prompt: string;
  component_name: string;
  generated_code: string;
  framework: string;
  component_library?: string;
  style?: string;
  typescript: boolean;
  status: string;
  ai_provider?: string;
  routed_provider?: string;
  model_used?: string;
  tokens_used?: number;
  generation_time_ms?: number;
  quality_score?: number;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function HistoryClient() {
  const router = useRouter();
  const [generations, setGenerations] = useState<HistoryGeneration[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<HistoryFilters>({
    framework: '',
    provider: '',
    status: 'completed',
  });

  const fetchHistory = useCallback(
    async (page: number) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '12',
        });
        if (filters.framework) params.set('framework', filters.framework);
        if (filters.provider) params.set('provider', filters.provider);
        if (filters.status) params.set('status', filters.status);

        const res = await fetch(`/api/generations/history?${params}`);
        if (!res.ok) throw new Error('Failed to load history');
        const json = await res.json();
        setGenerations(json.data?.generations || []);
        setPagination((prev) => json.data?.pagination || prev);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history');
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  const handleReusePrompt = (gen: HistoryGeneration) => {
    const params = new URLSearchParams({
      description: gen.prompt,
      framework: gen.framework,
    });
    if (gen.component_library) params.set('componentLibrary', gen.component_library);
    if (gen.style) params.set('style', gen.style);
    router.push(`/generate?${params.toString()}`);
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Clock className="h-8 w-8 text-brand" />
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Generation History</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Browse, filter, and reuse your past component generations
            </p>
          </div>
        </div>
      </div>

      <GenerationFilters filters={filters} onChange={setFilters} />

      <div className="flex-1 overflow-auto mt-6">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-text-muted" />
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-red-600 mb-2">{error}</p>
            <button
              onClick={() => fetchHistory(pagination.page)}
              className="text-sm text-brand underline"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {generations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generations.map((gen) => (
                  <GenerationCard
                    key={gen.id}
                    generation={gen}
                    onReusePrompt={() => handleReusePrompt(gen)}
                    onCopyCode={() => handleCopyCode(gen.generated_code)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Code2Icon className="w-12 h-12 text-text-muted mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  No generations found
                </h3>
                <p className="text-sm text-text-secondary mb-4">
                  {filters.framework || filters.provider
                    ? 'Try adjusting your filters.'
                    : 'Generate your first component to see it here.'}
                </p>
                <button
                  onClick={() => router.push('/generate')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-md text-sm hover:opacity-90"
                >
                  Generate Component
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-surface-3 pt-4 mt-4">
          <p className="text-sm text-text-secondary">
            Showing {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchHistory(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-md border border-surface-3 disabled:opacity-50 hover:bg-surface-2"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <span className="text-sm text-text-secondary px-2">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchHistory(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-md border border-surface-3 disabled:opacity-50 hover:bg-surface-2"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
