import {
  getConversationDepth,
  validateConversation,
  MAX_CONVERSATION_DEPTH,
} from '@/lib/services/conversation.service';
import { findGenerationById, getParentGenerationId } from '@/lib/repositories/generation.repo';
import { NotFoundError, ValidationError } from '@/lib/api/errors';

jest.mock('@/lib/repositories/generation.repo');

const mockFindGeneration = findGenerationById as jest.MockedFunction<typeof findGenerationById>;
const mockGetParent = getParentGenerationId as jest.MockedFunction<typeof getParentGenerationId>;

beforeEach(() => jest.clearAllMocks());

describe('getConversationDepth', () => {
  it('returns 0 for root generation (no parent)', async () => {
    mockGetParent.mockResolvedValueOnce(null);
    const depth = await getConversationDepth('gen-1');
    expect(depth).toBe(0);
  });

  it('returns correct depth for a chain', async () => {
    mockGetParent
      .mockResolvedValueOnce('gen-parent')
      .mockResolvedValueOnce('gen-grandparent')
      .mockResolvedValueOnce(null);
    const depth = await getConversationDepth('gen-child');
    expect(depth).toBe(2);
  });

  it('caps at MAX_CONVERSATION_DEPTH', async () => {
    for (let i = 0; i < MAX_CONVERSATION_DEPTH + 5; i++) {
      mockGetParent.mockResolvedValueOnce('gen-' + i);
    }
    const depth = await getConversationDepth('gen-start');
    expect(depth).toBe(MAX_CONVERSATION_DEPTH);
  });
});

describe('validateConversation', () => {
  it('succeeds for valid parent within depth limit', async () => {
    mockFindGeneration.mockResolvedValueOnce({
      id: 'gen-1',
      parent_generation_id: null,
    });
    mockGetParent.mockResolvedValueOnce(null);
    await expect(validateConversation('gen-1')).resolves.toBeUndefined();
  });

  it('throws NotFoundError when parent does not exist', async () => {
    mockFindGeneration.mockResolvedValueOnce(null);
    await expect(validateConversation('missing')).rejects.toThrow(NotFoundError);
  });

  it('throws ValidationError when depth limit exceeded', async () => {
    mockFindGeneration.mockResolvedValueOnce({
      id: 'gen-deep',
      parent_generation_id: 'parent',
    });
    for (let i = 0; i < MAX_CONVERSATION_DEPTH + 2; i++) {
      mockGetParent.mockResolvedValueOnce('gen-' + i);
    }
    await expect(validateConversation('gen-deep')).rejects.toThrow(ValidationError);
  });
});
