import { createClient } from '@supabase/supabase-js';
import { getMetricsReport, parseWindowDays } from '../metrics.service';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockFrom = jest.fn();

function makeThenable(result: unknown) {
  const query = Promise.resolve(result) as Promise<unknown> & {
    gte: jest.Mock<Promise<unknown>, []>;
    eq: jest.Mock<Promise<unknown>, []>;
  };
  query.gte = jest.fn(() => Promise.resolve(result));
  query.eq = jest.fn(() => Promise.resolve(result));
  return query;
}

function setupResponses(responses: Array<Record<string, unknown>>) {
  let callIndex = 0;
  mockFrom.mockImplementation(() => ({
    select: jest.fn(() => makeThenable(responses[callIndex++])),
  }));
}

describe('metrics service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
    };
    mockCreateClient.mockReturnValue({ from: mockFrom } as any);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('parses supported window days and falls back to 30', () => {
    expect(parseWindowDays('7')).toBe(7);
    expect(parseWindowDays('30')).toBe(30);
    expect(parseWindowDays('90')).toBe(90);
    expect(parseWindowDays('14')).toBe(30);
    expect(parseWindowDays(undefined)).toBe(30);
  });

  it('computes revision, satisfaction, and mcp coverage', async () => {
    setupResponses([
      { count: 42, error: null, data: null },
      { count: 5, error: null, data: null },
      { count: 15, error: null, data: null },
      { count: 200, error: null, data: null },
      { count: 10, error: null, data: null },
      { count: 50, error: null, data: null },
      { count: 180, error: null, data: null },
      { count: 30, error: null, data: null },
      {
        data: [
          { user_id: 'u1' },
          { user_id: 'u1' },
          { user_id: 'u1' },
          { user_id: 'u2' },
          { user_id: 'u2' },
          { user_id: 'u2' },
        ],
        error: null,
        count: null,
      },
      {
        data: [
          { parent_generation_id: 'g1', ai_provider: 'mcp-gateway' },
          { parent_generation_id: null, ai_provider: 'mcp-gateway' },
          { parent_generation_id: null, ai_provider: 'google' },
          { parent_generation_id: 'g2', ai_provider: 'openai' },
        ],
        error: null,
        count: null,
      },
      {
        data: [{ rating: 'positive' }, { rating: 'negative' }, { rating: 'positive' }],
        error: null,
        count: null,
      },
    ]);

    const report = await getMetricsReport(7);

    expect(report.users.active).toBe(2);
    expect(report.generations.successRate).toBe(90);
    expect(report.quality.windowDays).toBe(7);
    expect(report.quality.totalGenerations).toBe(4);
    expect(report.quality.revisionRate).toBe(50);
    expect(report.quality.satisfactionRate).toBe(66.67);
    expect(report.quality.satisfactionVotes).toBe(3);
    expect(report.quality.mcpCoverage).toBe(50);
  });

  it('returns zero/null quality metrics when no window data exists', async () => {
    setupResponses([
      { count: 0, error: null, data: null },
      { count: 0, error: null, data: null },
      { count: 0, error: null, data: null },
      { count: 0, error: null, data: null },
      { count: 0, error: null, data: null },
      { count: 0, error: null, data: null },
      { count: 0, error: null, data: null },
      { count: 0, error: null, data: null },
      { data: [], error: null, count: null },
      { data: [], error: null, count: null },
      { data: [], error: null, count: null },
    ]);

    const report = await getMetricsReport(90);

    expect(report.quality.totalGenerations).toBe(0);
    expect(report.quality.revisionRate).toBe(0);
    expect(report.quality.satisfactionRate).toBeNull();
    expect(report.quality.satisfactionVotes).toBe(0);
    expect(report.quality.mcpCoverage).toBe(0);
  });

  it('throws when a database query fails', async () => {
    setupResponses([
      { count: null, error: { message: 'db fail' }, data: null },
      { count: 0, error: null, data: null },
      { count: 0, error: null, data: null },
      { count: 0, error: null, data: null },
      { count: 0, error: null, data: null },
      { count: 0, error: null, data: null },
      { count: 0, error: null, data: null },
      { count: 0, error: null, data: null },
      { data: [], error: null, count: null },
      { data: [], error: null, count: null },
      { data: [], error: null, count: null },
    ]);

    await expect(getMetricsReport(30)).rejects.toThrow('Database query failed');
  });
});
