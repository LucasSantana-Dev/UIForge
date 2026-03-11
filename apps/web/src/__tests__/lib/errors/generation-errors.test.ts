import { categorizeGenerationError } from '@/lib/errors/generation-errors';

describe('categorizeGenerationError', () => {
  const categoryCases: Array<{ message: string; category: string }> = [
    { message: 'AI provider capacity reached. Retry later.', category: 'provider-capacity' },
    {
      message: 'Google generation failed: You exceeded your current quota',
      category: 'provider-capacity',
    },
    { message: 'Rate limit exceeded. Try again shortly.', category: 'rate-limit' },
    { message: 'Generation quota exceeded', category: 'quota' },
    { message: 'Monthly limit reached for this plan', category: 'quota' },
    { message: 'Authentication required. Please sign in.', category: 'auth' },
    { message: 'Unauthorized access', category: 'auth' },
    { message: 'Invalid request: description is required', category: 'validation' },
    { message: 'API key is invalid or expired', category: 'provider' },
    { message: 'Service unavailable (503)', category: 'provider' },
    { message: 'Network error: Failed to fetch', category: 'network' },
    { message: 'ECONNREFUSED', category: 'network' },
    { message: 'Request timeout after 30s', category: 'network' },
  ];

  it.each(categoryCases)('categorizes "$message" as $category', ({ message, category }) => {
    const result = categorizeGenerationError(message);
    expect(result.category).toBe(category);
  });

  it('includes guidance for rate limit responses', () => {
    const result = categorizeGenerationError('Rate limit exceeded. Try again shortly.');
    expect(result.suggestion).toBeTruthy();
  });

  it('returns unknown for unrecognized errors', () => {
    const result = categorizeGenerationError('Something completely unexpected happened');
    expect(result.category).toBe('unknown');
    expect(result.message).toBe('Something completely unexpected happened');
    expect(result.suggestion).toBeTruthy();
  });

  it('always includes title, message, and suggestion', () => {
    const messages = [
      'Rate limit exceeded',
      'Quota exceeded',
      'Auth required',
      'Invalid request',
      'Random error xyz',
    ];

    for (const msg of messages) {
      const result = categorizeGenerationError(msg);
      expect(result.title).toBeTruthy();
      expect(result.message).toBeTruthy();
      expect(result.suggestion).toBeTruthy();
    }
  });
});
