import { renderHook, act } from '@testing-library/react';
import { useCountUp } from '@/hooks/use-count-up';

let mockIsInView = false;

jest.mock('motion/react', () => ({
  useInView: () => mockIsInView,
}));

let rafCallback: ((time: number) => void) | null = null;
const mockRaf = jest.fn((cb: (time: number) => void) => {
  rafCallback = cb;
  return 1;
});
const mockCancelRaf = jest.fn();

beforeAll(() => {
  Object.defineProperty(global, 'requestAnimationFrame', { value: mockRaf, writable: true });
  Object.defineProperty(global, 'cancelAnimationFrame', { value: mockCancelRaf, writable: true });
  Object.defineProperty(global, 'performance', {
    value: { now: jest.fn(() => 0) },
    writable: true,
  });
});

beforeEach(() => {
  mockIsInView = false;
  rafCallback = null;
  mockRaf.mockClear();
  mockCancelRaf.mockClear();
  (performance.now as jest.Mock).mockReturnValue(0);
});

describe('useCountUp', () => {
  it('returns initial display of "0"', () => {
    const { result } = renderHook(() => useCountUp({ end: 100 }));
    expect(result.current.display).toBe('0');
  });

  it('returns a ref object', () => {
    const { result } = renderHook(() => useCountUp({ end: 100 }));
    expect(result.current.ref).toBeDefined();
    expect(result.current.ref).toHaveProperty('current');
  });

  it('does not start animation when not in view', () => {
    mockIsInView = false;
    renderHook(() => useCountUp({ end: 100 }));
    expect(mockRaf).not.toHaveBeenCalled();
  });

  it('starts animation when in view', () => {
    mockIsInView = true;
    renderHook(() => useCountUp({ end: 100 }));
    expect(mockRaf).toHaveBeenCalled();
  });

  it('shows end value when animation completes', () => {
    mockIsInView = true;
    const { result } = renderHook(() => useCountUp({ end: 100, duration: 1000 }));

    act(() => {
      // Simulate time past duration — progress = 1
      (performance.now as jest.Mock).mockReturnValue(2000);
      if (rafCallback) rafCallback(2000);
    });

    expect(result.current.display).toBe('100');
  });

  it('shows intermediate value mid-animation', () => {
    mockIsInView = true;
    const { result } = renderHook(() => useCountUp({ end: 100, duration: 1000 }));

    act(() => {
      // Simulate halfway through — progress = 0.5, eased = 1 - (0.5)^3 = 0.875
      (performance.now as jest.Mock).mockReturnValue(500);
      if (rafCallback) rafCallback(500);
    });

    const val = parseInt(result.current.display, 10);
    expect(val).toBeGreaterThan(0);
    expect(val).toBeLessThan(100);
  });

  it('cancels animation on unmount', () => {
    mockIsInView = true;
    const { unmount } = renderHook(() => useCountUp({ end: 100 }));
    unmount();
    expect(mockCancelRaf).toHaveBeenCalled();
  });
});
