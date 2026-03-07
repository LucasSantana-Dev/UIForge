import { getDashboardNavigation, getDashboardPages } from '@/components/dashboard/navigation';

describe('dashboard navigation', () => {
  it('returns base navigation for non-admin users', () => {
    const items = getDashboardNavigation(false);
    expect(items.some((item) => item.href === '/admin')).toBe(false);
    expect(items.map((item) => item.name)).toEqual([
      'Projects',
      'Catalog',
      'Golden Paths',
      'Templates',
      'History',
      'AI Keys',
      'Billing',
      'Settings',
    ]);
  });

  it('includes admin item for admins', () => {
    const items = getDashboardNavigation(true);
    expect(items.some((item) => item.href === '/admin')).toBe(true);
  });

  it('returns dashboard pages including generator and admin page for admins', () => {
    const pages = getDashboardPages(true);
    expect(pages[0].href).toBe('/dashboard');
    expect(pages[1].href).toBe('/generate');
    expect(pages.some((page) => page.href === '/admin')).toBe(true);
  });

  it('returns dashboard pages without admin for non-admin users', () => {
    const pages = getDashboardPages(false);
    expect(pages.some((page) => page.href === '/admin')).toBe(false);
  });
});
