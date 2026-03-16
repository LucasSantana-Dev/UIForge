import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import GitHubPanel from '@/components/dashboard/GitHubPanel';

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    asChild,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    asChild?: boolean;
    disabled?: boolean;
  }) => {
    if (asChild) return <div>{children}</div>;
    return (
      <button onClick={onClick} disabled={disabled}>
        {children}
      </button>
    );
  },
}));

jest.mock('lucide-react', () => ({
  Github: () => <svg data-testid="github-icon" />,
  ExternalLink: () => <svg data-testid="external-link-icon" />,
  RefreshCw: () => <svg data-testid="refresh-icon" />,
}));

const mockInstallations = [
  { id: 'inst-1', installationId: 123, accountLogin: 'myorg', accountType: 'Organization' },
];

const mockRepos = [
  {
    id: 1,
    fullName: 'myorg/myrepo',
    defaultBranch: 'main',
    private: false,
    description: null,
    language: 'TypeScript',
    installationId: 'inst-1',
    accountLogin: 'myorg',
  },
];

describe('GitHubPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {}));
    render(<GitHubPanel />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows Connect GitHub when no installations', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ installations: [], repos: [] }),
    });
    render(<GitHubPanel />);
    await waitFor(() => {
      expect(screen.getByText('Connect GitHub')).toBeInTheDocument();
    });
  });

  it('shows Install GitHub App link when no installations', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ installations: [], repos: [] }),
    });
    render(<GitHubPanel />);
    await waitFor(() => {
      expect(screen.getByText('Install GitHub App')).toBeInTheDocument();
    });
  });

  it('shows installation accountLogin when installations exist', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ installations: mockInstallations, repos: [] }),
    });
    render(<GitHubPanel />);
    await waitFor(() => {
      expect(screen.getByText('myorg')).toBeInTheDocument();
    });
  });

  it('shows repos count and repo name when repos exist', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ installations: mockInstallations, repos: mockRepos }),
    });
    render(<GitHubPanel />);
    await waitFor(() => {
      expect(screen.getByText('myorg/myrepo')).toBeInTheDocument();
      expect(screen.getByText('1 repos accessible')).toBeInTheDocument();
    });
  });

  it('gracefully handles non-ok fetch response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    });
    render(<GitHubPanel />);
    await waitFor(() => {
      expect(screen.getByText('Connect GitHub')).toBeInTheDocument();
    });
  });
});
