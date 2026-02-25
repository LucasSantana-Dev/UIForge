import { useState, useEffect, useCallback } from 'react';
import type { OllamaStatus } from '../../shared/types';

export function useOllama() {
  const [status, setStatus] = useState<OllamaStatus>({
    running: false,
    models: [],
  });

  const refresh = useCallback(async () => {
    try {
      const result = await window.siza.checkOllama();
      setStatus(result);
    } catch {
      setStatus({ running: false, models: [] });
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { ...status, refresh };
}
