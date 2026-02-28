/**
 * React hooks for component generation with real-time streaming
 */

import { useState, useCallback, useRef } from 'react';
import { streamGeneration, GenerationOptions, GenerationEvent } from '@/lib/api/generation';
import type { QualityReport } from '@/lib/quality/gates';

export interface UseGenerationState {
  isGenerating: boolean;
  progress: number;
  code: string;
  error: string | null;
  events: GenerationEvent[];
  qualityReport: QualityReport | null;
  parentGenerationId: string | null;
  conversationTurn: number;
}

const MAX_CONVERSATION_TURNS = 10;

export function useGeneration(projectId?: string) {
  const [state, setState] = useState<UseGenerationState>({
    isGenerating: false,
    progress: 0,
    code: '',
    error: null,
    events: [],
    qualityReport: null,
    parentGenerationId: null,
    conversationTurn: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

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

        const isRefinement = !!(options.parentGenerationId && options.refinementPrompt);

        setState((prev) => ({
          isGenerating: true,
          progress: 0,
          code: '',
          error: null,
          events: [],
          qualityReport: null,
          parentGenerationId: isRefinement ? prev.parentGenerationId : null,
          conversationTurn: isRefinement ? prev.conversationTurn : 0,
        }));

        abortControllerRef.current = new AbortController();

        let chunkCount = 0;
        let code = '';

        for await (const event of streamGeneration(options)) {
          if (abortControllerRef.current?.signal.aborted) break;

          setState((prev) => ({ ...prev, events: [...prev.events, event] }));

          switch (event.type) {
            case 'start':
              chunkCount = 0;
              code = '';
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

            case 'fallback':
              break;

            case 'complete':
              setState((prev) => ({
                ...prev,
                code,
                progress: 100,
                isGenerating: false,
                parentGenerationId: event.generationId ?? prev.parentGenerationId,
                conversationTurn: prev.conversationTurn + 1,
              }));
              break;

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
    []
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
    setState({
      isGenerating: false,
      progress: 0,
      code: '',
      error: null,
      events: [],
      qualityReport: null,
      parentGenerationId: null,
      conversationTurn: 0,
    });
  }, []);

  const startRefinement = useCallback(
    async (
      refinementPrompt: string,
      options: GenerationOptions & {
        componentName: string;
        prompt: string;
      }
    ) => {
      const currentState = stateRef.current;
      if (!currentState.parentGenerationId || !currentState.code) return;
      if (currentState.conversationTurn >= MAX_CONVERSATION_TURNS) return;

      await startGeneration({
        ...options,
        parentGenerationId: currentState.parentGenerationId,
        previousCode: currentState.code,
        refinementPrompt,
      });
    },
    [startGeneration]
  );

  return {
    ...state,
    maxConversationTurns: MAX_CONVERSATION_TURNS,
    startGeneration,
    startRefinement,
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

  return { latestEvent, statusMessage: getStatusMessage() };
}
