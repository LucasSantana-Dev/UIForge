import { NextRequest } from 'next/server';

jest.mock('@/lib/api', () => ({
  verifySession: jest.fn().mockResolvedValue({ user: { id: 'user-1' } }),
  errorResponse: jest.fn().mockImplementation((msg, status) => {
    return new Response(JSON.stringify({ error: msg }), { status });
  }),
  apiErrorResponse: jest.fn().mockImplementation((err) => {
    return new Response(JSON.stringify({ error: err.message }), { status: err.statusCode });
  }),
  jsonResponse: jest.fn().mockImplementation((data) => {
    return new Response(JSON.stringify(data), { status: 200 });
  }),
}));

jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: jest.fn().mockResolvedValue({ allowed: true, remaining: 59, resetAt: 0 }),
  setRateLimitHeaders: jest.fn().mockImplementation((res) => res),
}));

jest.mock('@/lib/services/catalog.service', () => ({
  getCatalogGraph: jest.fn().mockResolvedValue({
    nodes: [{ id: 'n1', name: 'siza', type: 'service' }],
    edges: [],
  }),
}));

import { GET } from '../route';

const { verifySession } = require('@/lib/api');
const { checkRateLimit } = require('@/lib/api/rate-limit');

function createRequest() {
  return new NextRequest('http://localhost/api/catalog/graph');
}

describe('GET /api/catalog/graph', () => {
  it('returns graph data for authenticated users', async () => {
    const res = await GET(createRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.nodes).toHaveLength(1);
    expect(data.edges).toHaveLength(0);
  });

  it('requires authentication', async () => {
    verifySession.mockRejectedValueOnce(
      Object.assign(new Error('Unauthorized'), { statusCode: 401 })
    );
    const res = await GET(createRequest());
    expect(res.status).toBe(401);
  });

  it('enforces rate limiting', async () => {
    checkRateLimit.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 30000,
    });
    const res = await GET(createRequest());
    expect(res.status).toBe(429);
  });
});
