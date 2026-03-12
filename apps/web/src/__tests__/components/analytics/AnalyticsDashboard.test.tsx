import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

const mockReport = {
  timestamp: '2026-03-12T00:00:00.000Z',
  users: { total: 120, last7d: 11, last30d: 45, active: 23 },
  generations: { total: 980, last24h: 21, last7d: 130, successRate: 92 },
  projects: { total: 67 },
  quality: {
    windowDays: 30 as const,
    totalGenerations: 220,
    revisionRate: 34.55,
    satisfactionRate: 78.4,
    satisfactionVotes: 25,
    mcpCoverage: 63.64,
  },
};

describe('AnalyticsDashboard', () => {
  let clickSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockReport,
    }) as jest.Mock;
    window.URL.createObjectURL = jest.fn(() => 'blob:metrics');
    window.URL.revokeObjectURL = jest.fn();
    clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    clickSpy.mockRestore();
  });

  it('renders loading and then live metrics data', async () => {
    render(<AnalyticsDashboard />);

    expect(screen.getByText('Live Analytics')).toBeInTheDocument();
    expect(screen.getAllByText('...').length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(screen.getByText('120')).toBeInTheDocument();
      expect(screen.getByText('980')).toBeInTheDocument();
      expect(screen.getByText('92%')).toBeInTheDocument();
    });
  });

  it('refetches metrics when time range changes', async () => {
    const user = userEvent.setup();
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/metrics?windowDays=30', {
        cache: 'no-store',
      });
    });

    await user.click(screen.getByRole('button', { name: '7d' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/metrics?windowDays=7', {
        cache: 'no-store',
      });
    });
  });

  it('exports csv using live data', async () => {
    const user = userEvent.setup();
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('120')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Export CSV' }));

    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
  });
});
