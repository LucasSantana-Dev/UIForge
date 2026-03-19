import { GET } from '@/app/api/health/route';

describe('GET /api/health', () => {
  it('returns status ok with timestamp and version', async () => {
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(body.version).toBeDefined();
  });
});
