'use client';

import { useState, useMemo } from 'react';
import { GlobeIcon, SearchIcon } from 'lucide-react';
import { parseSpec, getEndpoints } from '@/lib/openapi/parser';
import type { Endpoint } from '@/lib/openapi/types';
import EndpointCard from './EndpointCard';

interface ApiDocsPanelProps {
  spec: string | Record<string, unknown>;
}

export default function ApiDocsPanel({ spec }: ApiDocsPanelProps) {
  const [search, setSearch] = useState('');

  const { parsed, endpoints, error } = useMemo(() => {
    try {
      const content = typeof spec === 'string' ? spec : JSON.stringify(spec);
      const parsed = parseSpec(content);
      const endpoints = getEndpoints(parsed);
      return { parsed, endpoints, error: null };
    } catch (e) {
      return {
        parsed: null,
        endpoints: [] as Endpoint[],
        error: e instanceof Error ? e.message : 'Failed to parse spec',
      };
    }
  }, [spec]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
        <p className="text-sm text-red-400">Invalid OpenAPI spec: {error}</p>
      </div>
    );
  }

  if (!parsed || endpoints.length === 0) {
    return (
      <div className="rounded-xl border border-surface-3 bg-surface-1 p-6 text-center">
        <GlobeIcon className="h-8 w-8 text-text-secondary mx-auto mb-2" />
        <p className="text-sm text-text-secondary">No endpoints found in spec</p>
      </div>
    );
  }

  const filtered = search
    ? endpoints.filter(
        (ep) =>
          ep.path.toLowerCase().includes(search.toLowerCase()) ||
          ep.method.includes(search.toLowerCase()) ||
          ep.operation.summary?.toLowerCase().includes(search.toLowerCase())
      )
    : endpoints;

  const tags = new Set(endpoints.flatMap((ep) => ep.operation.tags || []));
  const hasTags = tags.size > 0;

  const grouped: Record<string, Endpoint[]> = {};
  if (hasTags) {
    for (const tag of tags) {
      grouped[tag] = filtered.filter((ep) => ep.operation.tags?.includes(tag));
    }
    const untagged = filtered.filter((ep) => !ep.operation.tags?.length);
    if (untagged.length > 0) {
      grouped['Other'] = untagged;
    }
  } else {
    grouped[''] = filtered;
  }

  const server = parsed.servers?.[0]?.url || '';

  return (
    <div className="rounded-xl border border-surface-3 bg-surface-1">
      <div className="px-6 py-4 border-b border-surface-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <GlobeIcon className="h-5 w-5 text-violet-400" />
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{parsed.info.title}</h2>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <span>v{parsed.info.version}</span>
                {server && (
                  <>
                    <span>·</span>
                    <code className="font-mono">{server}</code>
                  </>
                )}
              </div>
            </div>
          </div>
          <span className="text-xs text-text-secondary">
            {endpoints.length} endpoint
            {endpoints.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search endpoints..."
            className="w-full pl-9 pr-4 py-2 bg-surface-2 border border-surface-3 rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto p-4 space-y-4">
        {Object.entries(grouped).map(
          ([tag, eps]) =>
            eps.length > 0 && (
              <div key={tag || '__flat'}>
                {tag && (
                  <h3 className="text-sm font-medium text-text-secondary mb-2 uppercase tracking-wider">
                    {tag}
                  </h3>
                )}
                <div className="space-y-2">
                  {eps.map((ep) => (
                    <EndpointCard key={`${ep.method}-${ep.path}`} endpoint={ep} />
                  ))}
                </div>
              </div>
            )
        )}

        {filtered.length === 0 && (
          <p className="text-center text-sm text-text-secondary py-8">
            No endpoints match &quot;{search}&quot;
          </p>
        )}
      </div>
    </div>
  );
}
