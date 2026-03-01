import { findGenerationById, getParentGenerationId } from '@/lib/repositories/generation.repo';
import { NotFoundError, ValidationError } from '@/lib/api/errors';

export const MAX_CONVERSATION_DEPTH = 10;

export async function getConversationDepth(parentId: string): Promise<number> {
  let depth = 0;
  let currentId: string | null = parentId;

  while (currentId && depth < MAX_CONVERSATION_DEPTH) {
    const parentGenId = await getParentGenerationId(currentId);
    if (!parentGenId) break;
    currentId = parentGenId;
    depth++;
  }

  return depth;
}

export async function validateConversation(parentGenerationId: string): Promise<void> {
  const parentGen = await findGenerationById(parentGenerationId);

  if (!parentGen) {
    throw new NotFoundError(
      'The previous generation could not be found. It may have been deleted — please start a new generation.'
    );
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
