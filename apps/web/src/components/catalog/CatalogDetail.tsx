'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  ServerIcon,
  BoxIcon,
  GlobeIcon,
  BookOpenIcon,
  MonitorIcon,
  ExternalLinkIcon,
  EditIcon,
  TrashIcon,
  GitBranchIcon,
  UsersIcon,
} from 'lucide-react';

interface CatalogEntry {
  id: string;
  name: string;
  display_name: string;
  type: 'service' | 'component' | 'api' | 'library' | 'website';
  lifecycle: 'experimental' | 'production' | 'deprecated';
  owner_id: string;
  team?: string;
  tags?: string[];
  dependencies?: string[];
  dependents?: string[];
  repository_url?: string;
  documentation_url?: string;
  project_id?: string;
  scorecard?: {
    overall: number;
    categories: { name: string; score: number }[];
  };
  created_at: string;
  updated_at: string;
}

interface CatalogDetailProps {
  entryId: string;
}

const TYPE_ICONS = {
  service: { icon: ServerIcon, color: 'text-sky-500' },
  component: { icon: BoxIcon, color: 'text-emerald-500' },
  api: { icon: GlobeIcon, color: 'text-violet-500' },
  library: { icon: BookOpenIcon, color: 'text-amber-500' },
  website: { icon: MonitorIcon, color: 'text-rose-500' },
};

const LIFECYCLE_STYLES = {
  experimental: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  production: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  deprecated: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function CatalogDetail({ entryId }: CatalogDetailProps) {
  const router = useRouter();
  const [entry, setEntry] = useState<CatalogEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetch(`/api/catalog/${entryId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch catalog entry');
        return res.json();
      })
      .then(({ data, isOwner: owner }) => {
        setEntry(data);
        setIsOwner(owner || false);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [entryId]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    try {
      const res = await fetch(`/api/catalog/${entryId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete entry');
      router.push('/catalog');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error || !entry) {
    return <div className="text-center py-12 text-red-400">{error || 'Not found'}</div>;
  }

  const TypeIcon = TYPE_ICONS[entry.type].icon;
  const iconColor = TYPE_ICONS[entry.type].color;
  const lifecycleStyle = LIFECYCLE_STYLES[entry.lifecycle];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`rounded-full p-4 bg-surface-1-2 ${iconColor}`}>
            <TypeIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-violet-400">{entry.display_name}</h1>
            <div className="mt-2 flex items-center gap-3">
              <span className={`rounded-full border px-3 py-1 text-sm ${lifecycleStyle}`}>
                {entry.lifecycle}
              </span>
              <span className="text-sm text-text-secondary capitalize">{entry.type}</span>
            </div>
          </div>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Link
              href={`/catalog/${entryId}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-surface-1 border"
            >
              <EditIcon className="h-4 w-4" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red"
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-1-1 border border-surface-3 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-violet-400">Metadata</h2>
          {entry.team && (
            <div className="flex items-center gap-2 text-sm">
              <UsersIcon className="h-4 w-4 text-text-secondary" />
              <span className="text-text-violet-400">{entry.team}</span>
            </div>
          )}
          {entry.repository_url && (
            <div className="flex items-center gap-2 text-sm">
              <a
                href={entry.repository_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-violet-400 hover:underline"
              >
                Repository <ExternalLinkIcon className="h-3 w-3" />
              </a>
            </div>
          )}
          {entry.documentation_url && (
            <div className="flex items-center gap-2 text-sm">
              <a
                href={entry.documentation_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-violet-400 hover:underline"
              >
                Documentation <ExternalLinkIcon className="h-3 w-3" />
              </a>
            </div>
          )}
          <div className="text-xs text-text-secondary space-y-1">
            <p>Created {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}</p>
            <p>Updated {formatDistanceToNow(new Date(entry.updated_at), { addSuffix: true })}</p>
          </div>
        </div>

        {entry.tags && entry.tags.length > 0 && (
          <div className="bg-surface-1-1 border border-surface-3 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-text-violet-400">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-surface-1-2 px-3 py-1 text-sm text-text-violet-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {entry.dependencies && entry.dependencies.length > 0 && (
          <div className="bg-surface-1-1 border border-surface-3 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-text-violet-400 flex items-center gap-2">
              <GitBranchIcon className="h-5 w-5" />
              Dependencies
            </h2>
            <ul className="space-y-2">
              {entry.dependencies.map((dep) => (
                <li key={dep}>
                  <Link
                    href={`/catalog/${dep}`}
                    className="text-sm text-violet-400 hover:underline"
                  >
                    {dep}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {entry.dependents && entry.dependents.length > 0 && (
          <div className="bg-surface-1-1 border border-surface-3 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-text-violet-400">Dependents</h2>
            <ul className="space-y-2">
              {entry.dependents.map((dep) => (
                <li key={dep}>
                  <Link
                    href={`/catalog/${dep}`}
                    className="text-sm text-violet-400 hover:underline"
                  >
                    {dep}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {entry.scorecard && (
          <div className="bg-surface-1-1 border border-surface-3 rounded-xl p-6 space-y-4 md:col-span-2">
            <h2 className="text-lg font-semibold text-text-violet-400">Quality Scorecard</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-violet-400">{entry.scorecard.overall}</div>
                <div className="text-sm text-text-secondary">Overall</div>
              </div>
              {entry.scorecard.categories.map((cat) => (
                <div key={cat.name} className="text-center">
                  <div className="text-2xl font-semibold text-text-violet-400">{cat.score}</div>
                  <div className="text-xs text-text-secondary">{cat.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
