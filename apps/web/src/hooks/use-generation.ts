/**
 * React hooks for component generation with real-time streaming
 */

import { useState, useCallback, useRef } from 'react';
import { streamGeneration, GenerationOptions, GenerationEvent } from '@/lib/api/generation';
import type { QualityReport } from '@/lib/quality/gates';
import { useCreateGeneration } from './use-generations';

export interface UseGenerationState {
  isGenerating: boolean;
  progress: number;
  code: string;
  error: string | null;
  events: GenerationEvent[];
  qualityReport: QualityReport | null;
  generationId: string | null;
  parentGenerationId: string | null;
  conversationTurn: number;
}

const INITIAL_STATE: UseGenerationState = {
  isGenerating: false,
  progress: 0,
  code: '',
  error: null,
  events: [],
  qualityReport: null,
  generationId: null,
  parentGenerationId: null,
  conversationTurn: 0,
};

export function useGeneration(projectId?: string) {
  const [state, setState] = useState<UseGenerationState>(INITIAL_STATE);

  const abortControllerRef = useRef<AbortController | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const createGeneration = useCreateGeneration();

  const startGeneration = useCallback(
    async (
      options: GenerationOptions & {
        componentName: string;
        prompt: string;
      }
    ) => {
      try {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        const isRefinement = !!options.parentGenerationId;

        setState((prev) => ({
          isGenerating: true,
          progress: 0,
          code: '',
          error: null,
          events: [],
          qualityReport: null,
          generationId: null,
          parentGenerationId: isRefinement ? prev.parentGenerationId : null,
          conversationTurn: isRefinement ? prev.conversationTurn : 0,
        }));

        abortControllerRef.current = new AbortController();

        const startTime = Date.now();
        let chunkCount = 0;
        let code = '';
        let tokensUsed = 0;

        for await (const event of streamGeneration(options)) {
          if (abortControllerRef.current?.signal.aborted) break;

          setState((prev) => ({ ...prev, events: [...prev.events, event] }));

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
                setState((prev) => ({
                  ...prev,
                  code,
                  progress: Math.min((chunkCount / 10) * 100, 95),
                }));
              }
              break;

            case 'quality':
              setState((prev) => ({
                ...prev,
                qualityReport: (event.report as QualityReport) ?? null,
              }));
              break;

            case 'complete': {
              const evt = event as Record<string, unknown>;
              const genId = (evt.generationId as string) || null;
              setState((prev) => ({
                ...prev,
                code,
                progress: 100,
                isGenerating: false,
                generationId: genId,
                parentGenerationId: genId,
                conversationTurn: prev.conversationTurn + 1,
              }));

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
                    generation_time_ms: Date.now() - startTime,
                  });
                } catch (saveError) {
                  console.error('Failed to save generation:', saveError);
                }
              }
              break;
            }

            case 'error':
              setState((prev) => ({
                ...prev,
                error: event.message || 'Generation failed',
                isGenerating: false,
              }));
              break;
          }
        }

        setState((prev) => {
          if (prev.isGenerating) return { ...prev, isGenerating: false };
          return prev;
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error',
          isGenerating: false,
        }));
      }
    },
    [projectId, createGeneration]
  );

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        error: 'Generation cancelled',
      }));
    }
  }, []);

  const reset = useCallback(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setState(INITIAL_STATE);
  }, []);

  const startRefinement = useCallback(
    async (
      refinementPrompt: string,
      options: GenerationOptions & {
        componentName: string;
        prompt: string;
      }
    ) => {
      const current = stateRef.current;
      await startGeneration({
        ...options,
        parentGenerationId:
          current.generationId || current.parentGenerationId || undefined,
        previousCode: current.code || undefined,
        refinementPrompt,
      });
    },
    [startGeneration]
  );

  return { ...state, startGeneration, startRefinement, stopGeneration, reset };
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
        return '\u{1F680}';
      case 'chunk':
        return '\u{26A1}';
      case 'complete':
        return '\u{2705}';
      case 'error':
        return '\u{274C}';
      default:
        return '\u{1F4DD}';
    }
  };

  return { latestEvent, statusMessage: getStatusMessage(), getEventIcon };
}
