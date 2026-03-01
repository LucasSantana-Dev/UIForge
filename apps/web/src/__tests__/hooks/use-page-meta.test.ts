const mockPathname = jest.fn().mockReturnValue('/projects');
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

import { renderHook } from '@testing-library/react';
import { usePageMeta } from '@/hooks/use-page-meta';

describe('usePageMeta', () => {
  it('returns Projects for /projects', () => {
    mockPathname.mockReturnValue('/projects');
    const { result } = renderHook(() => usePageMeta());
    expect(result.current.title).toBe('Projects');
    expect(result.current.breadcrumbs).toHaveLength(2);
    expect(result.current.breadcrumbs[0].label).toBe('Home');
    expect(result.current.breadcrumbs[1].label).toBe('Projects');
  });

  it('returns Dashboard for /dashboard', () => {
    mockPathname.mockReturnValue('/dashboard');
    const { result } = renderHook(() => usePageMeta());
    expect(result.current.title).toBe('Dashboard');
    expect(result.current.breadcrumbs).toHaveLength(1);
    expect(result.current.breadcrumbs[0].label).toBe('Home');
  });

  it('returns Generator for /generate', () => {
    mockPathname.mockReturnValue('/generate');
    const { result } = renderHook(() => usePageMeta());
    expect(result.current.title).toBe('Generator');
  });

  it('returns Settings for /settings', () => {
    mockPathname.mockReturnValue('/settings');
    const { result } = renderHook(() => usePageMeta());
    expect(result.current.title).toBe('Settings');
  });

  it('returns AI Keys for /ai-keys', () => {
    mockPathname.mockReturnValue('/ai-keys');
    const { result } = renderHook(() => usePageMeta());
    expect(result.current.title).toBe('AI Keys');
  });

  it('returns Billing for /billing', () => {
    mockPathname.mockReturnValue('/billing');
    const { result } = renderHook(() => usePageMeta());
    expect(result.current.title).toBe('Billing');
  });

  it('handles nested routes with breadcrumbs', () => {
    mockPathname.mockReturnValue('/projects/abc-123');
    const { result } = renderHook(() => usePageMeta());
    expect(result.current.title).toBe('Projects');
    expect(result.current.breadcrumbs).toHaveLength(3);
    expect(result.current.breadcrumbs[2].label).toBe('Abc 123');
  });

  it('falls back to Dashboard for unknown paths', () => {
    mockPathname.mockReturnValue('/unknown');
    const { result } = renderHook(() => usePageMeta());
    expect(result.current.title).toBe('Dashboard');
  });
});
