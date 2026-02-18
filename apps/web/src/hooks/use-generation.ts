/**
 * React hooks for component generation with real-time streaming
 */

import { useState, useCallback, useRef } from 'react';
import { streamGeneration, GenerationOptions, GenerationEvent } from '@/lib/api/generation';
import { useCreateGeneration } from './use-generations';

export interface UseGenerationState {
  isGenerating: boolean;
  progress: number;
  code: string;
  error: string | null;
  events: GenerationEvent[];
}

export function useGeneration(projectId?: string) {
  const [state, setState] = useState<UseGenerationState>({
    isGenerating: false,
    progress: 0,
    code: '',
    error: null,
    events: [],
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const createGeneration = useCreateGeneration();

  const startGeneration = useCallback(async (options: GenerationOptions & {
    componentName: string;
    prompt: string;
  }) => {
    try {
      // Cancel any ongoing generation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Reset state
      setState({
        isGenerating: true,
        progress: 0,
        code: '',
        error: null,
        events: [],
      });

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      let chunkCount = 0;
      let code = '';
      let tokensUsed = 0;

      // Stream generation
      for await (const event of streamGeneration(options)) {
        // Check if aborted
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        setState(prev => ({
          ...prev,
          events: [...prev.events, event],
        }));

        switch (event.type) {
          case 'start':
            chunkCount = 0;
            code = '';
            tokensUsed = 0;
            break;

          case 'chunk':
            if (event.content) {
              chunkCount++;
              code += event.content;

              setState(prev => ({
                ...prev,
                code,
                // Estimate progress based on chunk count
                progress: Math.min((chunkCount / 10) * 100, 95), // Assume ~10 chunks
              }));

              // Save to database if project ID is provided
              if (projectId && code) {
                try {
                  await createGeneration.mutateAsync({
                    project_id: projectId,
                    prompt: options.prompt,
                    component_name: options.componentName,
                    generated_code: code,
                    framework: options.framework,
                    component_library: options.componentLibrary,
                    style: options.style,
                    typescript: options.typescript || false,
                    tokens_used: tokensUsed,
                  });
                } catch (saveError) {
                  console.error('Failed to save generation:', saveError);
                  // Don't fail the generation, just log the error
                }
              }
            }
            break;

          case 'complete':
            setState(prev => ({
              ...prev,
              code,
              progress: 100,
              isGenerating: false,
            }));
            break;

          case 'error':
            setState(prev => ({
              ...prev,
              error: event.message || 'Generation failed',
              isGenerating: false,
            }));
            break;
        }
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isGenerating: false,
      }));
    }
  }, [projectId, createGeneration]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: 'Generation cancelled',
      }));
    }
  }, []);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({
      isGenerating: false,
      progress: 0,
      code: '',
      error: null,
      events: [],
    });
  }, []);

  return {
    ...state,
    startGeneration,
    stopGeneration,
    reset,
  };
}

export interface UseGenerationProgressProps {
  isGenerating: boolean;
  progress: number;
  events: GenerationEvent[];
  error: string | null;
}

export function useGenerationProgress({
  isGenerating,
  progress,
  events,
  error,
}: UseGenerationProgressProps) {
  const latestEvent = events[events.length - 1];

  const getStatusMessage = () => {
    if (error) return `Error: ${error}`;
    if (!isGenerating && progress === 100) return 'Generation complete!';
    if (isGenerating && progress === 0) return 'Starting generation...';
    if (isGenerating && progress < 30) return 'Analyzing requirements...';
    if (isGenerating && progress < 60) return 'Generating component structure...';
    if (isGenerating && progress < 90) return 'Adding styling and details...';
    if (isGenerating && progress < 100) return 'Finalizing component...';
    return 'Processing...';
  };

  const getEventIcon = (eventType: GenerationEvent['type']) => {
    switch (eventType) {
      case 'start':
        return '🚀';
      case 'chunk':
        return '⚡';
      case 'complete':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📝';
    }
  };

  return {
    latestEvent,
    statusMessage: getStatusMessage(),
    getEventIcon,
  };
}
