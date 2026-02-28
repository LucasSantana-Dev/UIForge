import { getClient, handleRepoError } from './base.repo';

export interface ComponentWithProject {
  id: string;
  project_id: string;
  name: string;
  component_type: string;
  framework: string;
  code_storage_path: string | null;
  description: string | null;
  projects: {
    user_id: string;
    is_public: boolean;
    framework: string;
  };
}

export async function findComponentWithProject(
  componentId: string
): Promise<ComponentWithProject | null> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('components')
    .select('*, projects!inner(user_id, is_public, framework)')
    .eq('id', componentId)
    .single();
  if (error || !data) return null;
  return data as unknown as ComponentWithProject;
}

export async function findComponentsByProject(projectId: string): Promise<any[]> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) {
    handleRepoError(error, 'findComponentsByProject');
  }
  return data || [];
}

export async function insertComponent(data: Record<string, unknown>): Promise<any> {
  const supabase = await getClient();
  const { data: component, error } = await supabase
    .from('components')
    .insert(data as any)
    .select()
    .single();
  if (error) {
    handleRepoError(error, 'insertComponent');
  }
  return component;
}

export async function updateComponent(id: string, data: Record<string, unknown>): Promise<any> {
  const supabase = await getClient();
  const { data: updated, error } = await supabase
    .from('components')
    .update(data as any)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    handleRepoError(error, 'updateComponent');
  }
  return updated;
}

export async function deleteComponent(id: string): Promise<void> {
  const supabase = await getClient();
  const { error } = await supabase.from('components').delete().eq('id', id);
  if (error) {
    handleRepoError(error, 'deleteComponent');
  }
}
