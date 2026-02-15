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
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1 rounded hover:bg-gray-100"
        >
          <MoreVerticalIcon className="h-5 w-5 text-gray-400" />
        </button>
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
              <div className="py-1">
                <button
                  onClick={() => {
                    router.push(`/projects/${projectId}/edit`);
                    setMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit2Icon className="mr-3 h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setDeleteConfirmOpen(true);
                    setMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Project</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <strong>{projectName}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
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
