'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CatalogFormData {
  name: string;
  display_name: string;
  type: 'service' | 'component' | 'api' | 'library' | 'website';
  lifecycle: 'experimental' | 'production' | 'deprecated';
  team?: string;
  repository_url?: string;
  documentation_url?: string;
  tags?: string;
  dependencies?: string;
  project_id?: string;
}

interface CatalogFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<CatalogFormData>;
  entryId?: string;
  onSuccess?: () => void;
}

export default function CatalogForm({ mode, initialData, entryId, onSuccess }: CatalogFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CatalogFormData>({
    name: initialData?.name || '',
    display_name: initialData?.display_name || '',
    type: initialData?.type || 'service',
    lifecycle: initialData?.lifecycle || 'experimental',
    team: initialData?.team || '',
    repository_url: initialData?.repository_url || '',
    documentation_url: initialData?.documentation_url || '',
    tags: initialData?.tags || '',
    dependencies: initialData?.dependencies || '',
    project_id: initialData?.project_id || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      ...formData,
      tags: formData.tags
        ? formData.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      dependencies: formData.dependencies
        ? formData.dependencies
            .split(',')
            .map((d) => d.trim())
            .filter(Boolean)
        : [],
      team: formData.team || undefined,
      repository_url: formData.repository_url || undefined,
      documentation_url: formData.documentation_url || undefined,
      project_id: formData.project_id || undefined,
    };

    try {
      const url = mode === 'create' ? '/api/catalog' : `/api/catalog/${entryId}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const { error: errMsg } = await res.json();
        throw new Error(errMsg || 'Failed to save catalog entry');
      }

      const { data } = await res.json();
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(mode === 'create' ? '/catalog' : `/catalog/${data.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="catalog-name" className="block text-sm font-medium text-text-primary">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="catalog-name"
            type="text"
            required
            disabled={mode === 'edit'}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 bg-surface-1 border border-surface-3 rounded-lg disabled:opacity-50"
            placeholder="service-name"
          />
          <p className="text-xs text-text-secondary">Unique identifier (no spaces)</p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="catalog-display-name"
            className="block text-sm font-medium text-text-primary"
          >
            Display Name <span className="text-red-500">*</span>
          </label>
          <input
            id="catalog-display-name"
            type="text"
            required
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            className="w-full px-4 py-2 bg-surface-1 border border-surface-3 rounded-lg"
            placeholder="My Service"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="catalog-type" className="block text-sm font-medium text-text-primary">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            id="catalog-type"
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full px-4 py-2 bg-surface-1 border border-surface-3 rounded-lg"
          >
            <option value="service">Service</option>
            <option value="component">Component</option>
            <option value="api">API</option>
            <option value="library">Library</option>
            <option value="website">Website</option>
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="catalog-lifecycle"
            className="block text-sm font-medium text-text-primary"
          >
            Lifecycle <span className="text-red-500">*</span>
          </label>
          <select
            id="catalog-lifecycle"
            required
            value={formData.lifecycle}
            onChange={(e) => setFormData({ ...formData, lifecycle: e.target.value as any })}
            className="w-full px-4 py-2 bg-surface-1 border border-surface-3 rounded-lg"
          >
            <option value="experimental">Experimental</option>
            <option value="production">Production</option>
            <option value="deprecated">Deprecated</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary" htmlFor="catalog-team">
            Team
          </label>
          <input
            id="catalog-team"
            type="text"
            value={formData.team}
            onChange={(e) => setFormData({ ...formData, team: e.target.value })}
            className="w-full px-4 py-2 bg-surface-1 border border-surface-3 rounded-lg"
            placeholder="Platform Team"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary" htmlFor="catalog-repo-url">
            Repository URL
          </label>
          <input
            id="catalog-repo-url"
            type="url"
            value={formData.repository_url}
            onChange={(e) => setFormData({ ...formData, repository_url: e.target.value })}
            className="w-full px-4 py-2 bg-surface-1 border border-surface-3 rounded-lg"
            placeholder="https://github.com/org/repo"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary" htmlFor="catalog-docs-url">
            Documentation URL
          </label>
          <input
            id="catalog-docs-url"
            type="url"
            value={formData.documentation_url}
            onChange={(e) => setFormData({ ...formData, documentation_url: e.target.value })}
            className="w-full px-4 py-2 bg-surface-1 border border-surface-3 rounded-lg"
            placeholder="https://docs.example.com"
          />
        </div>

        <div className="space-y-2">
          <label
            className="block text-sm font-medium text-text-primary"
            htmlFor="catalog-project-id"
          >
            Project ID
          </label>
          <input
            id="catalog-project-id"
            type="text"
            value={formData.project_id}
            onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
            className="w-full px-4 py-2 bg-surface-1 border border-surface-3 rounded-lg"
            placeholder="Optional project reference"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-text-primary" htmlFor="catalog-tags">
            Tags
          </label>
          <input
            id="catalog-tags"
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-4 py-2 bg-surface-1 border border-surface-3 rounded-lg"
            placeholder="api, backend, production (comma-separated)"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-text-primary" htmlFor="catalog-deps">
            Dependencies
          </label>
          <input
            id="catalog-deps"
            type="text"
            value={formData.dependencies}
            onChange={(e) => setFormData({ ...formData, dependencies: e.target.value })}
            className="w-full px-4 py-2 bg-surface-1 border border-surface-3 rounded-lg"
            placeholder="service-a, service-b (comma-separated)"
          />
          <p className="text-xs text-text-secondary">Service names this entry depends on</p>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Entry' : 'Update Entry'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-surface-1 border border-surface-3 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
