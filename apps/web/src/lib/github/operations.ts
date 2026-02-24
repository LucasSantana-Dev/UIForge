import { getInstallationOctokit } from './client';
import type { CreateBranchParams, PushFilesParams, CreatePRParams, PRResult } from './types';

export async function createBranch(installationId: number, params: CreateBranchParams) {
  const octokit = await getInstallationOctokit(installationId);
  const { owner, repo, branchName, baseBranch = 'main' } = params;

  const { data: ref } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${baseBranch}`,
  });

  await octokit.rest.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${branchName}`,
    sha: ref.object.sha,
  });

  return { sha: ref.object.sha };
}

export async function pushFiles(installationId: number, params: PushFilesParams) {
  const octokit = await getInstallationOctokit(installationId);
  const { owner, repo, branch, files, message } = params;

  const { data: ref } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  });

  const { data: baseCommit } = await octokit.rest.git.getCommit({
    owner,
    repo,
    commit_sha: ref.object.sha,
  });

  const blobs = await Promise.all(
    files.map((file) =>
      octokit.rest.git.createBlob({
        owner,
        repo,
        content: Buffer.from(file.content).toString('base64'),
        encoding: 'base64',
      })
    )
  );

  const { data: tree } = await octokit.rest.git.createTree({
    owner,
    repo,
    base_tree: baseCommit.tree.sha,
    tree: files.map((file, i) => ({
      path: file.path,
      mode: '100644' as const,
      type: 'blob' as const,
      sha: blobs[i].data.sha,
    })),
  });

  const { data: newCommit } = await octokit.rest.git.createCommit({
    owner,
    repo,
    message,
    tree: tree.sha,
    parents: [ref.object.sha],
  });

  await octokit.rest.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: newCommit.sha,
  });

  return { commitSha: newCommit.sha };
}

export async function createPR(installationId: number, params: CreatePRParams): Promise<PRResult> {
  const octokit = await getInstallationOctokit(installationId);

  const { data: pr } = await octokit.rest.pulls.create({
    owner: params.owner,
    repo: params.repo,
    title: params.title,
    body: params.body,
    head: params.head,
    base: params.base,
  });

  return {
    number: pr.number,
    url: pr.url,
    htmlUrl: pr.html_url,
  };
}

export async function listRepos(installationId: number) {
  const octokit = await getInstallationOctokit(installationId);

  const { data } = await octokit.rest.apps.listReposAccessibleToInstallation({
    per_page: 100,
  });

  return data.repositories.map((r) => ({
    id: r.id,
    fullName: r.full_name,
    defaultBranch: r.default_branch ?? 'main',
    private: r.private,
    description: r.description,
    language: r.language,
    updatedAt: r.updated_at,
  }));
}

export async function getRepoDetails(installationId: number, owner: string, repo: string) {
  const octokit = await getInstallationOctokit(installationId);

  const { data } = await octokit.rest.repos.get({ owner, repo });

  return {
    id: data.id,
    fullName: data.full_name,
    defaultBranch: data.default_branch,
    private: data.private,
    description: data.description,
    language: data.language,
    updatedAt: data.updated_at,
  };
}
