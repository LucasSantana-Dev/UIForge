'use client';

import { useState, useEffect, useRef } from 'react';

export interface Suggestion {
  text: string;
  source: 'history' | 'template';
  framework?: string;
  createdAt?: string;
}

interface UseSuggestionsOptions {
  query: string;
  framework?: string;
  enabled?: boolean;
  debounceMs?: number;
}

export function useSuggestions({
  query,
  framework,
  enabled = true,
  debounceMs = 300,
}: UseSuggestionsOptions) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!enabled || !query || query.trim().length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    timerRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const params = new URLSearchParams({
          q: query.trim(),
          limit: '8',
        });
        if (framework) params.set('framework', framework);

        const res = await fetch(`/api/suggestions?${params}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          setSuggestions([]);
          return;
        }

        const data = await res.json();
        if (!controller.signal.aborted) {
          setSuggestions(data.suggestions || []);
        }
      } catch (err: unknown) {
        if (
          err instanceof DOMException &&
          err.name === 'AbortError'
        ) {
          return;
        }
        setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [query, framework, enabled, debounceMs]);

  return { suggestions, isLoading };
}
