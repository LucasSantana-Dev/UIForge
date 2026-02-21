'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Github,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  FolderSync
} from 'lucide-react';
import { GitHubRepoSelector } from '@/components/github/GitHubRepoSelector';
import { SyncStatusIndicator } from '@/components/github/SyncStatusIndicator';

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

interface GitHubSettingsProps {}

interface Repository {
  id: string;
  repo_name: string;
  repo_owner: string;
  repo_url: string;
  default_branch: string;
  is_private: boolean;
  auto_sync_enabled: boolean;
  configuration?: any;
  created_at: string;
  updated_at: string;
}

interface SyncConflict {
  id: string;
  component_name: string;
  github_path: string;
  conflict_type: string;
  resolution_status: string;
  created_at: string;
  severity: string;
}

interface SyncStatus {
  id: string;
  sync_status: string;
  direction: string;
  files_synced: number;
  files_created: number;
  files_updated: number;
  files_conflicted: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export default function GitHubSettings({}: GitHubSettingsProps) {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [syncHistory, setSyncHistory] = useState<SyncStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('repositories');
  const [showRepoSelector, setShowRepoSelector] = useState(false);

  useEffect(() => {
    fetchGitHubData();
  }, []);

  const fetchGitHubData = async () => {
    try {
      setIsLoading(true);

      // Fetch repositories
      const reposResponse = await fetch('/api/github/repositories');
      if (reposResponse.ok) {
        const reposData = await reposResponse.json();
        setRepositories(reposData.data || []);
      }

      // Fetch conflicts
      const conflictsResponse = await fetch('/api/github/conflicts');
      if (conflictsResponse.ok) {
        const conflictsData = await conflictsResponse.json();
        setConflicts(conflictsData.data || []);
      }

      // Fetch sync history
      const historyResponse = await fetch('/api/github/sync-history');
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setSyncHistory(historyData.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch GitHub data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveConflict = async (conflictId: string, resolution: string) => {
    try {
      const response = await fetch(`/api/github/conflicts/${conflictId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resolution }),
      });

      if (response.ok) {
        // Refresh conflicts
        const conflictsResponse = await fetch('/api/github/conflicts');
        if (conflictsResponse.ok) {
          const conflictsData = await conflictsResponse.json();
          setConflicts(conflictsData.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">GitHub Integration Settings</h1>
          <p className="text-muted-foreground">
            Manage your GitHub repositories, sync settings, and resolve conflicts
          </p>
        </div>
        <Button onClick={() => setShowRepoSelector(true)}>
          <Github className="h-4 w-4 mr-2" />
          Connect Repository
        </Button>
      </div>

      {showRepoSelector && (
        <GitHubRepoSelector
          projectId="settings"
          onRepositoryConnected={() => {
            setShowRepoSelector(false);
            fetchGitHubData();
          }}
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="repositories">Repositories</TabsTrigger>
          <TabsTrigger value="sync">Sync Status</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="repositories" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : repositories.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Github className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No repositories connected</h3>
                <p className="text-muted-foreground mb-4">
                  Connect a GitHub repository to start syncing your components
                </p>
                <Button onClick={() => setShowRepoSelector(true)}>
                  <Github className="h-4 w-4 mr-2" />
                  Connect Repository
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {repositories.map((repo) => (
                <Card key={repo.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{repo.repo_name}</CardTitle>
                      {repo.is_private && (
                        <Badge variant="secondary">Private</Badge>
                      )}
                    </div>
                    <CardDescription>
                      {repo.repo_owner} • {repo.default_branch}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Auto-sync</span>
                      <Switch
                        checked={repo.auto_sync_enabled}
                        onCheckedChange={async (checked) => {
                          // Update auto-sync setting
                          await fetch(`/api/github/repositories`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              repo_id: repo.id,
                              auto_sync_enabled: checked,
                            }),
                          });
                          fetchGitHubData();
                        }}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <SyncStatusIndicator projectId={repo.id} />
                    </div>

                    <div className="pt-2 border-t">
                      <a
                        href={repo.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View on GitHub →
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          {conflicts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No conflicts</h3>
                <p className="text-muted-foreground">
                  All your components are in sync with GitHub
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You have {conflicts.length} conflicts that need to be resolved.
                </AlertDescription>
              </Alert>

              {conflicts.map((conflict) => (
                <Card key={conflict.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{conflict.component_name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(conflict.severity)}>
                          {conflict.severity}
                        </Badge>
                        <Badge variant="outline">
                          {conflict.conflict_type}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>
                      {conflict.github_path} • {new Date(conflict.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Status: <span className="font-medium">{conflict.resolution_status}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveConflict(conflict.id, 'resolved_local')}
                        >
                          Use Local
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveConflict(conflict.id, 'resolved_github')}
                        >
                          Use GitHub
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleResolveConflict(conflict.id, 'ignored')}
                        >
                          Ignore
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {syncHistory.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No sync history</h3>
                <p className="text-muted-foreground">
                  Your sync operations will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {syncHistory.map((sync) => (
                <Card key={sync.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Sync Operation</CardTitle>
                      <Badge className={getStatusColor(sync.sync_status)}>
                        {sync.sync_status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {sync.direction} • {new Date(sync.created_at).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Files Synced:</span>
                        <div className="font-medium">{sync.files_synced}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <div className="font-medium">{sync.files_created}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Updated:</span>
                        <div className="font-medium">{sync.files_updated}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Conflicts:</span>
                        <div className="font-medium">{sync.files_conflicted}</div>
                      </div>
                    </div>

                    {sync.error_message && (
                      <Alert className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{sync.error_message}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Status</CardTitle>
              <CardDescription>
                Monitor your GitHub sync operations and trigger manual syncs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SyncStatusIndicator projectId="current" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
