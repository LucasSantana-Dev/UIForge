import { routeGeneration, type RouteGenerationOptions } from '@/lib/services/provider-router';
import type { GenerationEvent } from '@/lib/services/generation-types';

jest.mock('@/lib/services/siza-router', () => ({
  routeSizaGeneration: jest.fn().mockReturnValue({
    provider: 'google',
    model: 'gemini-2.5-flash',
    reason: 'default',
  }),
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

jest.mock('@/lib/services/siza-local-agent', () => ({
  isSizaLocalFallbackEnabled: jest.fn(() => true),
  generateWithSizaLocalAgent: jest.fn(
    () => 'export default function LocalSizaAgent() { return null; }'
  ),
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
    model: 'gemini-2.5-flash',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SIZA_AGENT_LOCAL_FALLBACK = 'true';
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

    it('yields fallback event on MCP failure and falls back to default provider', async () => {
      const { generateComponentStream: mcpStream } = require('@/lib/mcp/client');
      const { generateWithProvider } = require('@/lib/services/generation');
      const { captureServerError } = require('@/lib/sentry/server');

      mcpStream.mockImplementation(async function* () {
        yield* [];
        throw new Error('Gateway down');
      });
      generateWithProvider.mockImplementation(async function* () {
        yield { type: 'start', timestamp: 10 };
        yield { type: 'chunk', content: 'fallback-code', timestamp: 11 };
      });

      const events = await collectEvents(
        routeGeneration({
          ...baseOpts,
          mcpEnabled: true,
          accessToken: 'tok-123',
          allowDirectProviderFallback: true,
        })
      );

      expect(captureServerError).toHaveBeenCalled();
      const fallbackEvent = events.find((e) => e.type === 'fallback');
      expect(fallbackEvent).toBeDefined();
      expect(events.some((e) => e.type === 'chunk' && e.content === 'fallback-code')).toBe(true);
    });

    it('returns policy error when MCP fallback is disabled', async () => {
      const { generateComponentStream: mcpStream } = require('@/lib/mcp/client');

      mcpStream.mockImplementation(async function* () {
        yield* [];
        throw new Error('Gateway down');
      });

      const events = await collectEvents(
        routeGeneration({
          ...baseOpts,
          mcpEnabled: true,
          accessToken: 'tok-123',
          allowDirectProviderFallback: false,
        })
      );

      expect(events).toHaveLength(2);
      expect(events[1].type).toBe('error');
      expect(events[1].message).toContain('disabled by policy');
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

    it('propagates errors without fallback', async () => {
      const { generateWithProvider } = require('@/lib/services/generation');

      generateWithProvider.mockImplementation(async function* () {
        yield { type: 'error', message: 'quota exceeded 429', timestamp: 1 };
      });

      const events = await collectEvents(routeGeneration(baseOpts));

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('error');
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

    it('always routes to default provider (Gemini)', async () => {
      const { generateWithProvider } = require('@/lib/services/generation');

      generateWithProvider.mockImplementation(async function* () {
        yield { type: 'start', timestamp: 1 };
        yield { type: 'complete', timestamp: 2 };
      });

      await collectEvents(routeGeneration({ ...baseOpts, provider: 'siza' }));

      expect(generateWithProvider).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'google', model: 'gemini-2.5-flash' })
      );
    });

    it('falls back to local Siza agent when provider is unavailable', async () => {
      const { generateWithProvider } = require('@/lib/services/generation');
      const { generateWithSizaLocalAgent } = require('@/lib/services/siza-local-agent');

      generateWithProvider.mockImplementation(async function* () {
        yield { type: 'error', message: 'Google generation failed: API key invalid', timestamp: 1 };
      });

      const events = await collectEvents(routeGeneration({ ...baseOpts, provider: 'siza' }));

      expect(generateWithSizaLocalAgent).toHaveBeenCalled();
      expect(
        events.find((e) => e.type === 'fallback' && e.provider === 'siza-local')
      ).toBeDefined();
      expect(
        events.find(
          (e) =>
            e.type === 'chunk' &&
            e.content === 'export default function LocalSizaAgent() { return null; }'
        )
      ).toBeDefined();
    });
  });
});
