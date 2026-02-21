'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeleteProject } from '@/hooks/use-projects';
import { MoreVerticalIcon, Edit2Icon, TrashIcon, GithubIcon, RefreshCwIcon, XIcon } from 'lucide-react';
import { GitHubRepoSelector } from '@/components/github/GitHubRepoSelector';
import { SyncStatusIndicator } from '@/components/github/SyncStatusIndicator';

interface ProjectActionsProps {
  projectId: string;
  projectName: string;
}

export default function ProjectActions({ projectId, projectName }: ProjectActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [showGitHubSelector, setShowGitHubSelector] = useState(false);
  const [showSyncStatus, setShowSyncStatus] = useState(false);
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
          className="p-1 rounded hover:bg-accent"
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
                  className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-accent"
                >
                  <Edit2Icon className="mr-3 h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowGitHubSelector(true);
                    setMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-accent"
                >
                  <GithubIcon className="mr-3 h-4 w-4" />
                  Connect GitHub
                </button>
                <button
                  onClick={() => {
                    setShowSyncStatus(true);
                    setMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-accent"
                >
                  <RefreshCwIcon className="mr-3 h-4 w-4" />
                  Sync Status
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Project</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <strong>{projectName}</strong>? This action cannot be undone.
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

      {/* GitHub Repository Selector Modal */}
      {showGitHubSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Connect GitHub Repository</h3>
              <button
                onClick={() => setShowGitHubSelector(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close GitHub selector"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <GitHubRepoSelector
              projectId={projectId}
              onRepositoryConnected={() => setShowGitHubSelector(false)}
            />
          </div>
        </div>
      )}

      {/* Sync Status Modal */}
      {showSyncStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">GitHub Sync Status</h3>
              <button
                onClick={() => setShowSyncStatus(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close sync status"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <SyncStatusIndicator projectId={projectId} />
          </div>
        </div>
      )}
    </>
  );
}
