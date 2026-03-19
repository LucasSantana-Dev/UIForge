import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '@/components/dashboard/Sidebar';
import { useUIStore } from '@/stores/ui-store';

const mockToggle = jest.fn();

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

jest.mock('next/image', () => {
  const MockImage = ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />;
  MockImage.displayName = 'Image';
  return MockImage;
});

jest.mock('@/stores/ui-store');
jest.mock('@/lib/features/flags', () => ({
  getFeatureFlag: jest.fn(() => false),
}));

jest.mock('@siza/ui', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({
    children,
    asChild: _asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => <div>{children}</div>,
}));

jest.mock('lucide-react', () => ({
  PlusIcon: () => <svg data-testid="plus-icon" />,
  ChevronsLeftIcon: () => <svg data-testid="chevrons-left-icon" />,
  FolderIcon: () => <svg />,
  FileTextIcon: () => <svg />,
  ClockIcon: () => <svg />,
  KeyIcon: () => <svg />,
  CreditCardIcon: () => <svg />,
  SettingsIcon: () => <svg />,
  ShieldIcon: () => <svg />,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>;

function setupStore(collapsed = false) {
  mockUseUIStore.mockImplementation((selector: (s: any) => any) =>
    selector({
      sidebarCollapsed: collapsed,
      toggleSidebarCollapsed: mockToggle,
    })
  );
}

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupStore();
  });

  it('renders logo link to /dashboard', () => {
    render(<Sidebar isAdmin={false} />);
    const links = screen.getAllByRole('link');
    expect(links.some((l) => l.getAttribute('href') === '/dashboard')).toBe(true);
  });

  it('renders Generate link to /generate', () => {
    render(<Sidebar isAdmin={false} />);
    const links = screen.getAllByRole('link');
    expect(links.some((l) => l.getAttribute('href') === '/generate')).toBe(true);
  });

  it('renders base nav items for non-admin', () => {
    render(<Sidebar isAdmin={false} />);
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders Admin nav item for admin users', () => {
    render(<Sidebar isAdmin={true} />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('shows Collapse button when expanded', () => {
    setupStore(false);
    render(<Sidebar isAdmin={false} />);
    const btn = screen.getByRole('button', { name: 'Collapse sidebar' });
    expect(btn).toBeInTheDocument();
  });

  it('shows Expand button when collapsed', () => {
    setupStore(true);
    render(<Sidebar isAdmin={false} />);
    const btn = screen.getByRole('button', { name: 'Expand sidebar' });
    expect(btn).toBeInTheDocument();
  });

  it('calls toggleSidebarCollapsed when collapse button clicked', () => {
    render(<Sidebar isAdmin={false} />);
    const btn = screen.getByRole('button', { name: 'Collapse sidebar' });
    fireEvent.click(btn);
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });
});
