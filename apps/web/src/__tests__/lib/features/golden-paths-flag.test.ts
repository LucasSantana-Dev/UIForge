import { GOLDEN_PATHS_FLAG } from '@/lib/features/golden-paths-flag';

describe('GOLDEN_PATHS_FLAG', () => {
  it('should export the correct flag name', () => {
    expect(GOLDEN_PATHS_FLAG).toBe('ENABLE_GOLDEN_PATHS');
  });

  it('should be a string constant', () => {
    expect(typeof GOLDEN_PATHS_FLAG).toBe('string');
  });
});
