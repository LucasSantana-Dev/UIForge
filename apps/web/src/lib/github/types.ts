export interface GitHubInstallation {
  id: string;
  userId: string;
  installationId: number;
  accountLogin: string;
  accountType: 'User' | 'Organization';
  permissions: Record<string, string> | null;
  suspendedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubRepo {
  id: string;
  installationId: string;
  projectId: string | null;
  githubRepoId: number;
  fullName: string;
  defaultBranch: string;
  createdAt: string;
}

export interface GitHubAppConfig {
  appId: string;
  privateKey: string;
  webhookSecret: string;
  clientId: string;
  clientSecret: string;
}

export interface CreateBranchParams {
  owner: string;
  repo: string;
  branchName: string;
  baseBranch?: string;
}

export interface PushFilesParams {
  owner: string;
  repo: string;
  branch: string;
  files: Array<{ path: string; content: string }>;
  message: string;
}

export interface CreatePRParams {
  owner: string;
  repo: string;
  title: string;
  body: string;
  head: string;
  base: string;
}

export interface PRResult {
  number: number;
  url: string;
  htmlUrl: string;
}

export interface WebhookEvent {
  action: string;
  installation?: {
    id: number;
    account: {
      login: string;
      type: string;
    };
    permissions: Record<string, string>;
    suspended_at: string | null;
  };
  repositories_added?: Array<{
    id: number;
    full_name: string;
    default_branch: string;
  }>;
  repositories_removed?: Array<{
    id: number;
    full_name: string;
  }>;
  sender: {
    id: number;
    login: string;
  };
}
