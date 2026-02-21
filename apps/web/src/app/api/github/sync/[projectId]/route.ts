/**
 * GitHub Sync API Route
 * Handles bidirectional sync operations between UIForge projects and GitHub repositories
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifySession } from '@/lib/api/auth';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import { githubClient } from '@/lib/github/client';
import { commitPatternGenerator } from '@/lib/github/commit-patterns';
import { architectureTemplateManager } from '@/lib/github/architecture-templates';
import { z } from 'zod';

// Helper functions for GitHub import
function filterComponentFiles(repoContents: any[], configuration: any): any[] {
  const template = architectureTemplateManager.getTemplate(configuration.architecture_type);
  if (!template) {
    console.warn('Unknown architecture template:', configuration.architecture_type);
    return [];
  }

  const componentExtensions = ['.tsx', '.jsx', '.ts', '.js'];
  const componentPaths = ['components', 'src/components', 'lib/components', 'ui/components'];

  return repoContents.filter((file: any) => {
    if (file.type !== 'file') return false;

    const hasComponentExtension = componentExtensions.some((ext: string) => file.name.endsWith(ext));
    const isInComponentDirectory = componentPaths.some((path: string) => file.path.startsWith(path));

    return hasComponentExtension && isInComponentDirectory;
  });
}

function extractComponentName(filePath: string, configuration: any): string {
  // Remove directory path and extension
  let fileName = filePath.split('/').pop() || '';
  fileName = fileName.replace(/\.(tsx?|jsx?)$/, '');

  // Convert to appropriate naming convention
  switch (configuration.component_naming_pattern) {
    case 'PascalCase':
      return fileName.replace(/(?:^|[-_])(\w)/g, (_, char) => char.toUpperCase());
    case 'camelCase':
      return fileName.replace(/(?:^|[-_])(\w)/g, (_, char, index) =>
        index === 0 ? char.toLowerCase() : char.toUpperCase());
    case 'kebab-case':
      return fileName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
    case 'snake_case':
      return fileName.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
    default:
      return fileName;
  }
}

function detectConflict(existingComponent: any, githubContent: string, githubPath: string): boolean {
  // Check if local component has been modified since last sync
  const lastSyncedAt = existingComponent.props?.lastSyncedAt;
  const lastSyncedFrom = existingComponent.props?.lastSyncedFrom;

  if (!lastSyncedAt || !lastSyncedFrom) {
    // No sync history, assume conflict if content differs
    return existingComponent.code_content !== githubContent;
  }

  // If component was last synced from GitHub and local content differs, there's a conflict
  if (lastSyncedFrom === 'github' && existingComponent.code_content !== githubContent) {
    return true;
  }

  // If component was last synced to GitHub and GitHub content differs, there's a conflict
  if (lastSyncedFrom === 'uiforge' && existingComponent.code_content !== githubContent) {
    return true;
  }

  // Check timestamps - if local was modified after last sync, there might be a conflict
  const localModifiedAt = new Date(existingComponent.updated_at);
  const lastSyncDate = new Date(lastSyncedAt);

  if (localModifiedAt > lastSyncDate && existingComponent.code_content !== githubContent) {
    return true;
  }

  return false;
}

// Validation schemas
const syncRequestSchema = z.object({
  direction: z.enum(['to_github', 'from_github', 'bidirectional']),
  branch: z.string().optional(),
  create_pull_request: z.boolean().default(false),
  pr_title: z.string().optional(),
  pr_body: z.string().optional(),
  components: z.array(z.string()).optional(),
});

// GET /api/github/sync/[projectId] - Get sync status for a project
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, 60, 60000);
    if (!rateLimitResult.allowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify session
    const session = await verifySession();
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = await createClient();

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', session.user.id)
      .single();

    if (projectError || !project) {
      return new NextResponse(
        JSON.stringify({ error: 'Project not found or access denied' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get sync status
    const { data: syncStatus, error: syncError } = await supabase
      .from('github_sync_status')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (syncError) {
      console.error('Sync status fetch error:', syncError);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch sync status' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get GitHub repository info if connected
    let repository = null;
    if (project.github_repo_id) {
      const { data: repo } = await supabase
        .from('github_repositories')
        .select('id, repo_name, repo_owner, repo_url, default_branch, is_private')
        .eq('id', project.github_repo_id)
        .single();

      repository = repo;
    }

    const response = new NextResponse(
      JSON.stringify({
        project: {
          id: project.id,
          name: project.name,
          github_sync_enabled: project.github_sync_enabled,
          github_branch: project.github_branch,
          last_github_sync_at: project.last_github_sync_at,
          repository,
        },
        syncStatus: syncStatus || [],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

    return setRateLimitHeaders(response, rateLimitResult, 60);
  } catch (error) {
    console.error('GitHub sync GET error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST /api/github/sync/[projectId] - Trigger sync operation
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, 60, 60000);
    if (!rateLimitResult.allowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify session
    const session = await verifySession();
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const validatedData = syncRequestSchema.parse(body);

    const supabase = await createClient();

    // Verify project ownership and GitHub connection
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', session.user.id)
      .single();

    if (projectError || !project) {
      return new NextResponse(
        JSON.stringify({ error: 'Project not found or access denied' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!project.github_repo_id) {
      return new NextResponse(
        JSON.stringify({ error: 'Project not connected to GitHub repository' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get GitHub repository and configuration
    const { data: repo, error: repoError } = await supabase
      .from('github_repositories')
      .select('*')
      .eq('id', project.github_repo_id)
      .single();

    const { data: config, error: configError } = await supabase
      .from('github_repo_config')
      .select('*')
      .eq('github_repo_id', project.github_repo_id)
      .single();

    if (repoError || configError || !repo || !config) {
      return new NextResponse(
        JSON.stringify({ error: 'GitHub repository configuration not found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize GitHub client
    await githubClient.initialize(repo.access_token_encrypted);

    // Create sync status record
    const { data: syncStatus, error: syncStatusError } = await supabase
      .from('github_sync_status')
      .insert({
        project_id: projectId,
        github_repo_id: repo.id,
        user_id: session.user.id,
        branch: validatedData.branch || project.github_branch || repo.default_branch,
        sync_status: 'in_progress',
        sync_type: 'component',
        sync_direction: validatedData.direction,
        triggered_by: 'user',
      })
      .select()
      .single();

    if (syncStatusError || !syncStatus) {
      return new NextResponse(
        JSON.stringify({ error: 'Failed to create sync status' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Perform sync operation asynchronously
    performSyncOperation({
      projectId,
      project,
      repository: repo,
      configuration: config,
      syncStatusId: syncStatus.id,
      direction: validatedData.direction,
      branch: validatedData.branch || project.github_branch || repo.default_branch,
      createPullRequest: validatedData.create_pull_request,
      prTitle: validatedData.pr_title,
      prBody: validatedData.pr_body,
      components: validatedData.components,
      supabase,
    }).catch(async (error) => {
      console.error('Sync operation failed:', error);
      // Update sync status with error
      await supabase
        .from('github_sync_status')
        .update({
          sync_status: 'error',
          error_message: error.message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', syncStatus.id);
    });

    const response = new NextResponse(
      JSON.stringify({
        message: 'Sync operation started',
        syncStatusId: syncStatus.id,
        direction: validatedData.direction,
      }),
      { status: 202, headers: { 'Content-Type': 'application/json' } }
    );

    return setRateLimitHeaders(response, rateLimitResult, 60);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid request data', details: error.issues }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.error('GitHub sync POST error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Sync operation function
async function performSyncOperation({
  projectId,
  project,
  repository,
  configuration,
  syncStatusId,
  direction,
  branch,
  createPullRequest,
  prTitle,
  prBody,
  components,
  supabase,
}: {
  projectId: string;
  project: any;
  repository: any;
  configuration: any;
  syncStatusId: string;
  direction: string;
  branch: string;
  createPullRequest?: boolean;
  prTitle?: string;
  prBody?: string;
  components?: string[];
  supabase: any;
}) {
  try {
    let filesSynced = 0;
    let filesCreated = 0;
    let filesUpdated = 0;
    let commitHash = null;

    if (direction === 'to_github' || direction === 'bidirectional') {
      // Get components to sync
      let query = supabase
        .from('components')
        .select('*')
        .eq('project_id', projectId);

      if (components && components.length > 0) {
        query = query.in('id', components);
      }

      const { data: componentsToSync } = await query;

      if (componentsToSync && componentsToSync.length > 0) {
        // Generate commit message
        const commitPattern = commitPatternGenerator.generateBatchCommit(
          componentsToSync.map((comp: any) => ({
            name: comp.name,
            path: getComponentPath(comp, configuration),
            operation: 'add', // TODO: Determine actual operation
            type: getComponentType(comp, configuration),
          })),
          {
            projectId,
            projectName: project.name,
            framework: project.framework,
            componentLibrary: project.component_library,
            timestamp: new Date().toISOString(),
            userId: project.user_id,
            operationType: 'add',
            componentsCount: componentsToSync.length,
            architectureType: configuration.architecture_type,
          }
        );

        const commitMessage = commitPatternGenerator.formatCommitMessage(commitPattern);

        // Sync each component to GitHub
        for (const component of componentsToSync) {
          const filePath = getComponentPath(component, configuration);
          const fileContent = component.code_file_path
            ? await getComponentContent(component.code_file_path, supabase)
            : `// ${component.name} component\n// TODO: Add component implementation`;

          const result = await githubClient.createOrUpdateFile(
            repository.repo_owner,
            repository.repo_name,
            {
              path: filePath,
              content: fileContent,
              message: commitMessage,
              branch,
            }
          );

          filesSynced++;
          if (result) {
            filesCreated++;
            commitHash = result.sha;
          }
        }
      }
    }

    if (direction === 'from_github' || direction === 'bidirectional') {
      // GitHub → UIForge import
      try {
        // Get repository contents from GitHub
        const repoContents = await githubClient.getRepositoryContents(
          repository.repo_owner,
          repository.repo_name,
          branch
        );

        // Filter for component files based on architecture template
        const componentFiles = filterComponentFiles(repoContents, configuration);

        // Import each component with conflict detection
        for (const file of componentFiles) {
          const fileContent = await githubClient.getFileContent(
            repository.repo_owner,
            repository.repo_name,
            file.path,
            branch
          );

          // Extract component name from file path
          const componentName = extractComponentName(file.path, configuration);

          // Check if component already exists
          const { data: existingComponent } = await supabase
            .from('components')
            .select('*')
            .eq('project_id', projectId)
            .eq('name', componentName)
            .single();

          if (existingComponent) {
            // Check for conflicts
            const hasConflict = detectConflict(existingComponent, fileContent, file.path);

            if (hasConflict) {
              // Create conflict record
              await supabase
                .from('github_sync_conflicts')
                .insert({
                  project_id: projectId,
                  component_id: existingComponent.id,
                  component_name: componentName,
                  github_path: file.path,
                  local_content: existingComponent.code_content,
                  github_content: fileContent,
                  conflict_type: 'content_modified_both',
                  resolution_status: 'pending',
                  created_at: new Date().toISOString(),
                });

              // Don't update the component - wait for conflict resolution
              continue;
            } else {
              // No conflict, safe to update
              await supabase
                .from('components')
                .update({
                  code_content: fileContent,
                  updated_at: new Date().toISOString(),
                  props: {
                    ...existingComponent.props,
                    lastSyncedFrom: 'github',
                    lastSyncedAt: new Date().toISOString(),
                  },
                })
                .eq('id', existingComponent.id);
              filesUpdated++;
            }
          } else {
            // Create new component
            await supabase
              .from('components')
              .insert({
                project_id: projectId,
                name: componentName,
                description: `Imported from GitHub: ${file.path}`,
                component_type: 'imported',
                framework: project.framework,
                code_content: fileContent,
                props: {
                  importedFrom: 'github',
                  originalPath: file.path,
                  architectureType: configuration.architecture_type,
                  lastSyncedFrom: 'github',
                  lastSyncedAt: new Date().toISOString(),
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            filesCreated++;
          }
          filesSynced++;
        }

        // Get the latest commit hash
        const latestCommit = await githubClient.getLatestCommit(
          repository.repo_owner,
          repository.repo_name,
          branch
        );
        commitHash = latestCommit.sha;
      } catch (importError) {
        console.error('GitHub import failed:', importError);
        throw new Error('Failed to import components from GitHub');
      }
    }

    // Create pull request if requested
    let prNumber = null;
    let prUrl = null;
    if (createPullRequest && branch !== repository.default_branch) {
      try {
        const pr = await githubClient.createPullRequest(
          repository.repo_owner,
          repository.repo_name,
          prTitle || `Sync components from ${project.name}`,
          prBody || `Sync ${filesSynced} components from UIForge project ${project.name}`,
          branch,
          repository.default_branch
        );
        prNumber = pr.number;
        prUrl = pr.html_url;
      } catch (prError) {
        console.error('Failed to create pull request:', prError);
      }
    }

    // Update sync status with success
    const { error: updateError } = await supabase
      .from('github_sync_status')
      .update({
        sync_status: 'success',
        commit_hash: commitHash,
        commit_url: commitHash ? `https://github.com/${repository.repo_owner}/${repository.repo_name}/commit/${commitHash}` : null,
        pr_number: prNumber,
        pr_url: prUrl,
        files_synced: filesSynced,
        files_created: filesCreated,
        files_updated: filesUpdated,
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', syncStatusId);

    if (updateError) {
      console.error('Failed to update sync status:', updateError);
      throw new Error(`Failed to update sync status: ${updateError.message}`);
    }

    // Update project's last sync time
    const { error: projectUpdateError } = await supabase
      .from('projects')
      .update({
        last_github_sync_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (projectUpdateError) {
      console.error('Failed to update project sync time:', projectUpdateError);
      throw new Error(`Failed to update project sync time: ${projectUpdateError.message}`);
    }

  } catch (error) {
    console.error('Sync operation error:', error);
    throw error;
  }
}

// Helper functions
function getComponentPath(component: any, configuration: any): string {
  const template = architectureTemplateManager.getTemplate(configuration.architecture_type);
  if (!template) {
    return `components/${component.name}${configuration.file_extension}`;
  }

  const componentType = getComponentType(component, configuration);
  const formattedName = architectureTemplateManager.formatComponentName(
    component.name,
    configuration
  );

  return `${componentType}s/${formattedName}${configuration.file_extension}`;
}

function getComponentType(component: any, configuration: any): string {
  // Map component types to architecture types
  switch (configuration.architecture_type) {
    case 'atomic':
      return mapToAtomicType(component.component_type);
    case 'fsd':
      return mapToFSDType(component.component_type);
    default:
      return 'components';
  }
}

function mapToAtomicType(componentType: string): string {
  const typeMap: Record<string, string> = {
    button: 'atom',
    input: 'atom',
    card: 'molecule',
    form: 'organism',
    header: 'organism',
    navbar: 'organism',
    sidebar: 'organism',
    table: 'organism',
  };
  return typeMap[componentType] || 'atom';
}

function mapToFSDType(componentType: string): string {
  // For FSD, most components go to features or widgets based on complexity
  const complexTypes = ['form', 'table', 'navbar', 'sidebar'];
  return complexTypes.includes(componentType) ? 'widget' : 'feature';
}

async function getComponentContent(filePath: string, supabase: any): Promise<string> {
  // TODO: Implement actual file content retrieval from storage
  return `// Component content for ${filePath}\n// TODO: Implement file content retrieval`;
}
