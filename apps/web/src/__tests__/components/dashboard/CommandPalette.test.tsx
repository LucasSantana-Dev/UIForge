import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useUIStore } from '@/stores/ui-store';
import { CommandPalette } from '@/components/dashboard/CommandPalette';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/stores/ui-store');

// Mock cmdk entirely to avoid ResizeObserver (not available in jsdom)

function makeCmdkMocks() {
  function CmdRoot({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
      <div data-testid="command" className={className}>
        {children}
      </div>
    );
  }
  CmdRoot.displayName = 'Command';

  function CmdInput({
    placeholder,
    value,
    onValueChange,
    className,
  }: {
    placeholder?: string;
    value?: string;
    onValueChange?: (v: string) => void;
    autoFocus?: boolean;
    className?: string;
  }) {
    return (
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        className={className}
        data-testid="command-input"
      />
    );
  }
  CmdInput.displayName = 'Command.Input';

  function CmdList({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
      <div data-testid="command-list" className={className}>
        {children}
      </div>
    );
  }
  CmdList.displayName = 'Command.List';

  function CmdEmpty({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
      <div data-testid="command-empty" className={className}>
        {children}
      </div>
    );
  }
  CmdEmpty.displayName = 'Command.Empty';

  function CmdGroup({
    children,
    heading,
    className,
  }: {
    children: React.ReactNode;
    heading?: string;
    className?: string;
  }) {
    return (
      <div data-testid={`command-group-${heading}`} className={className}>
        {heading && <span>{heading}</span>}
        {children}
      </div>
    );
  }
  CmdGroup.displayName = 'Command.Group';

  function CmdItem({
    children,
    onSelect,
    className,
    value,
  }: {
    children: React.ReactNode;
    onSelect?: () => void;
    className?: string;
    value?: string;
  }) {
    return (
      <button
        type="button"
        data-testid="command-item"
        data-value={value}
        onClick={onSelect}
        className={className}
      >
        {children}
      </button>
    );
  }
  CmdItem.displayName = 'Command.Item';

  function CmdSeparator({ className }: { className?: string }) {
    return <hr data-testid="command-separator" className={className} />;
  }
  CmdSeparator.displayName = 'Command.Separator';

  const Command = Object.assign(CmdRoot, {
    Input: CmdInput,
    List: CmdList,
    Empty: CmdEmpty,
    Group: CmdGroup,
    Item: CmdItem,
    Separator: CmdSeparator,
  });

  return { Command };
}

jest.mock('cmdk', () => makeCmdkMocks());

const mockUseUIStore = jest.mocked(useUIStore);
const mockSetOpen = jest.fn();

function setupStore(open: boolean) {
  mockUseUIStore.mockImplementation((selector: any) =>
    selector({ commandPaletteOpen: open, setCommandPaletteOpen: mockSetOpen })
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
  setupStore(true);
});

describe('CommandPalette', () => {
  it('renders nothing when closed', () => {
    setupStore(false);
    render(<CommandPalette />);
    expect(
      screen.queryByPlaceholderText('Search projects, catalog, templates...')
    ).not.toBeInTheDocument();
  });

  it('renders the search input when open', () => {
    render(<CommandPalette />);
    expect(
      screen.getByPlaceholderText('Search projects, catalog, templates...')
    ).toBeInTheDocument();
  });

  it('renders Quick Actions and Pages groups by default', () => {
    render(<CommandPalette />);
    expect(screen.getByText('New Generation')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('closes the palette when backdrop is clicked', () => {
    render(<CommandPalette />);
    const backdrop = document.querySelector('[aria-hidden="true"]') as HTMLElement;
    fireEvent.click(backdrop);
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });

  it('navigates and closes on item select', async () => {
    render(<CommandPalette />);
    const newGenerationItem = screen.getByText('New Generation');
    fireEvent.click(newGenerationItem);
    await waitFor(() => {
      expect(mockSetOpen).toHaveBeenCalledWith(false);
      expect(mockPush).toHaveBeenCalledWith('/generate');
    });
  });

  it('shows search results when query is 2+ characters', async () => {
    const mockResults = [{ id: '1', title: 'My Project', type: 'project', href: '/projects/1' }];
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ results: mockResults }),
    });

    render(<CommandPalette />);
    const input = screen.getByPlaceholderText('Search projects, catalog, templates...');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'my' } });
      await new Promise((r) => setTimeout(r, 300));
    });

    await waitFor(() => {
      expect(screen.getByText('My Project')).toBeInTheDocument();
    });
  });

  it('hides static groups when query has 2+ characters', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    });

    render(<CommandPalette />);
    const input = screen.getByPlaceholderText('Search projects, catalog, templates...');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'ab' } });
      await new Promise((r) => setTimeout(r, 300));
    });

    await waitFor(() => {
      expect(screen.queryByText('New Generation')).not.toBeInTheDocument();
    });
  });

  it('renders navigation hint footer', () => {
    render(<CommandPalette />);
    expect(screen.getByText(/Navigate/)).toBeInTheDocument();
  });
});
