import { generateAndCreatePR, getLinkedRepo } from '@/lib/github/pipeline';
import { insertPR, linkPRToGeneration, findPRsByProject } from '@/lib/repositories/github.repo';
import type { GitHubPRRow } from '@/lib/repositories/github.repo';

export interface CreatePRFromGenerationParams {
  userId: string;
  projectId: string;
  generationId?: string;
  componentName: string;
  code: string;
  prompt: string;
  model: string;
}

export async function createPRFromGeneration(params: CreatePRFromGenerationParams) {
  const linked = await getLinkedRepo(params.userId, params.projectId);
  if (!linked) {
    throw new Error('No GitHub repo linked to this project');
  }

  const inst = linked.github_installations as any;
  if (inst?.suspended_at) {
    throw new Error('GitHub App installation is suspended');
  }

  const slug = params.componentName
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  const ext = params.code.includes('tsx') || params.code.includes('React') ? 'tsx' : 'ts';
  const filePath = 'src/components/' + slug + '.' + ext;

  const pr = await generateAndCreatePR({
    userId: params.userId,
    projectId: params.projectId,
    componentName: params.componentName,
    files: [{ path: filePath, content: params.code }],
    prompt: params.prompt,
    model: params.model,
  });

  const prId = await insertPR({
    user_id: params.userId,
    project_id: params.projectId,
    generation_id: params.generationId,
    repo_id: linked.id,
    installation_id: inst.id,
    pr_number: pr.number,
    pr_url: pr.url,
    pr_html_url: pr.htmlUrl,
    branch_name: 'siza/generate-' + slug,
    file_paths: [filePath],
    component_name: params.componentName,
  });

  if (prId && params.generationId) {
    await linkPRToGeneration(params.generationId, prId);
  }

  return { ...pr, prId };
}

export async function getProjectPRs(userId: string, projectId: string): Promise<GitHubPRRow[]> {
  return findPRsByProject(userId, projectId);
}
