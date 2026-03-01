import { getClient, handleRepoError } from './base.repo';

export interface GitHubPRInsert {
  user_id: string;
  project_id?: string;
  generation_id?: string;
  repo_id: string;
  installation_id: number;
  pr_number: number;
  pr_url: string;
  pr_html_url: string;
  branch_name: string;
  commit_sha?: string;
  file_paths?: string[];
  component_name?: string;
}

export interface GitHubPRRecord extends GitHubPRInsert {
  id: string;
  state: 'open' | 'closed' | 'merged';
  merged_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function insertPR(data: GitHubPRInsert): Promise<string | null> {
  const supabase = await getClient();
  const { data: pr, error } = await supabase
    .from('github_prs')
    .insert(data as any)
    .select('id')
    .single();
  if (error) handleRepoError(error);
  return pr?.id ?? null;
}

export async function updatePRState(
  repoId: string,
  prNumber: number,
  state: 'open' | 'closed' | 'merged',
  extra?: { merged_at?: string; closed_at?: string }
): Promise<void> {
  const supabase = await getClient();
  const update: Record<string, unknown> = {
    state,
    updated_at: new Date().toISOString(),
  };
  if (extra?.merged_at) update.merged_at = extra.merged_at;
  if (extra?.closed_at) update.closed_at = extra.closed_at;
  const { error } = await supabase
    .from('github_prs')
    .update(update)
    .eq('repo_id', repoId)
    .eq('pr_number', prNumber);
  if (error) handleRepoError(error);
}

export async function findPRsByProject(
  userId: string,
  projectId: string
): Promise<GitHubPRRecord[]> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('github_prs')
    .select('*')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) handleRepoError(error);
  return (data as any as GitHubPRRecord[]) ?? [];
}

export async function findPRByGeneration(generationId: string): Promise<GitHubPRRecord | null> {
  const supabase = await getClient();
  const { data } = await supabase
    .from('github_prs')
    .select('*')
    .eq('generation_id', generationId)
    .single();
  return (data as any as GitHubPRRecord) ?? null;
}

export async function linkPRToGeneration(generationId: string, prId: string): Promise<void> {
  const supabase = await getClient();
  await supabase
    .from('generations')
    .update({ github_pr_id: prId } as any)
    .eq('id', generationId);
}
