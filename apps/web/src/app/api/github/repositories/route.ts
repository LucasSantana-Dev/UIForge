/**
 * GitHub Repositories API Route
 * Handles listing, connecting, and managing GitHub repositories
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifySession } from '@/lib/api/auth';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import { githubClient } from '@/lib/github/client';
import { z } from 'zod';

// Validation schemas
const connectRepoSchema = z.object({
  github_repo_id: z.number(),
  repo_name: z.string().min(1).max(255),
  repo_owner: z.string().min(1).max(255),
  repo_url: z.string().url(),
  default_branch: z.string().default('main'),
  is_private: z.boolean().default(false),
  access_token: z.string().min(1),
});

const updateConfigSchema = z.object({
  architecture_type: z.enum(['atomic', 'fsd', 'custom']),
  folder_config: z.record(z.string(), z.any()).default({}),
  component_naming_pattern: z.enum(['PascalCase', 'camelCase', 'kebab-case', 'snake_case']).default('PascalCase'),
  file_extension: z.string().default('.tsx'),
  generate_index_files: z.boolean().default(true),
  sync_style_files: z.boolean().default(true),
  sync_test_files: z.boolean().default(false),
  sync_story_files: z.boolean().default(false),
  default_sync_branch: z.string().default('main'),
  create_pr_for_sync: z.boolean().default(false),
});

// GET /api/github/repositories - List user's GitHub repositories
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, 60, 60000);
    if (!rateLimitResult.allowed) {
      const response = new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
      return setRateLimitHeaders(response, rateLimitResult, 60);
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

    // Get connected repositories from database
    const { data: connectedRepos, error: dbError } = await supabase
      .from('github_repositories')
      .select('*')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false });

    if (dbError) {
      console.error('Database error:', dbError);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch repositories' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get repository configurations
    const repoIds = connectedRepos?.map(repo => repo.id) || [];
    let configurations = [];

    if (repoIds.length > 0) {
      const { data: configs, error: configError } = await supabase
        .from('github_repo_config')
        .select('*')
        .in('github_repo_id', repoIds);

      if (!configError) {
        configurations = configs || [];
      }
    }

    // Combine repositories with their configurations
    const repositories = connectedRepos?.map(repo => ({
      ...repo,
      configuration: configurations.find(config => config.github_repo_id === repo.id) || null,
      // Don't expose the encrypted token in the response
      access_token_encrypted: undefined,
    })) || [];

    const response = new NextResponse(
      JSON.stringify({ repositories }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

    return setRateLimitHeaders(response, rateLimitResult, 60);
  } catch (error) {
    console.error('GitHub repositories GET error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST /api/github/repositories - Connect a new GitHub repository
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, 60, 60000);
    if (!rateLimitResult.allowed) {
      const response = new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
      return setRateLimitHeaders(response, rateLimitResult, 60);
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
    const validatedData = connectRepoSchema.parse(body);

    // Initialize GitHub client with the provided token
    await githubClient.initialize(validatedData.access_token);

    // Verify repository access and get repository details
    const repo = await githubClient.getRepository(
      validatedData.repo_owner,
      validatedData.repo_name
    );

    // Check if user has write access
    const hasWriteAccess = await githubClient.hasWriteAccess(
      validatedData.repo_owner,
      validatedData.repo_name
    );

    if (!hasWriteAccess) {
      return new NextResponse(
        JSON.stringify({ error: 'No write access to repository' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = await createClient();

    // Check if repository is already connected
    const { data: existingRepo } = await supabase
      .from('github_repositories')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('github_repo_id', validatedData.github_repo_id)
      .single();

    if (existingRepo) {
      return new NextResponse(
        JSON.stringify({ error: 'Repository already connected' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Store encrypted access token (in a real implementation, you'd encrypt this)
    // For now, we'll store it as-is, but you should use proper encryption
    const encryptedToken = validatedData.access_token; // TODO: Implement encryption

    // Insert repository record
    const { data: newRepo, error: insertError } = await supabase
      .from('github_repositories')
      .insert({
        user_id: session.user.id,
        github_repo_id: validatedData.github_repo_id,
        repo_name: validatedData.repo_name,
        repo_owner: validatedData.repo_owner,
        repo_url: validatedData.repo_url,
        default_branch: validatedData.default_branch,
        is_private: validatedData.is_private,
        access_token_encrypted: encryptedToken,
        auto_sync_enabled: true,
        sync_frequency_minutes: 30,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to connect repository' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create default configuration
    const { error: configError } = await supabase
      .from('github_repo_config')
      .insert({
        user_id: session.user.id,
        github_repo_id: newRepo.id,
        architecture_type: 'atomic',
        folder_config: {},
        component_naming_pattern: 'PascalCase',
        file_extension: '.tsx',
        generate_index_files: true,
        sync_style_files: true,
        sync_test_files: false,
        sync_story_files: false,
        default_sync_branch: validatedData.default_branch,
        create_pr_for_sync: false,
      });

    if (configError) {
      console.error('Configuration insert error:', configError);
      // Don't fail the whole operation, but log the error
    }

    const response = new NextResponse(
      JSON.stringify({
        repository: {
          ...newRepo,
          access_token_encrypted: undefined, // Don't expose the token
        }
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

    return setRateLimitHeaders(response, rateLimitResult, 60);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid request data', details: error.issues }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.error('GitHub repositories POST error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// PUT /api/github/repositories - Update repository configuration
export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, 60, 60000);
    if (!rateLimitResult.allowed) {
      const response = new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
      return setRateLimitHeaders(response, rateLimitResult, 60);
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
    const { repo_id, config } = body;

    if (!repo_id || !config) {
      return new NextResponse(
        JSON.stringify({ error: 'Repository ID and configuration are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validatedConfig = updateConfigSchema.parse(config);

    const supabase = await createClient();

    // Verify repository ownership
    const { data: repo } = await supabase
      .from('github_repositories')
      .select('*')
      .eq('id', repo_id)
      .eq('user_id', session.user.id)
      .single();

    if (!repo) {
      return new NextResponse(
        JSON.stringify({ error: 'Repository not found or access denied' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update or insert configuration
    const { data: updatedConfig, error: updateError } = await supabase
      .from('github_repo_config')
      .upsert({
        user_id: session.user.id,
        github_repo_id: repo_id,
        ...validatedConfig,
      })
      .select()
      .single();

    if (updateError) {
      console.error('Configuration update error:', updateError);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to update configuration' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response = new NextResponse(
      JSON.stringify({ configuration: updatedConfig }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

    return setRateLimitHeaders(response, rateLimitResult, 60);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid configuration data', details: error.issues }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.error('GitHub repositories PUT error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// DELETE /api/github/repositories - Disconnect a GitHub repository
export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, 60, 60000);
    if (!rateLimitResult.allowed) {
      const response = new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
      return setRateLimitHeaders(response, rateLimitResult, 60);
    }

    // Verify session
    const session = await verifySession();
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { searchParams } = new URL(request.url);
    const repoId = searchParams.get('repo_id');

    if (!repoId) {
      return new NextResponse(
        JSON.stringify({ error: 'Repository ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = await createClient();

    // Verify repository ownership
    const { data: repo } = await supabase
      .from('github_repositories')
      .select('*')
      .eq('id', repoId)
      .eq('user_id', session.user.id)
      .single();

    if (!repo) {
      return new NextResponse(
        JSON.stringify({ error: 'Repository not found or access denied' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if repository is connected to any projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name')
      .eq('github_repo_id', repoId);

    if (projects && projects.length > 0) {
      return new NextResponse(
        JSON.stringify({
          error: 'Cannot disconnect repository connected to projects',
          projects: projects.map(p => ({ id: p.id, name: p.name }))
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete configuration first
    await supabase
      .from('github_repo_config')
      .delete()
      .eq('github_repo_id', repoId);

    // Delete repository
    const { error: deleteError } = await supabase
      .from('github_repositories')
      .delete()
      .eq('id', repoId);

    if (deleteError) {
      console.error('Repository delete error:', deleteError);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to disconnect repository' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response = new NextResponse(
      JSON.stringify({ message: 'Repository disconnected successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

    return setRateLimitHeaders(response, rateLimitResult, 60);
  } catch (error) {
    console.error('GitHub repositories DELETE error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
