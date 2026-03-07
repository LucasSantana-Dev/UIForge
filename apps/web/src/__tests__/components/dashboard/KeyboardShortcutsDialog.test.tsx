import React from 'react';
import { render, screen } from '@testing-library/react';
import { KeyboardShortcutsDialog } from '@/components/dashboard/KeyboardShortcutsDialog';

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

describe('KeyboardShortcutsDialog', () => {
  it('renders shortcuts when open', () => {
    render(<KeyboardShortcutsDialog open={true} onOpenChange={jest.fn()} />);

    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    expect(screen.getByText('Open command palette')).toBeInTheDocument();
    expect(screen.getByText('Toggle sidebar')).toBeInTheDocument();
    expect(screen.getByText('New generation')).toBeInTheDocument();
    expect(screen.getByText('Go to Projects')).toBeInTheDocument();
    expect(screen.getByText('Show this dialog')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<KeyboardShortcutsDialog open={false} onOpenChange={jest.fn()} />);

    expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
  });

  it('renders kbd elements for shortcut keys', () => {
    render(<KeyboardShortcutsDialog open={true} onOpenChange={jest.fn()} />);

    const kbds = screen.getAllByText('⌘');
    expect(kbds.length).toBeGreaterThan(0);
    expect(kbds[0].tagName.toLowerCase()).toBe('kbd');
  });
});
