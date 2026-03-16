import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MobileNav from '@/components/dashboard/MobileNav';

const mockOnClose = jest.fn();

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

jest.mock('@/lib/features/flags', () => ({
  getFeatureFlag: jest.fn(() => false),
}));

jest.mock('lucide-react', () => ({
  XIcon: () => <svg data-testid="x-icon" />,
  PlusIcon: () => <svg data-testid="plus-icon" />,
  FolderIcon: () => <svg />,
  FileTextIcon: () => <svg />,
  ClockIcon: () => <svg />,
  KeyIcon: () => <svg />,
  CreditCardIcon: () => <svg />,
  SettingsIcon: () => <svg />,
}));

describe('MobileNav', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when open is false', () => {
    const { container } = render(<MobileNav open={false} onClose={mockOnClose} isAdmin={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nav panel when open is true', () => {
    render(<MobileNav open={true} onClose={mockOnClose} isAdmin={false} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has aria-modal on the nav dialog', () => {
    render(<MobileNav open={true} onClose={mockOnClose} isAdmin={false} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('calls onClose when close button is clicked', () => {
    render(<MobileNav open={true} onClose={mockOnClose} isAdmin={false} />);
    // Both the backdrop div and the X button have aria-label='Close navigation'
    // Use getAllByRole and pick the <button> element (last one is the actual button)
    const closeBtns = screen.getAllByRole('button', { name: 'Close navigation' });
    // The X button is inside the panel (not the backdrop div)
    fireEvent.click(closeBtns[closeBtns.length - 1]);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders Generate Component link', () => {
    render(<MobileNav open={true} onClose={mockOnClose} isAdmin={false} />);
    expect(screen.getByText('Generate Component')).toBeInTheDocument();
    const links = screen.getAllByRole('link');
    expect(links.some((l) => l.getAttribute('href') === '/generate')).toBe(true);
  });

  it('renders base nav items', () => {
    render(<MobileNav open={true} onClose={mockOnClose} isAdmin={false} />);
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('calls onClose when Escape key is pressed', () => {
    render(<MobileNav open={true} onClose={mockOnClose} isAdmin={false} />);
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    render(<MobileNav open={true} onClose={mockOnClose} isAdmin={false} />);
    // backdrop has role=button and aria-label='Close navigation' but is a div
    const allClose = screen.getAllByLabelText('Close navigation');
    // click the first one (the backdrop div)
    fireEvent.click(allClose[0]);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
