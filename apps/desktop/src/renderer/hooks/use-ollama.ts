import { useState, useEffect } from 'react';
import type { OllamaStatus } from '../../shared/types';

export function useOllama() {
  const [status, setStatus] = useState<OllamaStatus>({
    running: false,
    models: [],
  });

  useEffect(() => {
    let cancelled = false;
    const doRefresh = async () => {
      try {
        const result = await window.siza.checkOllama();
        if (!cancelled) setStatus(result);
      } catch {
        if (!cancelled) setStatus({ running: false, models: [] });
      }
    };
    doRefresh();
    const interval = setInterval(doRefresh, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const refresh = async () => {
    try {
      const result = await window.siza.checkOllama();
      setStatus(result);
    } catch {
      setStatus({ running: false, models: [] });
    }
  };

  return { ...status, refresh };
}
