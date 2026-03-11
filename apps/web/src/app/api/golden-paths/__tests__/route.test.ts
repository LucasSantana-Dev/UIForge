import { GET } from '../route';
import { checkRateLimit, setRateLimitHeaders } from '@/lib/api/rate-limit';
import { listGoldenPathTemplates } from '@/lib/services/golden-path.service';

jest.mock('@/lib/api/rate-limit');
jest.mock('@/lib/services/golden-path.service');
jest.mock('@/lib/sentry/server', () => ({
  captureServerError: jest.fn(),
}));

const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;
const mockSetRateLimitHeaders = setRateLimitHeaders as jest.MockedFunction<
  typeof setRateLimitHeaders
>;
const mockListGoldenPathTemplates = listGoldenPathTemplates as jest.MockedFunction<
  typeof listGoldenPathTemplates
>;

describe('GET /api/golden-paths', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 119,
      resetAt: Date.now() + 60_000,
    });
  });

  it('returns data and pagination contract expected by frontend hooks', async () => {
    mockListGoldenPathTemplates.mockResolvedValue({
      data: [{ id: 'template-1', name: 'forge-next-service' } as any],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
    });

    const request = new Request(
      'http://localhost/api/golden-paths?stack=nextjs&language=typescript&page=1&limit=20'
    ) as any;
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.data).toHaveLength(1);
    expect(body.data.pagination.total).toBe(1);
    expect(mockListGoldenPathTemplates).toHaveBeenCalledWith(
      expect.objectContaining({
        stack: 'nextjs',
        language: 'typescript',
      })
    );
    expect(mockSetRateLimitHeaders).toHaveBeenCalled();
  });

  it('returns 429 when rate limit is exceeded', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60_000,
    });

    const request = new Request('http://localhost/api/golden-paths') as any;
    const response = await GET(request);

    expect(response.status).toBe(429);
    expect(mockListGoldenPathTemplates).not.toHaveBeenCalled();
    expect(mockSetRateLimitHeaders).toHaveBeenCalled();
  });
});
