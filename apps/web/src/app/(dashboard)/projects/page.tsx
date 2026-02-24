export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import ProjectList from '@/components/projects/ProjectList';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Projects</h1>
          <p className="mt-2 text-sm text-text-secondary">Manage your UI component projects</p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand-light"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Project
        </Link>
      </div>

      <Suspense fallback={<div>Loading projects...</div>}>
        <ProjectList />
      </Suspense>
    </div>
  );
}
