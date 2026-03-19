import { render, screen } from '@testing-library/react';
import { StatsBar } from '@/components/landing/StatsBar';
import type { EcosystemSnapshot } from '@/lib/marketing/ecosystem-data';

jest.mock('@/lib/marketing/ecosystem-data', () => ({
  getFallbackEcosystemSnapshot: jest.fn(),
}));

const baseSnapshot: EcosystemSnapshot = {
  repoCount: 11,
  releasedRepoCount: 9,
  lastSyncedAt: '2026-03-10T00:00:00.000Z',
  repos: [],
  stats: { updatedLast30d: 10, updatedLast7d: 5 },
  npmDownloads: { total: 0, packages: {} },
};

describe('StatsBar', () => {
  it('renders Open Source Repos count', () => {
    render(<StatsBar snapshot={baseSnapshot} />);
    // repoCount appears at least once (always shown)
    const cells = screen.getAllByText('11');
    expect(cells.length).toBeGreaterThanOrEqual(1);
  });

  it('renders Published Releases count', () => {
    render(<StatsBar snapshot={baseSnapshot} />);
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('Published Releases')).toBeInTheDocument();
  });

  it('renders MIT license label', () => {
    render(<StatsBar snapshot={baseSnapshot} />);
    expect(screen.getByText('MIT')).toBeInTheDocument();
    expect(screen.getByText('Open Source License')).toBeInTheDocument();
  });

  it('shows Product Repos label when npmDownloads.total is 0', () => {
    render(<StatsBar snapshot={baseSnapshot} />);
    expect(screen.getByText('Product Repos')).toBeInTheDocument();
  });

  it('shows npm Downloads label when npmDownloads.total > 0', () => {
    const withDownloads = {
      ...baseSnapshot,
      npmDownloads: { total: 5000, packages: {} },
    };
    render(<StatsBar snapshot={withDownloads} />);
    expect(screen.getByText('npm Downloads / Month')).toBeInTheDocument();
  });

  it('formats npm downloads below 1000 as plain number', () => {
    const withDownloads = {
      ...baseSnapshot,
      npmDownloads: { total: 750, packages: {} },
    };
    render(<StatsBar snapshot={withDownloads} />);
    expect(screen.getByText('750')).toBeInTheDocument();
  });

  it('formats npm downloads 1000–9999 with k suffix', () => {
    const withDownloads = {
      ...baseSnapshot,
      npmDownloads: { total: 2500, packages: {} },
    };
    render(<StatsBar snapshot={withDownloads} />);
    expect(screen.getByText('2.5k')).toBeInTheDocument();
  });

  it('formats npm downloads >= 10000 as floored k', () => {
    const withDownloads = {
      ...baseSnapshot,
      npmDownloads: { total: 15700, packages: {} },
    };
    render(<StatsBar snapshot={withDownloads} />);
    expect(screen.getByText('15k')).toBeInTheDocument();
  });

  it('renders the ecosystem sync label', () => {
    render(<StatsBar snapshot={baseSnapshot} />);
    expect(screen.getByText(/live github ecosystem sync/i)).toBeInTheDocument();
  });
});
