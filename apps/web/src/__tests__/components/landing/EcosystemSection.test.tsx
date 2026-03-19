import { render, screen } from '@testing-library/react';
import { EcosystemSection } from '@/components/landing/EcosystemSection';
import type { EcosystemSnapshot } from '@/lib/marketing/ecosystem-data';

const baseSnapshot: EcosystemSnapshot = {
  repoCount: 8,
  releasedRepoCount: 6,
  lastSyncedAt: '2026-03-15T00:00:00.000Z',
  repos: [
    {
      name: 'branding-mcp',
      description: 'AI-powered brand identity generation',
      url: 'https://github.com/Forge-Space/branding-mcp',
      group: 'Design & Brand',
      latestReleaseTag: 'v0.8.0',
      latestReleaseAt: '2026-03-10T00:00:00.000Z',
    },
    {
      name: 'forge-ai-init',
      description: 'AI governance initialization',
      url: 'https://github.com/Forge-Space/forge-ai-init',
      group: 'Governance & Quality',
      latestReleaseTag: 'v1.3.0',
      latestReleaseAt: '2026-03-12T00:00:00.000Z',
    },
    {
      name: 'siza-gen',
      description: 'Component generation engine',
      url: 'https://github.com/Forge-Space/siza-gen',
      group: 'Generation Engine',
      latestReleaseTag: 'v0.13.0',
      latestReleaseAt: '2026-03-11T00:00:00.000Z',
    },
  ],
  stats: { updatedLast30d: 7, updatedLast7d: 3 },
  npmDownloads: { total: 12500, packages: {} },
};

describe('EcosystemSection', () => {
  it('renders the section with id ecosystem', () => {
    const { container } = render(<EcosystemSection snapshot={baseSnapshot} />);
    expect(container.querySelector('#ecosystem')).toBeInTheDocument();
  });

  it('renders repo count in the heading', () => {
    render(<EcosystemSection snapshot={baseSnapshot} />);
    expect(screen.getByText('8 repos. One vision.')).toBeInTheDocument();
  });

  it('renders Ecosystem label', () => {
    render(<EcosystemSection snapshot={baseSnapshot} />);
    expect(screen.getByText('Ecosystem')).toBeInTheDocument();
  });

  it('renders the three layer groups', () => {
    render(<EcosystemSection snapshot={baseSnapshot} />);
    expect(screen.getByText('Design & Brand')).toBeInTheDocument();
    expect(screen.getByText('Governance & Quality')).toBeInTheDocument();
    expect(screen.getByText('Generation Engine')).toBeInTheDocument();
  });

  it('renders layer labels Layer 1, 2, 3', () => {
    render(<EcosystemSection snapshot={baseSnapshot} />);
    expect(screen.getByText('Layer 1')).toBeInTheDocument();
    expect(screen.getByText('Layer 2')).toBeInTheDocument();
    expect(screen.getByText('Layer 3')).toBeInTheDocument();
  });

  it('renders repo nodes with names', () => {
    render(<EcosystemSection snapshot={baseSnapshot} />);
    expect(screen.getByText('branding-mcp')).toBeInTheDocument();
    expect(screen.getByText('forge-ai-init')).toBeInTheDocument();
    expect(screen.getByText('siza-gen')).toBeInTheDocument();
  });

  it('renders release tags on repo nodes', () => {
    render(<EcosystemSection snapshot={baseSnapshot} />);
    expect(screen.getByText('v0.8.0')).toBeInTheDocument();
    expect(screen.getByText('v1.3.0')).toBeInTheDocument();
  });

  it('renders footer stats with released repo count', () => {
    render(<EcosystemSection snapshot={baseSnapshot} />);
    expect(screen.getByText('6 packages released')).toBeInTheDocument();
    expect(screen.getByText('3 repos updated in the last 7 days')).toBeInTheDocument();
  });

  it('renders npm download stats when total > 0', () => {
    render(<EcosystemSection snapshot={baseSnapshot} />);
    expect(screen.getByText('12,500 npm downloads last month')).toBeInTheDocument();
  });

  it('does not render npm downloads when total is 0', () => {
    const snap = { ...baseSnapshot, npmDownloads: { total: 0, packages: {} } };
    render(<EcosystemSection snapshot={snap} />);
    expect(screen.queryByText(/npm downloads/)).not.toBeInTheDocument();
  });

  it('renders last synced date', () => {
    render(<EcosystemSection snapshot={baseSnapshot} />);
    expect(screen.getByText(/Last synced/)).toBeInTheDocument();
  });
});
