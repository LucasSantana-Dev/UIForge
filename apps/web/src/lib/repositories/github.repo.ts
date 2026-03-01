import { getClient, handleRepoError } from './base.repo';

export interface GitHubPRInsert {
  user_id: string;
  project_id?: string;
  generation_id?: string;
  repo_id: string;
  installation_id: string;
  pr_number: number;
  pr_url: string;
  pr_html_url: string;
  branch_name: string;
  commit_sha?: string;
  file_paths?: string[];
  component_name?: string;
}

export interface GitHubPRRow {
  id: string;
  user_id: string;
  project_id: string | null;
  generation_id: string | null;
  repo_id: string;
  pr_number: number;
  pr_url: string;
  pr_html_url: string;
  branch_name: string;
  state: 'open' | 'closed' | 'merged';
  merged_at: string | null;
  closed_at: string | null;
  commit_sha: string | null;
  file_paths: string[] | null;
  component_name: string | null;
  created_at: string;
}

export async function insertPR(data: GitHubPRInsert): Promise<string | null> {
  try {
    const supabase = await getClient();
    const { data: pr } = await supabase
      .from('github_prs')
      .insert(data as any)
      .select('id')
      .single();
    return pr?.id ?? null;
  } catch (error) {
    handleRepoError(error, 'github.insertPR');
  }
}

export async function updatePRState(
  repoId: string,
  prNumber: number,
  state: 'open' | 'closed' | 'merged',
  extra?: { merged_at?: string; closed_at?: string }
): Promise<void> {
  try {
    const supabase = await getClient();
    await supabase
      .from('github_prs')
      .update({
        state,
        ...extra,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('repo_id', repoId)
      .eq('pr_number', prNumber);
  } catch (error) {
    handleRepoError(error, 'github.updatePRState');
  }
}

export async function findPRsByProject(userId: string, projectId: string): Promise<GitHubPRRow[]> {
  try {
    const supabase = await getClient();
    const { data } = await supabase
      .from('github_prs')
      .select('*')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    return (data as any as GitHubPRRow[]) ?? [];
  } catch (error) {
    handleRepoError(error, 'github.findPRsByProject');
  }
}

export async function findPRByGeneration(generationId: string): Promise<GitHubPRRow | null> {
  try {
    const supabase = await getClient();
    const { data } = await supabase
      .from('github_prs')
      .select('*')
      .eq('generation_id', generationId)
      .single();
    return (data as any as GitHubPRRow) ?? null;
  } catch {
    return null;
  }
}

export async function linkPRToGeneration(generationId: string, prId: string): Promise<void> {
  try {
    const supabase = await getClient();
    await supabase
      .from('generations')
      .update({ github_pr_id: prId } as any)
      .eq('id', generationId);
  } catch (error) {
    handleRepoError(error, 'github.linkPRToGeneration');
  }
}
