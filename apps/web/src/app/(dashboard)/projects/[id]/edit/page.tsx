export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import EditProjectForm from '@/components/projects/EditProjectForm';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/projects/${id}`}
          className="inline-flex items-center text-sm text-text-secondary hover:text-text-primary"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Project
        </Link>
      </div>

      <div className="bg-surface-1 rounded-lg border border-surface-3 p-6">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Edit Project</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <EditProjectForm projectId={id} />
        </Suspense>
      </div>
    </div>
  );
}
