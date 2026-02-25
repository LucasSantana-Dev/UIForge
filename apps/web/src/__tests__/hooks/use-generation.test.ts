/**
 * Use Generation Hook Tests
 * Tests for component generation React hook
 */

import { renderHook, act } from '@testing-library/react';
import { useGeneration } from '@/hooks/use-generation';
import { useCreateGeneration } from '@/hooks/use-generations';

// Mock dependencies
jest.mock('@/hooks/use-generations');
jest.mock('@/lib/api/generation', () => ({
  streamGeneration: jest.fn(),
}));

const mockUseCreateGeneration = useCreateGeneration as jest.MockedFunction<
  typeof useCreateGeneration
>;
const mockStreamGeneration = require('@/lib/api/generation').streamGeneration;

// TODO: Enable when feature is implemented
describe('useGeneration', () => {
  const mockCreateGeneration = {
    mutateAsync: jest.fn().mockResolvedValue({}),
    data: undefined,
    error: null,
    isError: false,
    isPending: false,
    isSuccess: false,
    isIdle: true,
    mutate: jest.fn(),
    reset: jest.fn(),
    status: 'idle' as const,
    failureCount: 0,
    failureReason: null,
    errorUpdatedAt: 0,
    isPaused: false,
    submittedAt: 0,
    variables: undefined,
    context: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCreateGeneration.mockReturnValue(mockCreateGeneration as any);

    // Reset stream generation mock
    mockStreamGeneration.mockImplementation(async function* () {
      yield { type: 'start' };
      yield { type: 'chunk', content: 'export default function ' };
      yield { type: 'chunk', content: 'Button() { return ' };
      yield { type: 'chunk', content: '<button>Click me</button>; }' };
      yield { type: 'complete' };
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGeneration());

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.code).toBe('');
    expect(result.current.progress).toBe(0);
    expect(result.current.events).toEqual([]);
  });

  describe('startGeneration', () => {
    it('should start generation successfully', async () => {
      const { result } = renderHook(() => useGeneration('test-project-id'));

      const options = {
        framework: 'react' as const,
        componentLibrary: 'tailwind' as const,
        description: 'Create a button component',
        style: 'modern' as const,
        typescript: false,
      };

      await act(async () => {
        await result.current.startGeneration({
          ...options,
          componentName: 'Button',
          prompt: 'Create a button component',
        });
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.code).toBe(
        'export default function Button() { return <button>Click me</button>; }'
      );
      expect(result.current.error).toBe(null);
      expect(result.current.progress).toBe(100);
    });

    it('should handle generation errors', async () => {
      const { result } = renderHook(() => useGeneration());

      mockStreamGeneration.mockImplementation(async function* () {
        yield { type: 'start' };
        yield { type: 'error', message: 'Generation failed' };
      });

      const options = {
        framework: 'react' as const,
        componentLibrary: 'tailwind' as const,
        description: 'Create a button component',
        style: 'modern' as const,
        typescript: false,
      };

      await act(async () => {
        await result.current.startGeneration({
          ...options,
          componentName: 'Button',
          prompt: 'Create a button component',
        });
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBe('Generation failed');
      expect(result.current.code).toBe('');
    });

    it('should save to database when project ID is provided', async () => {
      const { result } = renderHook(() => useGeneration('test-project-id'));

      const options = {
        framework: 'react' as const,
        componentLibrary: 'tailwind' as const,
        description: 'Create a button component',
        style: 'modern' as const,
        typescript: false,
      };

      await act(async () => {
        await result.current.startGeneration({
          ...options,
          componentName: 'Button',
          prompt: 'Create a button component',
        });
      });

      expect(mockCreateGeneration.mutateAsync).toHaveBeenCalledWith({
        project_id: 'test-project-id',
        prompt: 'Create a button component',
        component_name: 'Button',
        generated_code: 'export default function Button() { return <button>Click me</button>; }',
        framework: 'react',
        component_library: 'tailwind',
        style: 'modern',
        typescript: false,
        tokens_used: 0,
        generation_time_ms: expect.any(Number),
      });
    });

    it('should update progress during generation', async () => {
      const { result } = renderHook(() => useGeneration());

      mockStreamGeneration.mockImplementation(async function* () {
        yield { type: 'start' };
        yield { type: 'chunk', content: 'export' };
        yield { type: 'chunk', content: ' default' };
        yield { type: 'chunk', content: ' function' };
        yield { type: 'chunk', content: ' Button() {' };
        yield { type: 'chunk', content: ' return <button>Click me</button>; }' };
        yield { type: 'chunk', content: '}' };
        yield { type: 'complete' };
      });

      const options = {
        framework: 'react' as const,
        componentLibrary: 'tailwind' as const,
        description: 'Create a button component',
        style: 'modern' as const,
        typescript: false,
      };

      await act(async () => {
        await result.current.startGeneration({
          ...options,
          componentName: 'Button',
          prompt: 'Create a button component',
        });
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.progress).toBe(100);
    });
  });

  describe('stopGeneration', () => {
    it('should stop ongoing generation', async () => {
      const { result } = renderHook(() => useGeneration());

      // Mock a long-running generation
      mockStreamGeneration.mockImplementation(async function* () {
        yield { type: 'start' };
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Long delay
        yield { type: 'chunk', content: 'test' };
        yield { type: 'complete' };
      });

      const options = {
        framework: 'react' as const,
        componentLibrary: 'tailwind' as const,
        description: 'Create a button component',
        style: 'modern' as const,
        typescript: false,
      };

      // Start generation
      act(() => {
        result.current.startGeneration({
          ...options,
          componentName: 'Button',
          prompt: 'Create a button component',
        });
      });

      expect(result.current.isGenerating).toBe(true);

      // Stop generation
      act(() => {
        result.current.stopGeneration();
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBe('Generation cancelled');
    });

    it('should handle stop when no generation is active', () => {
      const { result } = renderHook(() => useGeneration());

      act(() => {
        result.current.stopGeneration();
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('reset', () => {
    it('should reset hook state', async () => {
      const { result } = renderHook(() => useGeneration());

      // Generate some code
      const options = {
        framework: 'react' as const,
        componentLibrary: 'tailwind' as const,
        description: 'Create a button component',
        style: 'modern' as const,
        typescript: false,
      };

      await act(async () => {
        await result.current.startGeneration({
          ...options,
          componentName: 'Button',
          prompt: 'Create a button component',
        });
      });

      expect(result.current.code).toBeTruthy();

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.code).toBe('');
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.progress).toBe(0);
      expect(result.current.events).toEqual([]);
    });
  });

  describe('concurrent generations', () => {
    it('should handle multiple generations in sequence', async () => {
      const { result } = renderHook(() => useGeneration());

      const options = {
        framework: 'react' as const,
        componentLibrary: 'tailwind' as const,
        description: 'Create a button component',
        style: 'modern' as const,
        typescript: false,
      };

      // First generation
      await act(async () => {
        await result.current.startGeneration({
          ...options,
          componentName: 'Button',
          prompt: 'Create a button component',
        });
      });

      expect(result.current.code).toContain('Button');

      // Second generation
      await act(async () => {
        await result.current.startGeneration({
          ...options,
          componentName: 'Card',
          prompt: 'Create a card component',
        });
      });

      expect(result.current.code).toContain('Button');
    });
  });

  describe('error handling', () => {
    it('should handle database save errors gracefully', async () => {
      const { result } = renderHook(() => useGeneration('test-project-id'));

      mockCreateGeneration.mutateAsync.mockRejectedValue(new Error('Database error'));

      const options = {
        framework: 'react' as const,
        componentLibrary: 'tailwind' as const,
        description: 'Create a button component',
        style: 'modern' as const,
        typescript: false,
      };

      await act(async () => {
        await result.current.startGeneration({
          ...options,
          componentName: 'Button',
          prompt: 'Create a button component',
        });
      });

      // Generation should still complete despite database error
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.code).toContain('Button');
      expect(result.current.error).toBe(null);
    });

    it('should handle stream interruption', async () => {
      const { result } = renderHook(() => useGeneration());

      mockStreamGeneration.mockImplementation(async function* () {
        yield { type: 'start' };
        yield { type: 'chunk', content: 'export default' };
        // Stream stops without complete
      });

      const options = {
        framework: 'react' as const,
        componentLibrary: 'tailwind' as const,
        description: 'Create a button component',
        style: 'modern' as const,
        typescript: false,
      };

      await act(async () => {
        await result.current.startGeneration({
          ...options,
          componentName: 'Button',
          prompt: 'Create a button component',
        });
      });

      // Should handle incomplete stream gracefully
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.code).toBe('export default');
    });
  });

  describe('events tracking', () => {
    it('should track generation events', async () => {
      const { result } = renderHook(() => useGeneration());

      const options = {
        framework: 'react' as const,
        componentLibrary: 'tailwind' as const,
        description: 'Create a button component',
        style: 'modern' as const,
        typescript: false,
      };

      await act(async () => {
        await result.current.startGeneration({
          ...options,
          componentName: 'Button',
          prompt: 'Create a button component',
        });
      });

      expect(result.current.events.length).toBeGreaterThanOrEqual(4);
      expect(result.current.events[0].type).toBe('start');
      expect(result.current.events[result.current.events.length - 1].type).toBe('complete');
    });

    it('should track error events', async () => {
      const { result } = renderHook(() => useGeneration());

      mockStreamGeneration.mockImplementation(async function* () {
        yield { type: 'start' };
        yield { type: 'error', message: 'Generation failed' };
      });

      const options = {
        framework: 'react' as const,
        componentLibrary: 'tailwind' as const,
        description: 'Create a button component',
        style: 'modern' as const,
        typescript: false,
      };

      await act(async () => {
        await result.current.startGeneration({
          ...options,
          componentName: 'Button',
          prompt: 'Create a button component',
        });
      });

      expect(result.current.events).toHaveLength(2); // start + error
      expect(result.current.events[0].type).toBe('start');
      expect(result.current.events[1].type).toBe('error');
    });
  });

  describe('quota handling', () => {
    it('should show quota exceeded message on 429 response', async () => {
      const { result } = renderHook(() => useGeneration());

      mockStreamGeneration.mockImplementation(async function* () {
        yield { type: 'start' };
        const error = new Error('Generation quota exceeded');
        (error as any).quota = { current: 10, limit: 10, remaining: 0 };
        throw error;
      });

      const options = {
        framework: 'react' as const,
        componentLibrary: 'tailwind' as const,
        description: 'Create a button',
        style: 'modern' as const,
        typescript: false,
      };

      await act(async () => {
        await result.current.startGeneration({
          ...options,
          componentName: 'Button',
          prompt: 'Create a button',
        });
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBe('Generation quota exceeded');
      expect(result.current.code).toBe('');
    });

    it('should show rate limit message on rate limit error', async () => {
      const { result } = renderHook(() => useGeneration());

      mockStreamGeneration.mockImplementation(async function* () {
        yield { type: 'start' };
        throw new Error('Rate limit exceeded. Try again shortly.');
      });

      const options = {
        framework: 'react' as const,
        componentLibrary: 'tailwind' as const,
        description: 'Create a button',
        style: 'modern' as const,
        typescript: false,
      };

      await act(async () => {
        await result.current.startGeneration({
          ...options,
          componentName: 'Button',
          prompt: 'Create a button',
        });
      });

      expect(result.current.error).toBe('Rate limit exceeded. Try again shortly.');
    });
  });
});
