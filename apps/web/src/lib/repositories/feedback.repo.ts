import { getClient, handleRepoError } from './base.repo';

export interface FeedbackInsert {
  generation_id?: string;
  user_id?: string;
  prompt: string;
  component_type?: string;
  variant?: string;
  mood?: string;
  industry?: string;
  style?: string;
  score: number;
  feedback_type: 'explicit' | 'implicit';
  rating?: 'positive' | 'negative' | 'neutral';
  confidence?: number;
  code_hash?: string;
  metadata?: Record<string, unknown>;
}

export async function insertFeedback(
  data: FeedbackInsert
): Promise<string> {
  const supabase = await getClient();
  const { data: row, error } = await supabase
    .from('ml_feedback')
    .insert(data as any)
    .select('id')
    .single();
  if (error || !row) {
    handleRepoError(
      error || new Error('Insert returned no data'),
      'insertFeedback'
    );
  }
  return (row as any).id;
}

export async function findFeedbackByGeneration(
  generationId: string
): Promise<any[]> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('ml_feedback')
    .select('*')
    .eq('generation_id', generationId)
    .order('created_at', { ascending: false });
  if (error) {
    handleRepoError(error, 'findFeedbackByGeneration');
  }
  return data || [];
}

export async function findFeedbackByUser(
  userId: string,
  limit = 50
): Promise<any[]> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('ml_feedback')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    handleRepoError(error, 'findFeedbackByUser');
  }
  return data || [];
}
