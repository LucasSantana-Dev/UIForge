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
    delete process.env.ANTHROPIC_API_KEY;
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

      // eslint-disable-next-line require-yield
      mcpStream.mockImplementation(async function* () {
        throw new Error('Gateway down');
      });
      generateWithProvider.mockImplementation(async function* () {
        yield { type: 'start', timestamp: 10 };
        yield { type: 'chunk', content: 'fallback-code', timestamp: 11 };
      });

      const events = await collectEvents(
        routeGeneration({ ...baseOpts, mcpEnabled: true, accessToken: 'tok-123' })
      );

      expect(captureServerError).toHaveBeenCalled();
      const fallbackEvent = events.find((e) => e.type === 'fallback');
      expect(fallbackEvent).toBeDefined();
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

    it('falls back to Anthropic on quota errors when server backup is available', async () => {
      const { generateWithProvider } = require('@/lib/services/generation');
      process.env.ANTHROPIC_API_KEY = 'server-anthropic-key';

      generateWithProvider.mockImplementation(async function* (options: any) {
        if (options.provider === 'google') {
          yield { type: 'error', message: 'quota exceeded 429', timestamp: 1 };
          return;
        }
        yield { type: 'start', timestamp: 2 };
        yield { type: 'chunk', content: 'fallback-code', timestamp: 3 };
        yield { type: 'complete', timestamp: 4 };
      });

      const events = await collectEvents(routeGeneration(baseOpts));

      expect(events.some((e) => e.type === 'fallback')).toBe(true);
      expect(events.some((e) => e.type === 'chunk' && e.content === 'fallback-code')).toBe(true);
      expect(generateWithProvider).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          provider: 'anthropic',
          apiKey: undefined,
        })
      );
    });

    it('returns normalized capacity guidance when no backup provider key is configured', async () => {
      const { generateWithProvider } = require('@/lib/services/generation');

      generateWithProvider.mockImplementation(async function* () {
        yield { type: 'error', message: 'quota exceeded 429', timestamp: 1 };
      });

      const events = await collectEvents(routeGeneration(baseOpts));

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('error');
      expect(events[0].message).toContain('capacity reached');
    });

    it('does not fallback for non-quota provider failures', async () => {
      const { generateWithProvider } = require('@/lib/services/generation');
      process.env.ANTHROPIC_API_KEY = 'server-anthropic-key';

      generateWithProvider.mockImplementation(async function* () {
        yield { type: 'error', message: 'provider key invalid', timestamp: 1 };
      });

      const events = await collectEvents(routeGeneration(baseOpts));

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('error');
      expect(events[0].message).toContain('provider key invalid');
      expect(generateWithProvider).toHaveBeenCalledTimes(1);
    });

    it('falls back from Anthropic BYOK to server Anthropic key on quota errors', async () => {
      const { generateWithProvider } = require('@/lib/services/generation');
      process.env.ANTHROPIC_API_KEY = 'server-anthropic-key';

      generateWithProvider.mockImplementation(async function* (options: any) {
        if (options.provider === 'anthropic' && options.apiKey === 'user-byok-key') {
          yield { type: 'error', message: 'quota exceeded 429', timestamp: 1 };
          return;
        }
        if (options.provider === 'anthropic' && options.apiKey === undefined) {
          yield { type: 'chunk', content: 'server-capacity-code', timestamp: 2 };
          yield { type: 'complete', timestamp: 3 };
        }
      });

      const events = await collectEvents(
        routeGeneration({
          ...baseOpts,
          provider: 'anthropic',
          model: 'claude-sonnet-4-20250514',
          userApiKey: 'user-byok-key',
        })
      );

      expect(events.some((e) => e.type === 'fallback')).toBe(true);
      expect(events.some((e) => e.type === 'chunk' && e.content === 'server-capacity-code')).toBe(
        true
      );
      expect(generateWithProvider).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          provider: 'anthropic',
          apiKey: undefined,
        })
      );
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
  });
});
