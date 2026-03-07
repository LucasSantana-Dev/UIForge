import { render, screen, waitFor } from '@testing-library/react';
import TechDocsPanel from '@/components/catalog/TechDocsPanel';

jest.mock('marked', () => ({
  marked: {
    parse: (content) => '<div>' + content + '</div>',
  },
}));

const mockFetch = jest.fn();

beforeAll(() => {
  (global as any).fetch = mockFetch;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockFetch.mockReset();
});

describe('TechDocsPanel', () => {
  it('shows empty state when no URL provided', () => {
    render(<TechDocsPanel />);
    expect(screen.getByText(/No documentation URL configured/i)).toBeInTheDocument();
  });

  it('shows loading state while fetching', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<TechDocsPanel documentationUrl="https://github.com/org/repo" />);
    expect(screen.getByText(/Loading documentation/i)).toBeInTheDocument();
  });

  it('renders fetched markdown content', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            content: '# Hello World',
            source: 'https://raw.githubusercontent.com/org/repo/main/README.md',
          },
        }),
    });
    render(<TechDocsPanel documentationUrl="https://github.com/org/repo" />);
    await waitFor(() => {
      expect(screen.getByText('Documentation')).toBeInTheDocument();
    });
    expect(screen.getByText('Source')).toBeInTheDocument();
  });

  it('shows error state with external link fallback', async () => {
    mockFetch.mockResolvedValue({ ok: false });
    render(<TechDocsPanel documentationUrl="https://github.com/org/repo" />);
    await waitFor(() => {
      expect(screen.getByText(/Unable to load documentation/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/View externally/i)).toBeInTheDocument();
  });

  it('prefers documentation URL over repository URL', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(
      <TechDocsPanel
        documentationUrl="https://docs.example.com/api.md"
        repositoryUrl="https://github.com/org/repo"
      />
    );
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('docs.example.com'));
  });

  it('falls back to repository URL when no documentation URL', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<TechDocsPanel repositoryUrl="https://github.com/org/repo" />);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('github.com'));
  });
});
