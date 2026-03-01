import { act, renderHook } from '@testing-library/react';
import { useUIStore } from '@/stores/ui-store';

describe('UI Store', () => {
  beforeEach(() => {
    act(() => {
      useUIStore.setState({
        sidebarOpen: true,
        sidebarCollapsed: false,
        commandPaletteOpen: false,
        theme: 'system',
      });
    });
  });

  describe('sidebarCollapsed', () => {
    it('defaults to false', () => {
      const { result } = renderHook(() => useUIStore());
      expect(result.current.sidebarCollapsed).toBe(false);
    });

    it('toggles collapsed state', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleSidebarCollapsed();
      });
      expect(result.current.sidebarCollapsed).toBe(true);

      act(() => {
        result.current.toggleSidebarCollapsed();
      });
      expect(result.current.sidebarCollapsed).toBe(false);
    });

    it('sets collapsed directly', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setSidebarCollapsed(true);
      });
      expect(result.current.sidebarCollapsed).toBe(true);
    });
  });

  describe('commandPaletteOpen', () => {
    it('defaults to false', () => {
      const { result } = renderHook(() => useUIStore());
      expect(result.current.commandPaletteOpen).toBe(false);
    });

    it('toggles palette state', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleCommandPalette();
      });
      expect(result.current.commandPaletteOpen).toBe(true);

      act(() => {
        result.current.toggleCommandPalette();
      });
      expect(result.current.commandPaletteOpen).toBe(false);
    });

    it('sets palette open directly', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setCommandPaletteOpen(true);
      });
      expect(result.current.commandPaletteOpen).toBe(true);
    });
  });

  describe('existing functionality', () => {
    it('toggles mobile sidebar', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleSidebar();
      });
      expect(result.current.sidebarOpen).toBe(false);
    });

    it('sets theme', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setTheme('dark');
      });
      expect(result.current.theme).toBe('dark');
    });
  });
});
