// Tests for quality/index.ts — verifies the barrel re-exports are correct
import { runAllGates, runSecurityScan, runLintCheck, runTypeCheck } from '@/lib/quality/index';
import type { QualityResult, QualityReport } from '@/lib/quality/index';

describe('quality/index re-exports', () => {
  it('exports runAllGates as a function', () => {
    expect(typeof runAllGates).toBe('function');
  });

  it('exports runSecurityScan as a function', () => {
    expect(typeof runSecurityScan).toBe('function');
  });

  it('exports runLintCheck as a function', () => {
    expect(typeof runLintCheck).toBe('function');
  });

  it('exports runTypeCheck as a function', () => {
    expect(typeof runTypeCheck).toBe('function');
  });

  it('runSecurityScan returns a QualityResult for valid React code', async () => {
    const result: QualityResult = await runSecurityScan('const x = 1;');
    expect(result).toMatchObject({
      gate: expect.any(String),
      passed: expect.any(Boolean),
      issues: expect.any(Array),
      severity: expect.stringMatching(/info|warning|error/),
    });
  });

  it('runLintCheck returns a QualityResult', async () => {
    const result: QualityResult = await runLintCheck('const x: number = 1;');
    expect(result).toMatchObject({
      gate: expect.any(String),
      passed: expect.any(Boolean),
      issues: expect.any(Array),
      severity: expect.stringMatching(/info|warning|error/),
    });
  });

  it('runTypeCheck returns a QualityResult', async () => {
    const result: QualityResult = await runTypeCheck('const x: number = 1;');
    expect(result).toMatchObject({
      gate: expect.any(String),
      passed: expect.any(Boolean),
      issues: expect.any(Array),
      severity: expect.stringMatching(/info|warning|error/),
    });
  });

  it('runAllGates returns a QualityReport', async () => {
    const report: QualityReport = await runAllGates('const x: number = 1;');
    expect(report).toMatchObject({
      passed: expect.any(Boolean),
      results: expect.any(Array),
      score: expect.any(Number),
      timestamp: expect.any(String),
    });
    expect(report.score).toBeGreaterThanOrEqual(0);
    expect(report.score).toBeLessThanOrEqual(100);
  });
});
