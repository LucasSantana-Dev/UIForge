import { useState, useCallback } from 'react';
import type { McpToolResult } from '../../shared/types';

interface UseMcpResult {
  callTool: (name: string, args: Record<string, unknown>) => Promise<McpToolResult>;
  isLoading: boolean;
  error: string | null;
  lastResult: McpToolResult | null;
}

export function useMcp(): UseMcpResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<McpToolResult | null>(null);

  const callTool = useCallback(
    async (name: string, args: Record<string, unknown>): Promise<McpToolResult> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await window.siza.callTool(name, args);
        setLastResult(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Tool call failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { callTool, isLoading, error, lastResult };
}
