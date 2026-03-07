import {
  discoverCatalogFiles,
  importDiscoveredRepos,
} from '@/lib/services/catalog-discovery.service';

const MOCK_YAML = `
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: test-service
  description: A test service
  tags:
    - typescript
spec:
  type: service
  lifecycle: production
  owner: team-a
`;

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    from: () => ({
      select: () => ({
        eq: () => ({
          is: () =>
            Promise.resolve({
              data: [
                {
                  installation_id: 123,
                  account_login: 'test-org',
                },
              ],
              error: null,
            }),
        }),
      }),
    }),
  }),
}));

const mockGetContent = jest.fn();
const mockListRepos = jest.fn();

jest.mock('@/lib/github/client', () => ({
  getInstallationOctokit: jest.fn().mockResolvedValue({
    rest: {
      repos: {
        getContent: (...args: unknown[]) => mockGetContent(...args),
      },
    },
  }),
}));

jest.mock('@/lib/github/operations', () => ({
  listRepos: (...args: unknown[]) => mockListRepos(...args),
}));

jest.mock('@/lib/services/catalog-import.service', () => ({
  importCatalogYaml: jest.fn().mockResolvedValue({
    imported: [{ name: 'test-service', type: 'service', action: 'created' }],
    errors: [],
  }),
}));

describe('catalog-discovery.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('discoverCatalogFiles', () => {
    it('scans repos and finds catalog-info.yaml', async () => {
      mockListRepos.mockResolvedValue([
        {
          id: 1,
          fullName: 'test-org/my-service',
          defaultBranch: 'main',
          description: 'A service',
          language: 'TypeScript',
        },
      ]);

      mockGetContent.mockResolvedValue({
        data: {
          content: Buffer.from(MOCK_YAML).toString('base64'),
        },
      });

      const result = await discoverCatalogFiles('user-123');

      expect(result.scanned).toBe(1);
      expect(result.discovered).toHaveLength(1);
      expect(result.discovered[0].fullName).toBe('test-org/my-service');
      expect(result.discovered[0].entityCount).toBe(1);
      expect(result.discovered[0].entities[0].name).toBe('test-service');
      expect(result.discovered[0].entities[0].kind).toBe('Component');
    });

    it('skips repos without catalog-info.yaml', async () => {
      mockListRepos.mockResolvedValue([
        {
          id: 2,
          fullName: 'test-org/no-catalog',
          defaultBranch: 'main',
          description: null,
          language: null,
        },
      ]);

      mockGetContent.mockRejectedValue(new Error('Not found'));

      const result = await discoverCatalogFiles('user-123');

      expect(result.scanned).toBe(1);
      expect(result.discovered).toHaveLength(0);
    });

    it('returns empty when no installations', async () => {
      const { createClient } = require('@/lib/supabase/server');
      createClient.mockResolvedValueOnce({
        from: () => ({
          select: () => ({
            eq: () => ({
              is: () => Promise.resolve({ data: [], error: null }),
            }),
          }),
        }),
      });

      const result = await discoverCatalogFiles('user-123');
      expect(result.discovered).toHaveLength(0);
      expect(result.scanned).toBe(0);
    });
  });

  describe('importDiscoveredRepos', () => {
    it('fetches and imports catalog files', async () => {
      mockGetContent.mockResolvedValue({
        data: {
          content: Buffer.from(MOCK_YAML).toString('base64'),
        },
      });

      const result = await importDiscoveredRepos('user-123', [
        { installationId: 123, fullName: 'test-org/my-service' },
      ]);

      expect(result.imported).toHaveLength(1);
      expect(result.imported[0].name).toBe('test-service');
    });

    it('reports error when catalog file not found', async () => {
      mockGetContent.mockRejectedValue(new Error('Not found'));

      const result = await importDiscoveredRepos('user-123', [
        { installationId: 123, fullName: 'test-org/no-catalog' },
      ]);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain('not found');
    });
  });
});
