import { renderHook, act, waitFor } from '@testing-library/react';
import { useSuggestions } from '@/hooks/use-suggestions';

const mockFetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  Object.defineProperty(global, 'fetch', { value: mockFetch, writable: true });
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      suggestions: [
        { text: 'Login form', source: 'template' },
        { text: 'Login page', source: 'history' },
      ],
    }),
  });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useSuggestions', () => {
  it('returns empty suggestions and isLoading=false initially', () => {
    const { result } = renderHook(() => useSuggestions({ query: '', enabled: true }));
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('does not fetch when query is shorter than 3 chars', () => {
    renderHook(() => useSuggestions({ query: 'ab', enabled: true }));
    act(() => {
      jest.runAllTimers();
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does not fetch when enabled=false', () => {
    renderHook(() => useSuggestions({ query: 'login form', enabled: false }));
    act(() => {
      jest.runAllTimers();
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does not fetch when query is empty', () => {
    renderHook(() => useSuggestions({ query: '', enabled: true }));
    act(() => {
      jest.runAllTimers();
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('sets isLoading=true after debounce starts', async () => {
    const { result } = renderHook(() => useSuggestions({ query: 'login form', enabled: true }));

    expect(result.current.isLoading).toBe(true);
  });

  it('fetches suggestions after debounce delay', async () => {
    const { result } = renderHook(() => useSuggestions({ query: 'login form', enabled: true }));

    await act(async () => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.suggestions).toHaveLength(2);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/suggestions?'),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('q=login+form'),
      expect.any(Object)
    );
  });

  it('includes framework param when provided', async () => {
    renderHook(() => useSuggestions({ query: 'login form', framework: 'react', enabled: true }));

    await act(async () => {
      jest.runAllTimers();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('framework=react'),
      expect.any(Object)
    );
  });

  it('clears suggestions when fetch returns non-ok', async () => {
    mockFetch.mockResolvedValue({ ok: false });

    const { result } = renderHook(() => useSuggestions({ query: 'login form', enabled: true }));

    await act(async () => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.suggestions).toEqual([]);
  });

  it('clears suggestions when query becomes too short', async () => {
    const { result, rerender } = renderHook(
      ({ query }: { query: string }) => useSuggestions({ query, enabled: true }),
      { initialProps: { query: 'login form' } }
    );

    await act(async () => {
      jest.runAllTimers();
    });
    await waitFor(() => expect(result.current.suggestions).toHaveLength(2));

    rerender({ query: 'ab' });

    expect(result.current.suggestions).toEqual([]);
  });

  it('uses custom debounce delay', async () => {
    renderHook(() => useSuggestions({ query: 'login form', enabled: true, debounceMs: 500 }));

    // Should not fetch before 500ms
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(mockFetch).not.toHaveBeenCalled();

    // Should fetch after 500ms
    await act(async () => {
      jest.advanceTimersByTime(200);
    });
    expect(mockFetch).toHaveBeenCalled();
  });
});
