'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeleteProject } from '@/hooks/use-projects';
import { MoreVerticalIcon, Edit2Icon, TrashIcon } from 'lucide-react';

interface ProjectActionsProps {
  projectId: string;
  projectName: string;
}

export default function ProjectActions({ projectId, projectName }: ProjectActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const router = useRouter();
  const deleteProject = useDeleteProject();

  const handleDelete = async () => {
    try {
      await deleteProject.mutateAsync(projectId);
      setDeleteConfirmOpen(false);
      setMenuOpen(false);
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  return (
    <>
      <div className="relative">
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 rounded hover:bg-accent">
          <MoreVerticalIcon className="h-5 w-5 text-text-muted" />
        </button>
        {menuOpen && (
          <>
            <div
              role="presentation"
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setMenuOpen(false);
              }}
            />
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-surface-1 ring-1 ring-surface-3 z-20">
              <div className="py-1">
                <button
                  onClick={() => {
                    router.push(`/projects/${projectId}/edit`);
                    setMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-accent"
                >
                  <Edit2Icon className="mr-3 h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setDeleteConfirmOpen(true);
                    setMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-destructive hover:bg-accent"
                >
                  <TrashIcon className="mr-3 h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-surface-1 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Delete Project</h3>
            <p className="text-sm text-text-secondary mb-6">
              Are you sure you want to delete <strong>{projectName}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 border border rounded-md text-sm font-medium text-foreground hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteProject.isPending}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {deleteProject.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
