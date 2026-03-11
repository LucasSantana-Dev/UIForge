import { categorizeGenerationError } from '@/lib/errors/generation-errors';

describe('categorizeGenerationError', () => {
  it('categorizes provider capacity errors separately from subscription quota', () => {
    const result = categorizeGenerationError('AI provider capacity reached. Retry later.');
    expect(result.category).toBe('provider-capacity');
  });

  it('categorizes rate limit errors', () => {
    const result = categorizeGenerationError('Rate limit exceeded. Try again shortly.');
    expect(result.category).toBe('rate-limit');
    expect(result.suggestion).toBeTruthy();
  });

  it('categorizes quota errors', () => {
    const result = categorizeGenerationError('Generation quota exceeded');
    expect(result.category).toBe('quota');
  });

  it('categorizes limit reached errors', () => {
    const result = categorizeGenerationError('Monthly limit reached for this plan');
    expect(result.category).toBe('quota');
  });

  it('categorizes authentication errors', () => {
    const result = categorizeGenerationError('Authentication required. Please sign in.');
    expect(result.category).toBe('auth');
  });

  it('categorizes unauthorized errors', () => {
    const result = categorizeGenerationError('Unauthorized access');
    expect(result.category).toBe('auth');
  });

  it('categorizes validation errors', () => {
    const result = categorizeGenerationError('Invalid request: description is required');
    expect(result.category).toBe('validation');
  });

  it('categorizes provider errors', () => {
    const result = categorizeGenerationError('API key is invalid or expired');
    expect(result.category).toBe('provider');
  });

  it('categorizes provider quota responses as capacity errors', () => {
    const result = categorizeGenerationError(
      'Google generation failed: You exceeded your current quota'
    );
    expect(result.category).toBe('provider-capacity');
  });

  it('categorizes service unavailable', () => {
    const result = categorizeGenerationError('Service unavailable (503)');
    expect(result.category).toBe('provider');
  });

  it('categorizes network errors', () => {
    const result = categorizeGenerationError('Network error: Failed to fetch');
    expect(result.category).toBe('network');
  });

  it('categorizes connection refused', () => {
    const result = categorizeGenerationError('ECONNREFUSED');
    expect(result.category).toBe('network');
  });

  it('categorizes timeout errors', () => {
    const result = categorizeGenerationError('Request timeout after 30s');
    expect(result.category).toBe('network');
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
