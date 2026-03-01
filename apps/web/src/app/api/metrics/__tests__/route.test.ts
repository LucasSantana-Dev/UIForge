import { GET } from '../route';

const mockFrom = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: mockFrom })),
}));

function makeThenable(result: unknown) {
  const obj: Record<string, unknown> = {
    ...Object(result),
    then: (resolve: (v: unknown) => void) => {
      resolve(result);
      return Promise.resolve(result);
    },
    gte: jest.fn(() => obj),
    eq: jest.fn(() => obj),
  };
  return obj;
}

function setupMocks(counts: {
  profiles: number;
  profiles7d: number;
  profiles30d: number;
  generations: number;
  gen24h: number;
  gen7d: number;
  completed: number;
  projects: number;
  activeRows: Array<{ user_id: string }>;
}) {
  const responses = [
    { count: counts.profiles, error: null, data: null },
    { count: counts.profiles7d, error: null, data: null },
    { count: counts.profiles30d, error: null, data: null },
    { count: counts.generations, error: null, data: null },
    { count: counts.gen24h, error: null, data: null },
    { count: counts.gen7d, error: null, data: null },
    { count: counts.completed, error: null, data: null },
    { count: counts.projects, error: null, data: null },
    { data: counts.activeRows, error: null, count: null },
  ];

  let callIndex = 0;
  mockFrom.mockImplementation(() => ({
    select: jest.fn(() => makeThenable(responses[callIndex++])),
  }));
}

function setupErrorMock(errorIndex: number) {
  let callIndex = 0;
  mockFrom.mockImplementation(() => ({
    select: jest.fn(() => {
      const idx = callIndex++;
      if (idx === errorIndex) {
        return makeThenable({
          count: null,
          error: { message: 'Connection refused' },
          data: null,
        });
      }
      return makeThenable({
        count: 0,
        error: null,
        data: idx === 8 ? [] : null,
      });
    }),
  }));
}

const VALID_KEY = 'test-metrics-key';

function makeRequest(headers: Record<string, string> = {}) {
  return new Request('http://localhost:3000/api/metrics', {
    headers,
  });
}

describe('GET /api/metrics', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-key',
      METRICS_API_KEY: VALID_KEY,
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns 503 when METRICS_API_KEY is not set', async () => {
    delete process.env.METRICS_API_KEY;
    const res = await GET(makeRequest());
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toBe('Metrics endpoint not configured');
  });

  it('returns 401 with no authorization header', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 401 with wrong API key', async () => {
    const res = await GET(makeRequest({ authorization: 'Bearer wrong-key' }));
    expect(res.status).toBe(401);
  });

  it('returns 401 with malformed auth header', async () => {
    const res = await GET(makeRequest({ authorization: VALID_KEY }));
    expect(res.status).toBe(401);
  });

  it('returns metrics with correct shape on success', async () => {
    setupMocks({
      profiles: 42,
      profiles7d: 5,
      profiles30d: 15,
      generations: 200,
      gen24h: 10,
      gen7d: 50,
      completed: 180,
      projects: 30,
      activeRows: [
        { user_id: 'u1' },
        { user_id: 'u1' },
        { user_id: 'u1' },
        { user_id: 'u2' },
        { user_id: 'u2' },
        { user_id: 'u2' },
        { user_id: 'u3' },
      ],
    });

    const res = await GET(makeRequest({ authorization: `Bearer ${VALID_KEY}` }));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toMatchObject({
      users: { total: 42, last7d: 5, last30d: 15, active: 2 },
      generations: {
        total: 200,
        last24h: 10,
        last7d: 50,
        successRate: 90,
      },
      projects: { total: 30 },
    });
    expect(body.timestamp).toBeDefined();
  });

  it('returns 0 active users when nobody has 3+ gens', async () => {
    setupMocks({
      profiles: 5,
      profiles7d: 1,
      profiles30d: 3,
      generations: 4,
      gen24h: 1,
      gen7d: 2,
      completed: 4,
      projects: 2,
      activeRows: [{ user_id: 'u1' }, { user_id: 'u2' }, { user_id: 'u3' }, { user_id: 'u4' }],
    });

    const res = await GET(makeRequest({ authorization: `Bearer ${VALID_KEY}` }));
    const body = await res.json();
    expect(body.users.active).toBe(0);
  });

  it('returns successRate 0 when no generations exist', async () => {
    setupMocks({
      profiles: 1,
      profiles7d: 1,
      profiles30d: 1,
      generations: 0,
      gen24h: 0,
      gen7d: 0,
      completed: 0,
      projects: 0,
      activeRows: [],
    });

    const res = await GET(makeRequest({ authorization: `Bearer ${VALID_KEY}` }));
    const body = await res.json();
    expect(body.generations.successRate).toBe(0);
  });

  it('returns 500 when a database query fails', async () => {
    setupErrorMock(0);

    const res = await GET(makeRequest({ authorization: `Bearer ${VALID_KEY}` }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Database query failed');
  });
});
