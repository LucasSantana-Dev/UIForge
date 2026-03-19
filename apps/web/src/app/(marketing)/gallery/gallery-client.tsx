'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSupabaseUser } from '@/hooks/use-supabase-user';
import { GalleryCard } from './gallery-card';

interface Generation {
  id: string;
  prompt: string;
  component_name: string;
  generated_code: string;
  framework: string;
  component_library?: string;
  style?: string;
  ai_provider?: string;
  model_used?: string;
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

const FRAMEWORKS = ['all', 'react', 'vue', 'svelte', 'angular'] as const;

interface GalleryPayload {
  generations: Generation[];
  pagination: Pagination;
  message?: string;
}

async function fetchGalleryData(page: number, fw: string) {
  const params = new URLSearchParams({ page: page.toString(), limit: '12' });
  if (fw !== 'all') params.set('framework', fw);
  const res = await fetch(`/api/gallery?${params}`);
  const data = (await res.json().catch(() => null)) as { error?: string } | null;
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to load gallery');
  }
  return data as GalleryPayload;
}

export function GalleryClient() {
  const { user, loading: authLoading } = useSupabaseUser();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [framework, setFramework] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [emptyMessage, setEmptyMessage] = useState('No featured generations yet');
  const [error, setError] = useState<string | null>(null);
  const currentPage = useRef(1);
  const showAuthAction = !authLoading;
  const isSignedIn = showAuthAction && Boolean(user);

  useEffect(() => {
    let cancelled = false;
    currentPage.current = 1;

    fetchGalleryData(1, framework)
      .then((data) => {
        if (cancelled) return;
        setGenerations(data.generations);
        setPagination(data.pagination);
        setEmptyMessage(data.message || 'No featured generations yet');
      })
      .catch((fetchError: unknown) => {
        if (cancelled) return;
        setGenerations([]);
        setPagination({
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
        });
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load gallery');
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [framework]);

  const handleFrameworkChange = (value: string) => {
    if (value === framework) {
      return;
    }
    setLoading(true);
    setError(null);
    setFramework(value);
  };

  const handlePageChange = (page: number) => {
    currentPage.current = page;
    setLoading(true);
    setError(null);
    fetchGalleryData(page, framework)
      .then((data) => {
        if (currentPage.current !== page) return;
        setGenerations(data.generations);
        setPagination(data.pagination);
        setEmptyMessage(data.message || 'No featured generations yet');
      })
      .catch((fetchError: unknown) => {
        if (currentPage.current !== page) return;
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load gallery');
      })
      .finally(() => {
        if (currentPage.current === page) {
          setLoading(false);
        }
      });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
          <Sparkles className="h-4 w-4" />
          Community Showcase
        </div>
        <h1 className="mb-3 text-4xl font-display font-bold tracking-tight text-foreground">
          Generation Gallery
        </h1>
        <p className="mx-auto max-w-lg text-muted-foreground">
          Explore AI-generated UI components. See the quality of what Siza produces — then try it
          yourself.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {FRAMEWORKS.map((fw) => (
            <button
              key={fw}
              onClick={() => handleFrameworkChange(fw)}
              className={`rounded-md px-3 py-1.5 text-sm capitalize transition-colors ${
                framework === fw
                  ? 'bg-violet-500/15 text-violet-300'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {fw}
            </button>
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {pagination.total} generation{pagination.total !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-lg border border-surface-3 bg-surface-1"
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h2 className="mb-2 text-lg font-medium text-foreground">Gallery unavailable</h2>
          <p className="mb-4 text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => handlePageChange(1)}
            className="rounded-md border border-surface-3 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Retry
          </button>
        </div>
      ) : generations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h2 className="mb-2 text-lg font-medium text-foreground">No featured generations yet</h2>
          <p className="max-w-md text-sm text-muted-foreground">{emptyMessage}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/templates"
              className="rounded-md border border-surface-3 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-1"
            >
              Browse Templates
            </Link>
            {showAuthAction ? (
              <Link
                href={isSignedIn ? '/generate' : '/signup'}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
              >
                {isSignedIn ? 'Generate Now' : 'Start Free'}
              </Link>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {generations.map((gen) => (
            <GalleryCard key={gen.id} generation={gen} />
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
