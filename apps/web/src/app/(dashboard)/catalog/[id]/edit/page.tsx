'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import CatalogForm from '@/components/catalog/CatalogForm';

interface CatalogEntry {
  id: string;
  name: string;
  display_name: string;
  type: 'service' | 'component' | 'api' | 'library' | 'website';
  lifecycle: 'experimental' | 'production' | 'deprecated';
  team?: string;
  repository_url?: string;
  documentation_url?: string;
  tags?: string[];
  dependencies?: string[];
  project_id?: string;
}

export default function EditCatalogEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [entry, setEntry] = useState<CatalogEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/catalog/${resolvedParams.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch catalog entry');
        return res.json();
      })
      .then(({ data }) => {
        setEntry(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [resolvedParams.id]);

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error || !entry) {
    return <div className="text-center py-12 text-red-400">{error || 'Not found'}</div>;
  }

  const initialData = {
    name: entry.name,
    display_name: entry.display_name,
    type: entry.type,
    lifecycle: entry.lifecycle,
    team: entry.team,
    repository_url: entry.repository_url,
    documentation_url: entry.documentation_url,
    tags: entry.tags?.join(', '),
    dependencies: entry.dependencies?.join(', '),
    project_id: entry.project_id,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary font-display tracking-tight">
          Edit Catalog Entry
        </h1>
        <p className="mt-2 text-sm text-text-secondary">Update service information</p>
      </div>

      <div className="bg-surface-1 border border-surface-3 rounded-xl p-6">
        <CatalogForm mode="edit" initialData={initialData} entryId={resolvedParams.id} />
      </div>
    </div>
  );
}
