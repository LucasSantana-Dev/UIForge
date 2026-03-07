export const dynamic = 'force-dynamic';

import CatalogForm from '@/components/catalog/CatalogForm';

export default function NewCatalogEntryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-violet-400 font-display tracking-tight">
          Add to Catalog
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Register a new service, component, or resource
        </p>
      </div>

      <div className="bg-surface-1-1 border border-surface-3 rounded-xl p-6">
        <CatalogForm mode="create" />
      </div>
    </div>
  );
}
