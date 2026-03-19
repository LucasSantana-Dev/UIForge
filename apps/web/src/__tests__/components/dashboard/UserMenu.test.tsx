import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserMenu from '@/components/dashboard/UserMenu';
import type { User } from '@supabase/supabase-js';

const mockPush = jest.fn();
const mockSignOut = jest.fn().mockResolvedValue({});

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { signOut: mockSignOut },
  }),
}));

jest.mock('lucide-react', () => ({
  LogOutIcon: () => <svg data-testid="logout-icon" />,
  SettingsIcon: () => <svg data-testid="settings-icon" />,
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode; asChild?: boolean }) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({
    children,
  }: {
    children: React.ReactNode;
    align?: string;
    className?: string;
  }) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}));

jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    variant: _variant,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    className?: string;
  }) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

const mockUser = {
  id: 'user-1',
  email: 'alice@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2026-01-01',
} as User;

describe('UserMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user email', () => {
    render(<UserMenu user={mockUser} />);
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('renders user initials as avatar fallback', () => {
    render(<UserMenu user={mockUser} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('navigates to settings when Settings is clicked', () => {
    render(<UserMenu user={mockUser} />);
    fireEvent.click(screen.getByText('Settings'));
    expect(mockPush).toHaveBeenCalledWith('/settings');
  });

  it('calls signOut and redirects to /signin on sign out', async () => {
    render(<UserMenu user={mockUser} />);
    fireEvent.click(screen.getByText('Sign out'));
    await Promise.resolve();
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('renders My Account label', () => {
    render(<UserMenu user={mockUser} />);
    expect(screen.getByText('My Account')).toBeInTheDocument();
  });
});
