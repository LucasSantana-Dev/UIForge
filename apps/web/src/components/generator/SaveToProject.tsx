'use client';

import { useState, useEffect } from 'react';
import { useCreateComponent } from '@/hooks/use-components';
import { CheckIcon, FolderIcon, SaveIcon, GithubIcon, RefreshCwIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface SaveToProjectProps {
  projectId: string;
  code: string;
  componentName: string;
  framework: string;
  componentLibrary?: string;
  style?: string;
  typescript: boolean;
  onSave?: (componentId: string) => void;
}

interface GitHubSyncStatus {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncAt?: string;
  syncEnabled: boolean;
}

export default function SaveToProject({
  projectId,
  code,
  componentName,
  framework,
  componentLibrary,
  style,
  typescript,
  onSave,
}: SaveToProjectProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [savedComponentId, setSavedComponentId] = useState<string | null>(null);
  const [syncToGitHub, setSyncToGitHub] = useState(false);
  const [githubSyncStatus, setGithubSyncStatus] = useState<GitHubSyncStatus>({
    isConnected: false,
    isSyncing: false,
    syncEnabled: false,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const createComponent = useCreateComponent();

  // Check GitHub sync status for the project
  useEffect(() => {
    const checkGitHubStatus = async () => {
      try {
        const response = await fetch(`/api/github/sync/${projectId}`);
        if (response.ok) {
          const data = await response.json();
          setGithubSyncStatus({
            isConnected: data.isConnected,
            isSyncing: data.isSyncing,
            lastSyncAt: data.lastSyncAt,
            syncEnabled: data.syncEnabled,
          });
        }
      } catch (error) {
        console.error('Failed to check GitHub status:', error);
      }
    };

    checkGitHubStatus();
  }, [projectId]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const result = await createComponent.mutateAsync({
        project_id: projectId,
        name: componentName,
        description: `Generated ${framework} component with ${componentLibrary || 'no'} library`,
        component_type: 'generated',
        framework,
        code_content: code,
        props: {
          componentLibrary,
          style,
          typescript,
        },
      });

      setSavedComponentId(result.id);
      onSave?.(result.id);

      // Trigger GitHub sync if enabled and connected
      if (syncToGitHub && githubSyncStatus.isConnected && githubSyncStatus.syncEnabled) {
        await triggerGitHubSync(result.id);
      }
    } catch (error) {
      console.error('Failed to save component:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const triggerGitHubSync = async (componentId: string) => {
    try {
      setIsSyncing(true);

      const response = await fetch(`/api/github/sync/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          direction: 'to_github',
          components: [componentId],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('GitHub sync triggered:', data);
      }
    } catch (error) {
      console.error('Failed to trigger GitHub sync:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
      {/* Main save section */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <FolderIcon className="h-4 w-4 mr-2" />
          Save to project
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || !!savedComponentId}
          className={cn(
            'inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
            isSaving || savedComponentId
              ? 'bg-green-600 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          {isSaving ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
              Saving...
            </>
          ) : savedComponentId ? (
            <>
              <CheckIcon className="h-4 w-4 mr-2" />
              Saved
            </>
          ) : (
            <>
              <SaveIcon className="h-4 w-4 mr-2" />
              Save Component
            </>
          )}
        </button>
      </div>

      {/* GitHub sync section */}
      {githubSyncStatus.isConnected && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <GithubIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-700">Sync to GitHub</span>
            </div>
            <Switch
              checked={syncToGitHub}
              onCheckedChange={setSyncToGitHub}
              disabled={!githubSyncStatus.syncEnabled}
            />
          </div>
          {githubSyncStatus.lastSyncAt && (
            <div className="text-xs text-gray-500">
              Last sync: {new Date(githubSyncStatus.lastSyncAt).toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* Status indicators */}
      <div className="flex items-center justify-between">
        {savedComponentId && (
          <div className="text-xs text-green-600">
            Component saved successfully!
          </div>
        )}

        {isSyncing && (
          <div className="flex items-center text-xs text-blue-600">
            <RefreshCwIcon className="h-3 w-3 mr-1 animate-spin" />
            Syncing to GitHub...
          </div>
        )}

        {githubSyncStatus.isConnected && syncToGitHub && !isSyncing && savedComponentId && (
          <Badge variant="secondary" className="text-xs">
            <GithubIcon className="h-3 w-3 mr-1" />
            GitHub sync enabled
          </Badge>
        )}
      </div>
    </div>
  );
}
