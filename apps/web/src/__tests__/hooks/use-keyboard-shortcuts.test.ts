import { renderHook } from '@testing-library/react';
import { useUIStore } from '@/stores/ui-store';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

function fireShortcut(key: string, meta = true) {
  const event = new KeyboardEvent('keydown', {
    key,
    metaKey: meta,
    bubbles: true,
    cancelable: true,
  });
  window.dispatchEvent(event);
}

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    mockPush.mockClear();
    useUIStore.setState({
      sidebarCollapsed: false,
      commandPaletteOpen: false,
    });
  });

  it('opens command palette on Meta+K', () => {
    renderHook(() => useKeyboardShortcuts());
    fireShortcut('k');
    expect(useUIStore.getState().commandPaletteOpen).toBe(true);
  });

  it('toggles sidebar on Meta+B', () => {
    renderHook(() => useKeyboardShortcuts());
    fireShortcut('b');
    expect(useUIStore.getState().sidebarCollapsed).toBe(true);
  });

  it('navigates to projects on Meta+1', () => {
    renderHook(() => useKeyboardShortcuts());
    fireShortcut('1');
    expect(mockPush).toHaveBeenCalledWith('/projects');
  });

  it('navigates to templates on Meta+2', () => {
    renderHook(() => useKeyboardShortcuts());
    fireShortcut('2');
    expect(mockPush).toHaveBeenCalledWith('/templates');
  });

  it('navigates to history on Meta+3', () => {
    renderHook(() => useKeyboardShortcuts());
    fireShortcut('3');
    expect(mockPush).toHaveBeenCalledWith('/history');
  });

  it('navigates to settings on Meta+4', () => {
    renderHook(() => useKeyboardShortcuts());
    fireShortcut('4');
    expect(mockPush).toHaveBeenCalledWith('/settings');
  });

  it('navigates to generate on Meta+N', () => {
    renderHook(() => useKeyboardShortcuts());
    fireShortcut('n');
    expect(mockPush).toHaveBeenCalledWith('/generate');
  });

  it('navigates to settings on Meta+,', () => {
    renderHook(() => useKeyboardShortcuts());
    fireShortcut(',');
    expect(mockPush).toHaveBeenCalledWith('/settings');
  });

  it('ignores shortcuts without meta/ctrl', () => {
    renderHook(() => useKeyboardShortcuts());
    fireShortcut('k', false);
    expect(useUIStore.getState().commandPaletteOpen).toBe(false);
  });
});
