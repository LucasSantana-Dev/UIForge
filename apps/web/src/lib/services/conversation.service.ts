import { createClient } from '@/lib/supabase/server';
import { NotFoundError, ValidationError } from '@/lib/api/errors';

export const MAX_CONVERSATION_DEPTH = 10;

export async function getConversationDepth(
  parentId: string
): Promise<number> {
  const supabase = await createClient();
  let depth = 0;
  let currentId: string | null = parentId;

  while (currentId && depth < MAX_CONVERSATION_DEPTH) {
    const { data }: { data: { parent_generation_id: string | null } | null } =
      await supabase
        .from('generations')
        .select('parent_generation_id')
        .eq('id', currentId)
        .single();

    if (!data?.parent_generation_id) break;
    currentId = data.parent_generation_id;
    depth++;
  }

  return depth;
}

export async function validateConversation(
  parentGenerationId: string
): Promise<void> {
  const supabase = await createClient();
  const { data: parentGen } = await supabase
    .from('generations')
    .select('id')
    .eq('id', parentGenerationId)
    .single();

  if (!parentGen) {
    throw new NotFoundError('Parent generation not found');
  }

  const depth = await getConversationDepth(parentGenerationId);
  if (depth >= MAX_CONVERSATION_DEPTH) {
    throw new ValidationError(
      'Conversation limit reached (max ' +
        MAX_CONVERSATION_DEPTH +
        ' turns). Start a new generation.'
    );
  }
}
