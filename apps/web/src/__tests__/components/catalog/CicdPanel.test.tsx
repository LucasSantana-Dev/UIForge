import { render, screen, waitFor } from '@testing-library/react';
import CicdPanel from '@/components/catalog/CicdPanel';

beforeEach(() => {
  jest.clearAllMocks();
  (global.fetch as jest.Mock) = jest.fn();
});

const mockRuns = [
  {
    id: 1,
    name: 'CI',
    status: 'completed',
    conclusion: 'success',
    branch: 'main',
    commit_message: 'feat: Add feature',
    html_url: 'https://github.com/Forge-Space/siza/actions/runs/1',
    run_started_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:02:15Z',
    duration_ms: 135000,
  },
  {
    id: 2,
    name: 'Deploy',
    status: 'completed',
    conclusion: 'failure',
    branch: 'feat/test',
    commit_message: 'fix: Bug fix',
    html_url: 'https://github.com/Forge-Space/siza/actions/runs/2',
    run_started_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:01:30Z',
    duration_ms: 90000,
  },
  {
    id: 3,
    name: 'Lint',
    status: 'in_progress',
    conclusion: null,
    branch: 'main',
    commit_message: 'chore: Update deps',
    html_url: 'https://github.com/Forge-Space/siza/actions/runs/3',
    run_started_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:30Z',
    duration_ms: null,
  },
];

describe('CicdPanel', () => {
  it('shows empty state when no repositoryUrl', () => {
    render(<CicdPanel />);
    expect(
      screen.getByText('No GitHub repository configured for CI/CD visibility.')
    ).toBeInTheDocument();
  });

  it('shows empty state when URL is not GitHub', () => {
    render(<CicdPanel repositoryUrl="https://gitlab.com/org/repo" />);
    expect(
      screen.getByText('No GitHub repository configured for CI/CD visibility.')
    ).toBeInTheDocument();
  });

  it('shows loading state while fetch is pending', () => {
    (global.fetch as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(
      <CicdPanel repositoryUrl="https://github.com/Forge-Space/siza" />
    );
    expect(screen.getByText('Loading workflow runs...')).toBeInTheDocument();
  });

  it('renders workflow runs with status badges', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockRuns }),
    });

    render(
      <CicdPanel repositoryUrl="https://github.com/Forge-Space/siza" />
    );

    await waitFor(() => {
      expect(screen.getByText('CI')).toBeInTheDocument();
    });
    expect(screen.getByText('Deploy')).toBeInTheDocument();
    expect(screen.getByText('Lint')).toBeInTheDocument();
    expect(screen.getByText('CI/CD Workflow Runs')).toBeInTheDocument();
  });

  it('shows success badge for completed/success run', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [mockRuns[0]] }),
    });

    render(
      <CicdPanel repositoryUrl="https://github.com/Forge-Space/siza" />
    );

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });

  it('shows failed badge for completed/failure run', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [mockRuns[1]] }),
    });

    render(
      <CicdPanel repositoryUrl="https://github.com/Forge-Space/siza" />
    );

    await waitFor(() => {
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });
  });

  it('shows in progress badge for running workflow', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [mockRuns[2]] }),
    });

    render(
      <CicdPanel repositoryUrl="https://github.com/Forge-Space/siza" />
    );

    await waitFor(() => {
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });
  });

  it('shows error state when fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    render(
      <CicdPanel repositoryUrl="https://github.com/Forge-Space/siza" />
    );

    await waitFor(() => {
      expect(screen.getByText('Unable to load CI/CD data')).toBeInTheDocument();
    });
    expect(screen.getByText('View on GitHub')).toBeInTheDocument();
  });

  it('shows empty runs state when no workflows exist', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });

    render(
      <CicdPanel repositoryUrl="https://github.com/Forge-Space/siza" />
    );

    await waitFor(() => {
      expect(
        screen.getByText('No workflow runs found for this repository.')
      ).toBeInTheDocument();
    });
  });

  it('renders "View all" link to GitHub Actions', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockRuns }),
    });

    render(
      <CicdPanel repositoryUrl="https://github.com/Forge-Space/siza" />
    );

    await waitFor(() => {
      expect(screen.getByText('View all')).toBeInTheDocument();
    });
    const link = screen.getByText('View all').closest('a');
    expect(link).toHaveAttribute(
      'href',
      'https://github.com/Forge-Space/siza/actions'
    );
  });
});
