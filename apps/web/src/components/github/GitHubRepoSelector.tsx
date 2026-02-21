/**
 * GitHub Repository Selector Component
 * Allows users to connect and configure GitHub repositories
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Github, Plus, Settings, FolderSync, CheckCircle, AlertCircle } from 'lucide-react';
import { architectureTemplateManager } from '@/lib/github/architecture-templates';

interface GitHubRepository {
  id: string;
  github_repo_id: number;
  repo_name: string;
  repo_owner: string;
  repo_url: string;
  default_branch: string;
  is_private: boolean;
  auto_sync_enabled: boolean;
  configuration?: GitHubRepoConfig;
}

interface GitHubRepoConfig {
  architecture_type: 'atomic' | 'fsd' | 'custom';
  folder_config: Record<string, any>;
  component_naming_pattern: 'PascalCase' | 'camelCase' | 'kebab-case' | 'snake_case';
  file_extension: string;
  generate_index_files: boolean;
  sync_style_files: boolean;
  sync_test_files: boolean;
  sync_story_files: boolean;
  default_sync_branch: string;
  create_pr_for_sync: boolean;
}

interface GitHubRepoSelectorProps {
  projectId: string;
  onRepositoryConnected?: (repository: GitHubRepository) => void;
  onRepositoryDisconnected?: (repoId: string) => void;
}

export function GitHubRepoSelector({
  projectId,
  onRepositoryConnected,
  onRepositoryDisconnected,
}: GitHubRepoSelectorProps) {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null);
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [availableTemplates] = useState(architectureTemplateManager.getTemplates());

  // Connect form state
  const [connectForm, setConnectForm] = useState({
    repoUrl: '',
    accessToken: '',
    branch: 'main',
    architectureType: 'atomic' as 'atomic' | 'fsd' | 'custom',
  });

  // Configuration form state
  const [configForm, setConfigForm] = useState<Partial<GitHubRepoConfig>>({
    architecture_type: 'atomic',
    component_naming_pattern: 'PascalCase',
    file_extension: '.tsx',
    generate_index_files: true,
    sync_style_files: true,
    sync_test_files: false,
    sync_story_files: false,
    default_sync_branch: 'main',
    create_pr_for_sync: false,
  });

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/github/repositories');
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      const data = await response.json();
      setRepositories(data.repositories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
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

  const handleConnectRepository = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Parse repository URL to get owner and name
      const url = new URL(connectForm.repoUrl);
      const pathParts = url.pathname.replace('/', '').split('/');
      const [owner, name] = pathParts;

      if (!owner || !name) {
        throw new Error('Invalid repository URL');
      }

      const response = await fetch('/api/github/repositories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          github_repo_id: Date.now(), // This should come from GitHub API
          repo_name: name,
          repo_owner: owner,
          repo_url: connectForm.repoUrl,
          default_branch: connectForm.branch,
          access_token: connectForm.accessToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to connect repository');
      }

      const data = await response.json();
      const newRepo = data.repository;

      // Update configuration
      await updateRepositoryConfiguration(newRepo.id, {
        ...configForm,
        architecture_type: connectForm.architectureType,
        default_sync_branch: connectForm.branch,
      });

      setRepositories(prev => [...prev, newRepo]);
      setShowConnectForm(false);
      setConnectForm({ repoUrl: '', accessToken: '', branch: 'main', architectureType: 'atomic' });
      onRepositoryConnected?.(newRepo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectRepository = async (repoId: string) => {
    if (!confirm('Are you sure you want to disconnect this repository?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/github/repositories?repo_id=${repoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to disconnect repository');
      }

      setRepositories(prev => prev.filter(repo => repo.id !== repoId));
      onRepositoryDisconnected?.(repoId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateRepositoryConfiguration = async (repoId: string, config: Partial<GitHubRepoConfig>) => {
    try {
      const response = await fetch('/api/github/repositories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repo_id: repoId,
          config,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update configuration');
      }

      // Update local state
      setRepositories(prev =>
        prev.map(repo =>
          repo.id === repoId
            ? { ...repo, configuration: { ...repo.configuration, ...config } as GitHubRepoConfig }
            : repo
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update configuration');
    }
  };

  const getArchitectureTemplate = (type: string) => {
    return availableTemplates.find(template => template.id === type);
  };

  if (isLoading && repositories.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading repositories...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">GitHub Repositories</h3>
          <p className="text-sm text-muted-foreground">
            Connect your GitHub repositories to sync components
          </p>
        </div>
        <Button onClick={() => setShowConnectForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Connect Repository
        </Button>
      </div>

      {repositories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Github className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No repositories connected</h3>
            <p className="text-muted-foreground mb-4">
              Connect a GitHub repository to start syncing your components
            </p>
            <Button onClick={() => setShowConnectForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Connect Repository
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {repositories.map(repo => (
            <Card key={repo.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Github className="h-5 w-5" />
                    <div>
                      <CardTitle className="text-base">
                        {repo.repo_owner}/{repo.repo_name}
                      </CardTitle>
                      <CardDescription>
                        <a
                          href={sanitizeUrl(repo.repo_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {repo.repo_url}
                        </a>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {repo.is_private && (
                      <Badge variant="secondary">Private</Badge>
                    )}
                    {repo.auto_sync_enabled && (
                      <Badge variant="default">
                        <FolderSync className="h-3 w-3 mr-1" />
                        Auto-sync
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRepo(repo)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {repo.configuration && (
                <CardContent>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Architecture: {repo.configuration.architecture_type}</span>
                    <span>Branch: {repo.configuration.default_sync_branch}</span>
                    <span>Files: {repo.configuration.file_extension}</span>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Connect Repository Modal */}
      {showConnectForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Connect GitHub Repository</CardTitle>
              <CardDescription>
                Connect a GitHub repository to sync your components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="repoUrl">Repository URL</Label>
                  <Input
                    id="repoUrl"
                    placeholder="https://github.com/owner/repo"
                    value={connectForm.repoUrl}
                    onChange={(e) =>
                      setConnectForm(prev => ({ ...prev, repoUrl: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="accessToken">Access Token</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    placeholder="ghp_..."
                    value={connectForm.accessToken}
                    onChange={(e) =>
                      setConnectForm(prev => ({ ...prev, accessToken: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Token needs 'repo' scope to access and modify repositories
                  </p>
                </div>
                <div>
                  <Label htmlFor="branch">Default Branch</Label>
                  <Input
                    id="branch"
                    placeholder="main"
                    value={connectForm.branch}
                    onChange={(e) =>
                      setConnectForm(prev => ({ ...prev, branch: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="architecture">Architecture Type</Label>
                  <Select
                    value={connectForm.architectureType}
                    onValueChange={(value: 'atomic' | 'fsd' | 'custom') =>
                      setConnectForm(prev => ({ ...prev, architectureType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {template.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConnectForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConnectRepository}
                  disabled={!connectForm.repoUrl || !connectForm.accessToken || isLoading}
                >
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Connect Repository
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Configuration Modal */}
      {selectedRepo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Repository Configuration</CardTitle>
              <CardDescription>
                Configure how components are organized in {selectedRepo.repo_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="naming">Naming</TabsTrigger>
                  <TabsTrigger value="sync">Sync</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                  <div>
                    <Label htmlFor="architecture">Architecture Type</Label>
                    <Select
                      value={configForm.architecture_type}
                      onValueChange={(value: 'atomic' | 'fsd' | 'custom') =>
                        setConfigForm(prev => ({ ...prev, architecture_type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTemplates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            <div>
                              <div className="font-medium">{template.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {template.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {configForm.architecture_type && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Structure Preview</h4>
                      <div className="text-sm text-muted-foreground font-mono">
                        {getArchitectureTemplate(configForm.architecture_type)?.name}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="naming" className="space-y-4">
                  <div>
                    <Label htmlFor="namingPattern">Component Naming Pattern</Label>
                    <Select
                      value={configForm.component_naming_pattern}
                      onValueChange={(value: any) =>
                        setConfigForm(prev => ({ ...prev, component_naming_pattern: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PascalCase">PascalCase (Button)</SelectItem>
                        <SelectItem value="camelCase">camelCase (button)</SelectItem>
                        <SelectItem value="kebab-case">kebab-case (button)</SelectItem>
                        <SelectItem value="snake_case">snake_case (button)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="fileExtension">File Extension</Label>
                    <Select
                      value={configForm.file_extension}
                      onValueChange={(value: any) =>
                        setConfigForm(prev => ({ ...prev, file_extension: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=".tsx">.tsx</SelectItem>
                        <SelectItem value=".jsx">.jsx</SelectItem>
                        <SelectItem value=".ts">.ts</SelectItem>
                        <SelectItem value=".js">.js</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="generateIndexFiles"
                      checked={configForm.generate_index_files}
                      onCheckedChange={(checked: boolean) =>
                        setConfigForm(prev => ({ ...prev, generate_index_files: checked }))
                      }
                    />
                    <Label htmlFor="generateIndexFiles">Generate index files</Label>
                  </div>
                </TabsContent>

                <TabsContent value="sync" className="space-y-4">
                  <div>
                    <Label htmlFor="syncBranch">Default Sync Branch</Label>
                    <Input
                      id="syncBranch"
                      value={configForm.default_sync_branch}
                      onChange={(e) =>
                        setConfigForm(prev => ({ ...prev, default_sync_branch: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="syncStyleFiles"
                        checked={configForm.sync_style_files}
                        onCheckedChange={(checked: boolean) =>
                          setConfigForm(prev => ({ ...prev, sync_style_files: checked }))
                        }
                      />
                      <Label htmlFor="syncStyleFiles">Sync style files</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="syncTestFiles"
                        checked={configForm.sync_test_files}
                        onCheckedChange={(checked: boolean) =>
                          setConfigForm(prev => ({ ...prev, sync_test_files: checked }))
                        }
                      />
                      <Label htmlFor="syncTestFiles">Sync test files</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="syncStoryFiles"
                        checked={configForm.sync_story_files}
                        onCheckedChange={(checked: boolean) =>
                          setConfigForm(prev => ({ ...prev, sync_story_files: checked }))
                        }
                      />
                      <Label htmlFor="syncStoryFiles">Sync Storybook files</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="createPrForSync"
                        checked={configForm.create_pr_for_sync}
                        onCheckedChange={(checked: boolean) =>
                          setConfigForm(prev => ({ ...prev, create_pr_for_sync: checked }))
                        }
                      />
                      <Label htmlFor="createPrForSync">Create pull requests</Label>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setSelectedRepo(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    updateRepositoryConfiguration(selectedRepo.id, configForm);
                    setSelectedRepo(null);
                  }}
                >
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
