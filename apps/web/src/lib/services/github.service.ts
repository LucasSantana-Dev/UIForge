import { generateAndCreatePR, getLinkedRepo } from '@/lib/github/pipeline';
import {
  insertPR,
  findPRsByProject,
  linkPRToGeneration,
  type GitHubPRRecord,
} from '@/lib/repositories/github.repo';

interface CreatePRFromGenerationParams {
  userId: string;
  projectId: string;
  generationId?: string;
  componentName: string;
  files: Array<{ path: string; content: string }>;
  prompt: string;
  model: string;
}

export async function createPRFromGeneration(params: CreatePRFromGenerationParams) {
  const repo = await getLinkedRepo(params.userId, params.projectId);
  if (!repo) {
    throw new Error('No GitHub repo linked to this project');
  }

  const pr = await generateAndCreatePR({
    userId: params.userId,
    projectId: params.projectId,
    componentName: params.componentName,
    files: params.files,
    prompt: params.prompt,
    model: params.model,
  });

  const installation = repo.github_installations as unknown as {
    installation_id: number;
  };

  const prId = await insertPR({
    user_id: params.userId,
    project_id: params.projectId,
    generation_id: params.generationId,
    repo_id: repo.id,
    installation_id: installation.installation_id,
    pr_number: pr.number,
    pr_url: pr.url,
    pr_html_url: pr.htmlUrl,
    branch_name: 'siza/generate-' + params.componentName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    file_paths: params.files.map((f) => f.path),
    component_name: params.componentName,
  });

  if (params.generationId && prId) {
    await linkPRToGeneration(params.generationId, prId);
  }

  return pr;
}

export async function getProjectPRs(userId: string, projectId: string): Promise<GitHubPRRecord[]> {
  return findPRsByProject(userId, projectId);
}
