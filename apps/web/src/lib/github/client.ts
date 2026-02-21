/**
 * GitHub API Client
 * Handles GitHub repository operations for UIForge integration
 */

import { Octokit } from '@octokit/rest';

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    type: string;
  };
  private: boolean;
  html_url: string;
  description: string | null;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface GitHubFile {
  path: string;
  sha: string;
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  content?: string;
  size: number;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  html_url: string;
}

export interface GitHubCreateRepoOptions {
  name: string;
  description?: string;
  private?: boolean;
  auto_init?: boolean;
}

export interface GitHubCreateFileOptions {
  path: string;
  content: string;
  message: string;
  branch?: string;
}

export interface GitHubSyncOptions {
  branch?: string;
  createPullRequest?: boolean;
  prTitle?: string;
  prBody?: string;
}

class GitHubClient {
  private octokit: Octokit | null = null;
  private token: string | null = null;

  /**
   * Initialize GitHub client with access token
   */
  async initialize(token: string): Promise<void> {
    this.token = token;
    this.octokit = new Octokit({
      auth: token,
    });
  }

  /**
   * Get authenticated user's repositories
   */
  async getUserRepositories(): Promise<GitHubRepository[]> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const response = await this.octokit.rest.repos.listForAuthenticatedUser({
        type: 'all',
        sort: 'updated',
        direction: 'desc',
        per_page: 100,
      });

      return response.data as GitHubRepository[];
    } catch (error) {
      console.error('Failed to fetch user repositories:', error);
      throw new Error('Failed to fetch repositories from GitHub');
    }
  }

  /**
   * Get repository branches
   */
  async getRepositoryBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const response = await this.octokit.rest.repos.listBranches({
        owner,
        repo,
      });

      return response.data as GitHubBranch[];
    } catch (error) {
      console.error('Failed to fetch repository branches:', error);
      throw new Error('Failed to fetch branches from GitHub');
    }
  }

  /**
   * Get repository contents
   */
  async getRepositoryContents(
    owner: string,
    repo: string,
    path: string = '',
    branch?: string
  ): Promise<GitHubFile[]> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const response = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });

      // Handle single file vs directory
      if (Array.isArray(response.data)) {
        return response.data as GitHubFile[];
      } else {
        return [response.data as GitHubFile];
      }
    } catch (error) {
      console.error('Failed to fetch repository contents:', error);
      throw new Error('Failed to fetch contents from GitHub');
    }
  }

  /**
   * Create a new repository
   */
  async createRepository(options: GitHubCreateRepoOptions): Promise<GitHubRepository> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const response = await this.octokit.rest.repos.createForAuthenticatedUser({
        name: options.name,
        description: options.description,
        private: options.private || false,
        auto_init: options.auto_init ?? true,
      });

      return response.data as GitHubRepository;
    } catch (error) {
      console.error('Failed to create repository:', error);
      throw new Error('Failed to create repository on GitHub');
    }
  }

  /**
   * Create or update a file in a repository
   */
  async createOrUpdateFile(
    owner: string,
    repo: string,
    options: GitHubCreateFileOptions
  ): Promise<GitHubCommit> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      // First check if file exists
      let sha: string | undefined;
      try {
        const existingFile = await this.octokit.rest.repos.getContent({
          owner,
          repo,
          path: options.path,
          ref: options.branch,
        });

        if (!Array.isArray(existingFile.data)) {
          sha = existingFile.data.sha;
        }
      } catch (error) {
        // File doesn't exist, that's okay for creation
        sha = undefined;
      }

      const response = await this.octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: options.path,
        message: options.message,
        content: Buffer.from(options.content).toString('base64'),
        sha,
        branch: options.branch,
      });

      return {
        sha: response.data.commit!.sha || '',
        message: response.data.commit!.message || '',
        author: {
          name: response.data.commit!.author!.name || '',
          email: response.data.commit!.author!.email || '',
          date: response.data.commit!.author!.date || '',
        },
        html_url: response.data.commit!.html_url || '',
      };
    } catch (error) {
      console.error('Failed to create/update file:', error);
      throw new Error('Failed to create/update file on GitHub');
    }
  }

  /**
   * Delete a file from a repository
   */
  async deleteFile(
    owner: string,
    repo: string,
    path: string,
    message: string,
    branch?: string
  ): Promise<GitHubCommit> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      // Get file SHA first
      const existingFile = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });

      if (Array.isArray(existingFile.data)) {
        throw new Error('Path is a directory, not a file');
      }

      const response = await this.octokit.rest.repos.deleteFile({
        owner,
        repo,
        path,
        message,
        sha: existingFile.data.sha,
        branch,
      });

      return {
        sha: response.data.commit!.sha || '',
        message: response.data.commit!.message || '',
        author: {
          name: response.data.commit!.author!.name || '',
          email: response.data.commit!.author!.email || '',
          date: response.data.commit!.author!.date || '',
        },
        html_url: response.data.commit!.html_url || '',
      };
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw new Error('Failed to delete file from GitHub');
    }
  }

  /**
   * Create a pull request
   */
  async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    body: string,
    head: string,
    base: string
  ): Promise<any> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const response = await this.octokit.rest.pulls.create({
        owner,
        repo,
        title,
        body,
        head,
        base,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to create pull request:', error);
      throw new Error('Failed to create pull request on GitHub');
    }
  }

  /**
   * Get repository information
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const response = await this.octokit.rest.repos.get({
        owner,
        repo,
      });

      return response.data as GitHubRepository;
    } catch (error) {
      console.error('Failed to fetch repository:', error);
      throw new Error('Failed to fetch repository from GitHub');
    }
  }

  /**
   * Check if user has write access to repository
   */
  async hasWriteAccess(owner: string, repo: string): Promise<boolean> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const response = await this.octokit.rest.repos.get({
        owner,
        repo,
      });
      const permissions = response.data.permissions;
      return !!(permissions?.push || permissions?.admin);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get rate limit information
   */
  async getRateLimit(): Promise<any> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const response = await this.octokit.rest.rateLimit.get();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch rate limit:', error);
      throw new Error('Failed to fetch rate limit from GitHub');
    }
  }

  /**
   * Get file content from repository
   */
  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    branch?: string
  ): Promise<string> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const response = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });

      if (Array.isArray(response.data)) {
        throw new Error('Path points to a directory, not a file');
      }

      if (response.data.type !== 'file') {
        throw new Error('Path does not point to a file');
      }

      // GitHub API returns base64 encoded content
      return Buffer.from(response.data.content, 'base64').toString('utf-8');
    } catch (error) {
      console.error('Failed to get file content:', error);
      throw new Error('Failed to get file content from GitHub');
    }
  }

  /**
   * Get latest commit from repository
   */
  async getLatestCommit(
    owner: string,
    repo: string,
    branch?: string
  ): Promise<GitHubCommit> {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const response = await this.octokit.rest.repos.getBranch({
        owner,
        repo,
        branch: branch || 'main',
      });

      return {
        sha: response.data.commit.sha || '',
        message: response.data.commit.commit?.message || '',
        author: {
          name: response.data.commit.author?.name || '',
          email: response.data.commit.author?.email || '',
          date: response.data.commit.commit?.author?.date || '',
        },
        html_url: response.data.commit.html_url || '',
      };
    } catch (error) {
      console.error('Failed to get latest commit:', error);
      throw new Error('Failed to get latest commit from GitHub');
    }
  }
}

// Export singleton instance
export const githubClient = new GitHubClient();
