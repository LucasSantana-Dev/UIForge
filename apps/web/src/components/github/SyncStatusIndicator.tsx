/**
 * GitHub Sync Status Indicator Component
 * Shows the current sync status between UIForge and GitHub
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Loader2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Github,
  ExternalLink,
  MoreVertical,
  FolderSync,
} from 'lucide-react';

interface SyncStatus {
  id: string;
  sync_status: 'pending' | 'in_progress' | 'success' | 'error' | 'conflict';
  branch: string;
  last_sync_at: string | null;
  commit_hash: string | null;
  commit_url: string | null;
  pr_number: number | null;
  pr_url: string | null;
  error_message: string | null;
  files_synced: number;
  files_created: number;
  files_updated: number;
  files_deleted: number;
  sync_type: string;
  sync_direction: string;
  created_at: string;
}

interface SyncStatusIndicatorProps {
  projectId: string;
  compact?: boolean;
  showActions?: boolean;
}

export function SyncStatusIndicator({
  projectId,
  compact = false,
  showActions = true,
}: SyncStatusIndicatorProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchSyncStatus();
    // Poll for updates every 5 seconds if syncing
    const interval = setInterval(() => {
      if (syncStatus?.sync_status === 'in_progress') {
        fetchSyncStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [projectId, syncStatus?.sync_status]);

  const fetchSyncStatus = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/github/sync/${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sync status');
      }

      const data = await response.json();
      const latestStatus = data.syncStatus?.[0] || null;
      setSyncStatus(latestStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (direction: 'to_github' | 'from_github' | 'bidirectional') => {
    setIsSyncing(true);
    setError(null);

    try {
      const response = await fetch(`/api/github/sync/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          direction,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start sync');
      }

      const data = await response.json();
      // Refresh status after starting sync
      await fetchSyncStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
      case 'conflict':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <RefreshCw className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'conflict':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'Syncing...';
      case 'success':
        return 'Synced';
      case 'error':
        return 'Error';
      case 'conflict':
        return 'Conflict';
      default:
        return 'Unknown';
    }
  };

  const sanitizeUrl = (url: string | null): string => {
    if (!url) return '#';

    // Only allow GitHub URLs
    if (url.startsWith('https://github.com/')) {
      // Additional validation: ensure it's a valid GitHub URL format
      const githubUrlPattern = /^https:\/\/github\.com\/[^\/\s]+\/[^\/\s]+(\/.*)?$/;
      return githubUrlPattern.test(url) ? url : '#';
    }

    return '#';
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {syncStatus ? (
          <>
            <Badge className={getStatusColor(syncStatus.sync_status)}>
              {getStatusIcon(syncStatus.sync_status)}
              <span className="ml-1">{getStatusText(syncStatus.sync_status)}</span>
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatTimeAgo(syncStatus.last_sync_at)}
            </span>
          </>
        ) : (
          <Badge variant="outline">Not connected</Badge>
        )}
        {showActions && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSync('to_github')}
            disabled={isSyncing || !syncStatus}
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Github className="h-5 w-5" />
            <CardTitle className="text-lg">GitHub Sync Status</CardTitle>
          </div>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSync('to_github')}>
                  <FolderSync className="h-4 w-4 mr-2" />
                  Sync to GitHub
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSync('from_github')}>
                  <Github className="h-4 w-4 mr-2" />
                  Import from GitHub
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSync('bidirectional')}>
                  <FolderSync className="h-4 w-4 mr-2" />
                  Bidirectional Sync
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <CardDescription>
          Last sync: {syncStatus ? formatTimeAgo(syncStatus.last_sync_at) : 'Never'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading sync status...</span>
          </div>
        ) : syncStatus ? (
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Badge className={getStatusColor(syncStatus.sync_status)}>
                {getStatusIcon(syncStatus.sync_status)}
                <span className="ml-1">{getStatusText(syncStatus.sync_status)}</span>
              </Badge>
              <span className="text-sm text-muted-foreground">
                {syncStatus.sync_direction} • {syncStatus.branch}
              </span>
            </div>

            {/* Progress for in-progress sync */}
            {syncStatus.sync_status === 'in_progress' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Syncing files...</span>
                  <span>{syncStatus.files_synced} files</span>
                </div>
                <Progress value={Math.min((syncStatus.files_synced / 10) * 100, 100)} />
              </div>
            )}

            {/* Sync Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Files Created:</span>
                <span className="ml-2 font-medium">{syncStatus.files_created}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Files Updated:</span>
                <span className="ml-2 font-medium">{syncStatus.files_updated}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Files Deleted:</span>
                <span className="ml-2 font-medium">{syncStatus.files_deleted}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Files:</span>
                <span className="ml-2 font-medium">{syncStatus.files_synced}</span>
              </div>
            </div>

            {/* Error Message */}
            {syncStatus.error_message && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{syncStatus.error_message}</AlertDescription>
              </Alert>
            )}

            {/* Links */}
            <div className="flex items-center space-x-4">
              {syncStatus.commit_url && (
                <a
                  href={sanitizeUrl(syncStatus.commit_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Commit
                </a>
              )}
              {syncStatus.pr_url && (
                <a
                  href={sanitizeUrl(syncStatus.pr_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Pull Request #{syncStatus.pr_number}
                </a>
              )}
            </div>

            {/* Sync Actions */}
            {showActions && (
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleSync('to_github')}
                  disabled={isSyncing || syncStatus.sync_status === 'in_progress'}
                  size="sm"
                >
                  {isSyncing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FolderSync className="h-4 w-4 mr-2" />
                  )}
                  Sync to GitHub
                </Button>
                <Button
                  onClick={() => handleSync('from_github')}
                  disabled={isSyncing || syncStatus.sync_status === 'in_progress'}
                  variant="outline"
                  size="sm"
                >
                  <Github className="h-4 w-4 mr-2" />
                  Import from GitHub
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Github className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No GitHub sync status</h3>
            <p className="text-muted-foreground mb-4">
              Connect a GitHub repository to start syncing your components
            </p>
            {showActions && (
              <Button onClick={() => handleSync('to_github')} disabled>
                <FolderSync className="h-4 w-4 mr-2" />
                Sync to GitHub
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
