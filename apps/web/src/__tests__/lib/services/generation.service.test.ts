import { buildSizaGenContext } from '@/lib/services/generation.service';

jest.mock('@/lib/repositories/generation.repo', () => ({
  createGeneration: jest.fn(),
  updateGeneration: jest.fn(),
}));

jest.mock('@/lib/services/context-enrichment', () => ({
  enrichPromptWithContext: jest.fn(),
}));

jest.mock('@/lib/services/embeddings', () => ({
  storeGenerationEmbedding: jest.fn(),
}));

jest.mock('@/lib/quality/gates', () => ({
  runAllGates: jest.fn(),
}));

jest.mock('@/lib/usage/tracker', () => ({
  incrementGenerationCount: jest.fn(),
}));

describe('buildSizaGenContext', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should return enriched context for react framework', () => {
    const result = buildSizaGenContext('react', 'shadcn');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return enriched context for vue framework', () => {
    const result = buildSizaGenContext('vue');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return enriched context without component library', () => {
    const result = buildSizaGenContext('react');
    expect(result).toBeTruthy();
  });

  it('should return empty string when flag is disabled', () => {
    process.env.NEXT_PUBLIC_ENABLE_SIZA_GEN_CONTEXT = 'false';
    const result = buildSizaGenContext('react', 'shadcn');
    expect(result).toBe('');
    delete process.env.NEXT_PUBLIC_ENABLE_SIZA_GEN_CONTEXT;
  });
});
