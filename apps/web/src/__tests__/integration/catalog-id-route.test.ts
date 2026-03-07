import { GET, PATCH, DELETE } from '@/app/api/catalog/[id]/route';
import { NextRequest } from 'next/server';
import * as api from '@/lib/api';
import * as rateLimit from '@/lib/api/rate-limit';
import * as catalogService from '@/lib/services/catalog.service';
import * as catalogRepo from '@/lib/repositories/catalog.repo';
import * as validation from '@/lib/api/validation/catalog';
import { NotFoundError, ForbiddenError } from '@/lib/api/errors';

jest.mock('@/lib/api');
jest.mock('@/lib/api/rate-limit');
jest.mock('@/lib/services/catalog.service');
jest.mock('@/lib/repositories/catalog.repo');
jest.mock('@/lib/api/validation/catalog');

const mockVerifySession = api.verifySession as jest.MockedFunction<typeof api.verifySession>;
const mockSuccessResponse = api.successResponse as jest.MockedFunction<typeof api.successResponse>;
const mockNoContentResponse = api.noContentResponse as jest.MockedFunction<
  typeof api.noContentResponse
>;
const mockErrorResponse = api.errorResponse as jest.MockedFunction<typeof api.errorResponse>;
const mockApiErrorResponse = api.apiErrorResponse as jest.MockedFunction<
  typeof api.apiErrorResponse
>;
const mockCheckRateLimit = rateLimit.checkRateLimit as jest.MockedFunction<
  typeof rateLimit.checkRateLimit
>;
const mockSetRateLimitHeaders = rateLimit.setRateLimitHeaders as jest.MockedFunction<
  typeof rateLimit.setRateLimitHeaders
>;
const mockGetCatalogEntryWithRelations =
  catalogService.getCatalogEntryWithRelations as jest.MockedFunction<
    typeof catalogService.getCatalogEntryWithRelations
  >;
const mockVerifyCatalogOwnership = catalogService.verifyCatalogOwnership as jest.MockedFunction<
  typeof catalogService.verifyCatalogOwnership
>;
const mockUpdateCatalogEntry = catalogRepo.updateCatalogEntry as jest.MockedFunction<
  typeof catalogRepo.updateCatalogEntry
>;
const mockDeleteCatalogEntry = catalogRepo.deleteCatalogEntry as jest.MockedFunction<
  typeof catalogRepo.deleteCatalogEntry
>;
const mockUpdateCatalogEntrySchema = validation.updateCatalogEntrySchema as any;

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

const mockEntry = {
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
};

describe('GET /api/catalog/[id]', () => {
  it('returns entry with relations', async () => {
    const mockData = {
      entry: mockEntry,
      dependencies: [],
      dependents: [],
      children: [],
    };
    mockGetCatalogEntryWithRelations.mockResolvedValueOnce(mockData);
    mockSuccessResponse.mockReturnValueOnce(new Response() as any);

    const request = new NextRequest('http://localhost/api/catalog/entry-1');
    const params = Promise.resolve({ id: 'entry-1' });
    await GET(request, { params });

    expect(mockGetCatalogEntryWithRelations).toHaveBeenCalledWith('entry-1');
    expect(mockSuccessResponse).toHaveBeenCalledWith(mockData);
  });

  it('returns 404 for missing entry', async () => {
    mockGetCatalogEntryWithRelations.mockRejectedValueOnce(
      new NotFoundError('Catalog entry not found')
    );
    mockApiErrorResponse.mockReturnValueOnce(new Response(null, { status: 404 }) as any);

    const request = new NextRequest('http://localhost/api/catalog/missing');
    const params = Promise.resolve({ id: 'missing' });
    await GET(request, { params });

    expect(mockApiErrorResponse).toHaveBeenCalled();
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 30000,
    });
    mockErrorResponse.mockReturnValueOnce(new Response() as any);

    const request = new NextRequest('http://localhost/api/catalog/entry-1');
    const params = Promise.resolve({ id: 'entry-1' });
    await GET(request, { params });

    expect(mockErrorResponse).toHaveBeenCalledWith('Rate limit exceeded', 429, expect.any(Object));
  });
});

describe('PATCH /api/catalog/[id]', () => {
  const updateData = { display_name: 'Updated Service' };

  it('updates entry when owner', async () => {
    mockUpdateCatalogEntrySchema.safeParse = jest.fn().mockReturnValue({
      success: true,
      data: updateData,
    });
    mockVerifyCatalogOwnership.mockResolvedValueOnce(mockEntry);
    mockUpdateCatalogEntry.mockResolvedValueOnce({
      ...mockEntry,
      ...updateData,
    } as any);
    mockSuccessResponse.mockReturnValueOnce(new Response() as any);

    const request = new NextRequest('http://localhost/api/catalog/entry-1', {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
    const params = Promise.resolve({ id: 'entry-1' });
    await PATCH(request, { params });

    expect(mockVerifyCatalogOwnership).toHaveBeenCalledWith('entry-1', 'user-1');
    expect(mockUpdateCatalogEntry).toHaveBeenCalledWith('entry-1', updateData);
  });

  it('returns 403 when not owner', async () => {
    mockUpdateCatalogEntrySchema.safeParse = jest.fn().mockReturnValue({
      success: true,
      data: updateData,
    });
    mockVerifyCatalogOwnership.mockRejectedValueOnce(
      new ForbiddenError('You do not own this catalog entry')
    );
    mockApiErrorResponse.mockReturnValueOnce(new Response(null, { status: 403 }) as any);

    const request = new NextRequest('http://localhost/api/catalog/entry-1', {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
    const params = Promise.resolve({ id: 'entry-1' });
    await PATCH(request, { params });

    expect(mockApiErrorResponse).toHaveBeenCalled();
  });

  it('returns 400 for invalid body', async () => {
    mockUpdateCatalogEntrySchema.safeParse = jest.fn().mockReturnValue({
      success: false,
      error: { issues: [{ message: 'Invalid field' }] },
    });
    mockErrorResponse.mockReturnValueOnce(new Response() as any);

    const request = new NextRequest('http://localhost/api/catalog/entry-1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'INVALID' }),
    });
    const params = Promise.resolve({ id: 'entry-1' });
    await PATCH(request, { params });

    expect(mockErrorResponse).toHaveBeenCalledWith('Invalid request body', 400, expect.any(Object));
  });
});

describe('DELETE /api/catalog/[id]', () => {
  it('removes entry when owner', async () => {
    mockVerifyCatalogOwnership.mockResolvedValueOnce(mockEntry);
    mockDeleteCatalogEntry.mockResolvedValueOnce(undefined);
    mockNoContentResponse.mockReturnValueOnce(new Response(null, { status: 204 }) as any);

    const request = new NextRequest('http://localhost/api/catalog/entry-1', {
      method: 'DELETE',
    });
    const params = Promise.resolve({ id: 'entry-1' });
    await DELETE(request, { params });

    expect(mockVerifyCatalogOwnership).toHaveBeenCalledWith('entry-1', 'user-1');
    expect(mockDeleteCatalogEntry).toHaveBeenCalledWith('entry-1');
    expect(mockNoContentResponse).toHaveBeenCalled();
  });

  it('returns 403 when not owner', async () => {
    mockVerifyCatalogOwnership.mockRejectedValueOnce(
      new ForbiddenError('You do not own this catalog entry')
    );
    mockApiErrorResponse.mockReturnValueOnce(new Response(null, { status: 403 }) as any);

    const request = new NextRequest('http://localhost/api/catalog/entry-1', {
      method: 'DELETE',
    });
    const params = Promise.resolve({ id: 'entry-1' });
    await DELETE(request, { params });

    expect(mockApiErrorResponse).toHaveBeenCalled();
  });

  it('returns 404 for missing entry', async () => {
    mockVerifyCatalogOwnership.mockRejectedValueOnce(new NotFoundError('Catalog entry not found'));
    mockApiErrorResponse.mockReturnValueOnce(new Response(null, { status: 404 }) as any);

    const request = new NextRequest('http://localhost/api/catalog/missing', {
      method: 'DELETE',
    });
    const params = Promise.resolve({ id: 'missing' });
    await DELETE(request, { params });

    expect(mockApiErrorResponse).toHaveBeenCalled();
  });
});
