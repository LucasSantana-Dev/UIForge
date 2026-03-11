import * as generationService from '@/lib/services/generation.service';

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
    jest.clearAllMocks();
  });

  it('should return enriched context for react framework', () => {
    const result = generationService.buildSizaGenContext('react', 'shadcn');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return enriched context for vue framework', () => {
    const result = generationService.buildSizaGenContext('vue');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should return enriched context without component library', () => {
    const result = generationService.buildSizaGenContext('react');
    expect(result).toBeTruthy();
  });

  it('should return empty string when flag is disabled', () => {
    process.env.NEXT_PUBLIC_ENABLE_SIZA_GEN_CONTEXT = 'false';
    const result = generationService.buildSizaGenContext('react', 'shadcn');
    expect(result).toBe('');
    delete process.env.NEXT_PUBLIC_ENABLE_SIZA_GEN_CONTEXT;
  });
});

describe('runQualityGates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_ENABLE_POST_GEN_SCORING = 'true';
    const { runAllGates } = require('@/lib/quality/gates');
    runAllGates.mockReturnValue({
      passed: true,
      results: [],
      score: 1,
      timestamp: new Date().toISOString(),
    });
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_ENABLE_POST_GEN_SCORING;
  });

  it('loads post-gen scorer through side-effect-safe core subpath', () => {
    const scorer = generationService.loadPostGenScorer();
    expect(scorer === null || typeof scorer === 'function').toBe(true);
  });

  it('applies post-generation scoring when scorer is available', () => {
    const report = generationService.runQualityGates(
      'export default function C(){ return <button>ok</button>; }',
      'react'
    );

    expect(report.postGenScore).toBeDefined();
  });

  it('keeps report valid when post-gen scoring is disabled', () => {
    process.env.NEXT_PUBLIC_ENABLE_POST_GEN_SCORING = 'false';

    const report = generationService.runQualityGates(
      'export default function C() { return null; }'
    );

    expect(report.passed).toBe(true);
    expect(report.postGenScore).toBeUndefined();
  });
});
