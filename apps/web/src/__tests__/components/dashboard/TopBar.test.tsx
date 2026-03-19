import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TopBar from '@/components/dashboard/TopBar';
import { useUIStore } from '@/stores/ui-store';
import type { User } from '@supabase/supabase-js';

const mockSetCommandPaletteOpen = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/projects'),
}));

jest.mock('next/link', () => {
  const MockLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'Link';
  return MockLink;
});

jest.mock('@/stores/ui-store');

jest.mock('@/hooks/use-page-meta', () => ({
  usePageMeta: jest.fn(() => ({
    title: 'Projects',
    icon: null,
    breadcrumbs: [{ href: '/projects', label: 'Projects' }],
  })),
}));

jest.mock('@/components/dashboard/UserMenu', () => {
  const MockUserMenu = ({ user }: { user: User }) => (
    <div data-testid="user-menu">{user.email}</div>
  );
  MockUserMenu.displayName = 'UserMenu';
  return MockUserMenu;
});

jest.mock('@/components/dashboard/MobileNav', () => {
  const MockMobileNav = ({
    open,
    onClose,
  }: {
    open: boolean;
    onClose: () => void;
    isAdmin: boolean;
  }) => (open ? <button type="button" data-testid="mobile-nav" onClick={onClose} /> : null);
  MockMobileNav.displayName = 'MobileNav';
  return MockMobileNav;
});

jest.mock('lucide-react', () => ({
  MenuIcon: () => <svg data-testid="menu-icon" />,
  SearchIcon: () => <svg data-testid="search-icon" />,
  ChevronRightIcon: () => <svg data-testid="chevron-icon" />,
  BellIcon: () => <svg data-testid="bell-icon" />,
  InboxIcon: () => <svg data-testid="inbox-icon" />,
}));

const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>;

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2026-01-01',
} as User;

describe('TopBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUIStore.mockImplementation((selector: (s: any) => any) =>
      selector({ setCommandPaletteOpen: mockSetCommandPaletteOpen })
    );
  });

  it('renders header element', () => {
    render(<TopBar user={mockUser} isAdmin={false} />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders menu button for mobile', () => {
    render(<TopBar user={mockUser} isAdmin={false} />);
    expect(screen.getByLabelText('Open main menu')).toBeInTheDocument();
  });

  it('renders notifications button', () => {
    render(<TopBar user={mockUser} isAdmin={false} />);
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
  });

  it('shows notification panel when bell clicked', () => {
    render(<TopBar user={mockUser} isAdmin={false} />);
    fireEvent.click(screen.getByLabelText('Notifications'));
    expect(screen.getByText('No notifications yet')).toBeInTheDocument();
  });

  it('renders UserMenu with user', () => {
    render(<TopBar user={mockUser} isAdmin={false} />);
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('calls setCommandPaletteOpen when search clicked', () => {
    render(<TopBar user={mockUser} isAdmin={false} />);
    const searchBtn = screen.getByText('Search...');
    fireEvent.click(searchBtn.closest('button')!);
    expect(mockSetCommandPaletteOpen).toHaveBeenCalledWith(true);
  });

  it('shows MobileNav after menu button click', () => {
    render(<TopBar user={mockUser} isAdmin={false} />);
    fireEvent.click(screen.getByLabelText('Open main menu'));
    expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();
  });
});
