import { routeGeneration, type RouteGenerationOptions } from '@/lib/services/provider-router';
import type { GenerationEvent } from '@/lib/services/gemini';

jest.mock('@/lib/services/siza-router', () => ({
  routeSizaGeneration: jest.fn().mockReturnValue({
    provider: 'google',
    model: 'gemini-2.0-flash',
    reason: 'default',
  }),
  getQuotaFallback: jest.fn().mockReturnValue(null),
}));

jest.mock('@/lib/services/gemini', () => ({
  generateComponentStream: jest.fn(),
}));

jest.mock('@/lib/services/generation', () => ({
  generateWithProvider: jest.fn(),
}));

jest.mock('@/lib/mcp/client', () => ({
  generateComponentStream: jest.fn(),
}));

jest.mock('@/lib/sentry/server', () => ({
  captureServerError: jest.fn(),
}));

jest.mock('@/lib/services/fallback-limiter', () => ({
  canUseFallback: jest.fn().mockReturnValue(true),
  recordFallback: jest.fn(),
}));

async function collectEvents(gen: AsyncGenerator<GenerationEvent>): Promise<GenerationEvent[]> {
  const events: GenerationEvent[] = [];
  for await (const e of gen) events.push(e);
  return events;
}

describe('routeGeneration', () => {
  const baseOpts: RouteGenerationOptions = {
    mcpEnabled: false,
    prompt: 'A button',
    framework: 'react',
    contextAddition: '',
    provider: 'google',
    model: 'gemini-2.0-flash',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('MCP routing', () => {
    it('yields error when accessToken is missing', async () => {
      const events = await collectEvents(routeGeneration({ ...baseOpts, mcpEnabled: true }));
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('error');
      expect(events[0].message).toContain('authentication');
    });

    it('streams events from MCP gateway', async () => {
      const { generateComponentStream: mcpStream } = require('@/lib/mcp/client');
      const mockEvents: GenerationEvent[] = [
        { type: 'start', timestamp: 1 },
        { type: 'chunk', content: '<div>', timestamp: 2 },
      ];
      mcpStream.mockImplementation(async function* () {
        for (const e of mockEvents) yield e;
      });

      const events = await collectEvents(
        routeGeneration({ ...baseOpts, mcpEnabled: true, accessToken: 'tok-123' })
      );

      expect(events[0].type).toBe('start');
      expect(events.some((e) => e.type === 'chunk')).toBe(true);
    });

    it('yields fallback event and falls back to Gemini on MCP failure', async () => {
      const { generateComponentStream: mcpStream } = require('@/lib/mcp/client');
      const { generateComponentStream: geminiStream } = require('@/lib/services/gemini');
      const { captureServerError } = require('@/lib/sentry/server');

      // eslint-disable-next-line require-yield
      mcpStream.mockImplementation(async function* () {
        throw new Error('Gateway down');
      });
      geminiStream.mockImplementation(async function* () {
        yield { type: 'start', timestamp: 10 };
        yield { type: 'chunk', content: 'fallback-code', timestamp: 11 };
      });

      const events = await collectEvents(
        routeGeneration({ ...baseOpts, mcpEnabled: true, accessToken: 'tok-123' })
      );

      expect(captureServerError).toHaveBeenCalled();
      const fallbackEvent = events.find((e) => e.type === 'fallback');
      expect(fallbackEvent).toBeDefined();
      expect(fallbackEvent!.provider).toBe('gemini');
      expect(events.some((e) => e.type === 'chunk' && e.content === 'fallback-code')).toBe(true);
    });

    it('does not yield fallback when MCP succeeds', async () => {
      const { generateComponentStream: mcpStream } = require('@/lib/mcp/client');

      mcpStream.mockImplementation(async function* () {
        yield { type: 'start', timestamp: 1 };
        yield { type: 'chunk', content: 'mcp-code', timestamp: 2 };
      });

      const events = await collectEvents(
        routeGeneration({ ...baseOpts, mcpEnabled: true, accessToken: 'tok-123' })
      );

      expect(events.find((e) => e.type === 'fallback')).toBeUndefined();
    });

    it('filters out complete events from MCP stream', async () => {
      const { generateComponentStream: mcpStream } = require('@/lib/mcp/client');

      mcpStream.mockImplementation(async function* () {
        yield { type: 'start', timestamp: 1 };
        yield { type: 'complete', timestamp: 2 };
      });

      const events = await collectEvents(
        routeGeneration({ ...baseOpts, mcpEnabled: true, accessToken: 'tok-123' })
      );

      expect(events.find((e) => e.type === 'complete')).toBeUndefined();
    });
  });

  describe('Provider routing', () => {
    it('routes via provider when not MCP', async () => {
      const { generateWithProvider } = require('@/lib/services/generation');

      generateWithProvider.mockImplementation(async function* () {
        yield { type: 'start', timestamp: 1 };
        yield { type: 'chunk', content: 'provider-code', timestamp: 2 };
        yield { type: 'complete', timestamp: 3 };
      });

      const events = await collectEvents(routeGeneration(baseOpts));

      expect(events.some((e) => e.type === 'chunk')).toBe(true);
      expect(generateWithProvider).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'google' })
      );
    });

    it('handles quota error fallback to anthropic', async () => {
      const { generateWithProvider } = require('@/lib/services/generation');

      let callCount = 0;
      generateWithProvider.mockImplementation(async function* () {
        callCount++;
        if (callCount === 1) {
          yield { type: 'start', timestamp: 1 };
          yield { type: 'error', message: 'quota exceeded 429', timestamp: 2 };
        } else {
          yield { type: 'start', timestamp: 3 };
          yield { type: 'chunk', content: 'anthropic-code', timestamp: 4 };
          yield { type: 'complete', timestamp: 5 };
        }
      });

      process.env.ANTHROPIC_API_KEY = 'test-key';
      const events = await collectEvents(routeGeneration(baseOpts));
      delete process.env.ANTHROPIC_API_KEY;

      const fallback = events.find((e) => e.type === 'fallback');
      expect(fallback).toBeDefined();
      expect(fallback!.provider).toBe('anthropic');
    });
  });

  describe('Siza AI routing', () => {
    it('yields routing event for siza provider', async () => {
      const { generateWithProvider } = require('@/lib/services/generation');

      generateWithProvider.mockImplementation(async function* () {
        yield { type: 'start', timestamp: 1 };
        yield { type: 'chunk', content: 'siza-code', timestamp: 2 };
        yield { type: 'complete', timestamp: 3 };
      });

      const events = await collectEvents(routeGeneration({ ...baseOpts, provider: 'siza' }));

      expect(events[0].type).toBe('routing');
    });
  });
});
