import { GET, POST } from '@/app/api/catalog/route';
import { NextRequest } from 'next/server';
import * as api from '@/lib/api';
import * as rateLimit from '@/lib/api/rate-limit';
import * as catalogService from '@/lib/services/catalog.service';
import * as catalogRepo from '@/lib/repositories/catalog.repo';
import * as validation from '@/lib/api/validation/catalog';

jest.mock('@/lib/api');
jest.mock('@/lib/api/rate-limit');
jest.mock('@/lib/services/catalog.service');
jest.mock('@/lib/repositories/catalog.repo');
jest.mock('@/lib/api/validation/catalog');

const mockVerifySession = api.verifySession as jest.MockedFunction<typeof api.verifySession>;
const mockSuccessResponse = api.successResponse as jest.MockedFunction<typeof api.successResponse>;
const mockCreatedResponse = api.createdResponse as jest.MockedFunction<typeof api.createdResponse>;
const mockErrorResponse = api.errorResponse as jest.MockedFunction<typeof api.errorResponse>;
const mockCheckRateLimit = rateLimit.checkRateLimit as jest.MockedFunction<
  typeof rateLimit.checkRateLimit
>;
const mockSetRateLimitHeaders = rateLimit.setRateLimitHeaders as jest.MockedFunction<
  typeof rateLimit.setRateLimitHeaders
>;
const mockListCatalogEntries = catalogService.listCatalogEntries as jest.MockedFunction<
  typeof catalogService.listCatalogEntries
>;
const mockInsertCatalogEntry = catalogRepo.insertCatalogEntry as jest.MockedFunction<
  typeof catalogRepo.insertCatalogEntry
>;
const mockCatalogQuerySchema = validation.catalogQuerySchema as any;
const mockCreateCatalogEntrySchema = validation.createCatalogEntrySchema as any;

beforeEach(() => {
  jest.clearAllMocks();
  mockSetRateLimitHeaders.mockImplementation((response) => response as any);
  mockCheckRateLimit.mockResolvedValue({
    allowed: true,
    remaining: 119,
    resetAt: Date.now() + 60000,
  });
  mockVerifySession.mockResolvedValue({
    user: { id: 'user-1', email: 'test@example.com' },
  } as any);
});

describe('GET /api/catalog', () => {
  const mockPaginatedResult = {
    data: [
      {
        id: 'entry-1',
        name: 'my-service',
        display_name: 'My Service',
        type: 'service',
        lifecycle: 'production',
        owner_id: 'user-1',
        team: null,
        tags: [],
        dependencies: [],
        repository_url: null,
        documentation_url: null,
        project_id: null,
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
      },
    ],
    pagination: { page: 1, limit: 10, total: 1, pages: 1 },
  };

  it('returns catalog entries', async () => {
    mockCatalogQuerySchema.parse = jest.fn().mockReturnValue({});
    mockListCatalogEntries.mockResolvedValueOnce(mockPaginatedResult);
    mockSuccessResponse.mockReturnValueOnce(new Response() as any);

    const request = new NextRequest('http://localhost/api/catalog');
    await GET(request);

    expect(mockListCatalogEntries).toHaveBeenCalledWith({});
    expect(mockSuccessResponse).toHaveBeenCalledWith({
      entries: mockPaginatedResult.data,
      pagination: mockPaginatedResult.pagination,
    });
  });

  it('applies type filter', async () => {
    mockCatalogQuerySchema.parse = jest.fn().mockReturnValue({ type: 'service' });
    mockListCatalogEntries.mockResolvedValueOnce(mockPaginatedResult);
    mockSuccessResponse.mockReturnValueOnce(new Response() as any);

    const request = new NextRequest('http://localhost/api/catalog?type=service');
    await GET(request);

    expect(mockListCatalogEntries).toHaveBeenCalledWith({
      type: 'service',
    });
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 30000,
    });
    mockErrorResponse.mockReturnValueOnce(new Response() as any);

    const request = new NextRequest('http://localhost/api/catalog');
    await GET(request);

    expect(mockErrorResponse).toHaveBeenCalledWith('Rate limit exceeded', 429, expect.any(Object));
  });

  it('returns empty list', async () => {
    const emptyResult = {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 1 },
    };
    mockCatalogQuerySchema.parse = jest.fn().mockReturnValue({});
    mockListCatalogEntries.mockResolvedValueOnce(emptyResult);
    mockSuccessResponse.mockReturnValueOnce(new Response() as any);

    const request = new NextRequest('http://localhost/api/catalog');
    await GET(request);

    expect(mockSuccessResponse).toHaveBeenCalledWith({
      entries: [],
      pagination: emptyResult.pagination,
    });
  });
});

describe('POST /api/catalog', () => {
  const validEntry = {
    name: 'my-service',
    display_name: 'My Service',
    type: 'service',
    lifecycle: 'production',
  };

  const mockCreatedEntry = {
    id: 'entry-1',
    ...validEntry,
    owner_id: 'user-1',
    team: null,
    tags: [],
    dependencies: [],
    repository_url: null,
    documentation_url: null,
    project_id: null,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  };

  it('creates entry with valid data', async () => {
    mockCreateCatalogEntrySchema.safeParse = jest.fn().mockReturnValue({
      success: true,
      data: validEntry,
    });
    mockInsertCatalogEntry.mockResolvedValueOnce(mockCreatedEntry as any);
    mockCreatedResponse.mockReturnValueOnce(new Response() as any);

    const request = new NextRequest('http://localhost/api/catalog', {
      method: 'POST',
      body: JSON.stringify(validEntry),
    });
    await POST(request);

    expect(mockInsertCatalogEntry).toHaveBeenCalledWith({
      ...validEntry,
      owner_id: 'user-1',
    });
    expect(mockCreatedResponse).toHaveBeenCalledWith(
      mockCreatedEntry,
      'Catalog entry created successfully'
    );
  });

  it('returns 400 for invalid body', async () => {
    mockCreateCatalogEntrySchema.safeParse = jest.fn().mockReturnValue({
      success: false,
      error: { issues: [{ message: 'Invalid name' }] },
    });
    mockErrorResponse.mockReturnValueOnce(new Response() as any);

    const request = new NextRequest('http://localhost/api/catalog', {
      method: 'POST',
      body: JSON.stringify({ name: 'INVALID' }),
    });
    await POST(request);

    expect(mockErrorResponse).toHaveBeenCalledWith('Invalid request body', 400, expect.any(Object));
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 30000,
    });
    mockErrorResponse.mockReturnValueOnce(new Response() as any);

    const request = new NextRequest('http://localhost/api/catalog', {
      method: 'POST',
      body: JSON.stringify(validEntry),
    });
    await POST(request);

    expect(mockErrorResponse).toHaveBeenCalledWith('Rate limit exceeded', 429, expect.any(Object));
  });
});
