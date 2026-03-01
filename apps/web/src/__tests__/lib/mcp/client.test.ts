import { isMcpConfigured, listTools, callTool, generateComponent } from '@/lib/mcp/client';

const originalEnv = process.env;

beforeEach(() => {
  jest.restoreAllMocks();
  process.env = { ...originalEnv };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('isMcpConfigured', () => {
  it('returns false when env vars missing', () => {
    delete process.env.MCP_GATEWAY_URL;
    delete process.env.MCP_GATEWAY_JWT;
    expect(isMcpConfigured()).toBe(false);
  });

  it('returns false when only URL set', () => {
    process.env.MCP_GATEWAY_URL = 'http://localhost:4444';
    delete process.env.MCP_GATEWAY_JWT;
    expect(isMcpConfigured()).toBe(false);
  });

  it('returns true when both env vars set', () => {
    process.env.MCP_GATEWAY_URL = 'http://localhost:4444';
    process.env.MCP_GATEWAY_JWT = 'test-jwt';
    expect(isMcpConfigured()).toBe(true);
  });
});

describe('listTools', () => {
  beforeEach(() => {
    process.env.MCP_GATEWAY_URL = 'http://localhost:4444';
    process.env.MCP_GATEWAY_JWT = 'test-jwt';
  });

  it('fetches and returns tools array', async () => {
    const mockTools = [{ name: 'tool1', description: 'Test', inputSchema: {} }];
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, json: () => Promise.resolve(mockTools) });
    const tools = await listTools();
    expect(tools).toEqual(mockTools);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:4444/tools?limit=0&include_pagination=false',
      expect.objectContaining({ headers: { Authorization: 'Bearer test-jwt' } })
    );
  });

  it('handles nested tools response', async () => {
    const mockTools = [{ name: 'tool1', description: 'T', inputSchema: {} }];
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, json: () => Promise.resolve({ tools: mockTools }) });
    expect(await listTools()).toEqual(mockTools);
  });

  it('throws on non-ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
    await expect(listTools()).rejects.toThrow('MCP gateway is unavailable (HTTP 500)');
  });

  it('throws when not configured', async () => {
    delete process.env.MCP_GATEWAY_URL;
    await expect(listTools()).rejects.toThrow('MCP gateway is not configured');
  });
});

describe('callTool', () => {
  beforeEach(() => {
    process.env.MCP_GATEWAY_URL = 'http://localhost:4444';
    process.env.MCP_GATEWAY_JWT = 'test-jwt';
  });

  it('calls tool via JSON-RPC and returns result', async () => {
    const mockResult = { content: [{ type: 'text', text: 'Hello' }] };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ jsonrpc: '2.0', id: 1, result: mockResult }),
    });
    const result = await callTool('test_tool', { arg: 'value' });
    expect(result).toEqual(mockResult);
    const callBody = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);
    expect(callBody.method).toBe('tools/call');
    expect(callBody.params.name).toBe('test_tool');
    expect(callBody.params.arguments).toEqual({ arg: 'value' });
  });

  it('throws on JSON-RPC error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          jsonrpc: '2.0',
          id: 1,
          error: { code: -32600, message: 'Invalid request' },
        }),
    });
    await expect(callTool('bad', {})).rejects.toThrow('MCP tool error (-32600): Invalid request');
  });

  it('throws on empty result', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ jsonrpc: '2.0', id: 1 }),
    });
    await expect(callTool('empty', {})).rejects.toThrow(
      'MCP gateway returned an empty result'
    );
  });

  it('throws on HTTP error', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 401, statusText: 'Unauthorized' });
    await expect(callTool('test', {})).rejects.toThrow('MCP gateway returned 401: Unauthorized');
  });

  it('strips trailing slash from URL', async () => {
    process.env.MCP_GATEWAY_URL = 'http://localhost:4444/';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          jsonrpc: '2.0',
          id: 1,
          result: { content: [{ type: 'text', text: 'ok' }] },
        }),
    });
    await callTool('test', {});
    expect((fetch as jest.Mock).mock.calls[0][0]).toBe('http://localhost:4444/rpc');
  });
});

describe('generateComponent', () => {
  beforeEach(() => {
    process.env.MCP_GATEWAY_URL = 'http://localhost:4444';
    process.env.MCP_GATEWAY_JWT = 'test-jwt';
  });

  it('generates via execute_specialist_task', async () => {
    const code = 'export default function Button() { return <button>Click</button>; }';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          jsonrpc: '2.0',
          id: 1,
          result: { content: [{ type: 'text', text: code }] },
        }),
    });
    expect(
      await generateComponent({
        prompt: 'A button',
        framework: 'react',
        componentLibrary: 'tailwind',
        style: 'modern',
        typescript: true,
      })
    ).toBe(code);
    const callBody = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);
    expect(callBody.params.name).toBe('execute_specialist_task');
    const prefs = JSON.parse(callBody.params.arguments.user_preferences);
    expect(prefs.design_system).toBe('tailwind_ui');
  });

  it('maps component libraries to design systems', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          jsonrpc: '2.0',
          id: 1,
          result: { content: [{ type: 'text', text: 'c' }] },
        }),
    });
    await generateComponent({ prompt: 't', framework: 'react', componentLibrary: 'mui' });
    expect(
      JSON.parse(
        JSON.parse((fetch as jest.Mock).mock.calls[0][1].body).params.arguments.user_preferences
      ).design_system
    ).toBe('material_design');
  });

  it('throws when no text content returned', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          jsonrpc: '2.0',
          id: 1,
          result: { content: [{ type: 'image', data: 'x' }] },
        }),
    });
    await expect(generateComponent({ prompt: 't', framework: 'react' })).rejects.toThrow(
      'The AI model did not produce any code'
    );
  });

  it('includes context addition in task', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          jsonrpc: '2.0',
          id: 1,
          result: { content: [{ type: 'text', text: 'c' }] },
        }),
    });
    await generateComponent({
      prompt: 'A button',
      framework: 'react',
      contextAddition: 'Use brand colors',
    });
    expect(JSON.parse((fetch as jest.Mock).mock.calls[0][1].body).params.arguments.task).toContain(
      'Use brand colors'
    );
  });
});
