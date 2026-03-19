import {
  listPluginsForUser,
  installPluginForUser,
  getInstalledWidgetsForSlot,
} from '@/lib/services/plugin.service';

const mockPlugins = [
  {
    id: 'p1',
    slug: 'tech-debt-scanner',
    name: 'Tech Debt Scanner',
    description: 'Scans for tech debt',
    version: '1.0.0',
    author: 'Siza',
    icon: 'AlertTriangle',
    category: 'governance',
    status: 'official',
    enabled: true,
    config_schema: {},
    default_config: { threshold: 80 },
    permissions: [],
    widget_slots: ['catalog-detail'],
    routes: [],
    metadata: {},
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'p2',
    slug: 'architecture-guard',
    name: 'Architecture Guard',
    description: 'Enforces architecture rules',
    version: '1.0.0',
    author: 'Siza',
    icon: 'Shield',
    category: 'architecture',
    status: 'official',
    enabled: true,
    config_schema: {},
    default_config: {},
    permissions: [],
    widget_slots: ['project-overview'],
    routes: [],
    metadata: {},
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
];

const mockInstallation = {
  id: 'inst-1',
  plugin_id: 'p1',
  user_id: 'user-1',
  enabled: true,
  config: { threshold: 80 },
  installed_at: '2026-01-01',
  updated_at: '2026-01-01',
};

const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockRange = jest.fn();
const mockOrder = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/lib/repositories/base.repo', () => ({
  getClient: jest.fn().mockResolvedValue({
    from: (...args: unknown[]) => mockFrom(...args),
  }),
  paginationRange: jest.fn((page, limit) => ({
    from: (page - 1) * limit,
    to: page * limit - 1,
  })),
}));

function setupTableMock() {
  mockFrom.mockImplementation((table) => {
    if (table === 'plugin_installations') {
      return {
        select: () => ({
          eq: () =>
            Promise.resolve({
              data: [mockInstallation],
              error: null,
            }),
        }),
      };
    }
    return { select: mockSelect };
  });
  mockSelect.mockReturnValue({ eq: mockEq });
  mockEq.mockReturnValue({ order: mockOrder });
  mockOrder.mockReturnValue({ range: mockRange });
  mockRange.mockResolvedValue({
    data: mockPlugins,
    error: null,
    count: 2,
  });
}

describe('Plugin Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listPluginsForUser', () => {
    it('should return plugins with installation state', async () => {
      setupTableMock();

      const result = await listPluginsForUser('user-1');
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe('installPluginForUser', () => {
    it('should throw NotFoundError for unknown slug', async () => {
      mockFrom.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });
      mockSingle.mockResolvedValue({ data: null, error: null });

      await expect(installPluginForUser('nonexistent', 'user-1')).rejects.toThrow('not found');
    });
  });

  describe('getInstalledWidgetsForSlot', () => {
    it('should filter by slot name and installation status', async () => {
      setupTableMock();

      const result = await getInstalledWidgetsForSlot('user-1', 'catalog-detail');
      expect(result.every((p) => p.widget_slots.includes('catalog-detail'))).toBe(true);
    });
  });
});
