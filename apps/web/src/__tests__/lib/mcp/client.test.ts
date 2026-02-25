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
  it('should return false when env vars missing', () => {
    delete process.env.MCP_GATEWAY_URL;
    delete process.env.MCP_GATEWAY_JWT;
    expect(isMcpConfigured()).toBe(false);
  });

  it('should return false when only URL set', () => {
    process.env.MCP_GATEWAY_URL = 'http://localhost:4444';
    delete process.env.MCP_GATEWAY_JWT;
    expect(isMcpConfigured()).toBe(false);
  });

  it('should return true when both env vars set', () => {
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

  it('should fetch and return tools array', async () => {
    const mockTools = [
      { name: 'tool1', description: 'Test tool', inputSchema: {} },
    ];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTools),
    });

    const tools = await listTools();

    expect(tools).toEqual(mockTools);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:4444/tools?limit=0&include_pagination=false',
      expect.objectContaining({
        headers: { Authorization: 'Bearer test-jwt' },
      })
    );
  });

  it('should handle nested tools response', async () => {
    const mockTools = [{ name: 'tool1', description: 'T', inputSchema: {} }];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ tools: mockTools }),
    });

    const tools = await listTools();
    expect(tools).toEqual(mockTools);
  });

  it('should throw on non-ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(listTools()).rejects.toThrow('Failed to list tools: 500');
  });

  it('should throw when not configured', async () => {
    delete process.env.MCP_GATEWAY_URL;
    await expect(listTools()).rejects.toThrow('MCP gateway not configured');
  });
});

describe('callTool', () => {
  beforeEach(() => {
    process.env.MCP_GATEWAY_URL = 'http://localhost:4444';
    process.env.MCP_GATEWAY_JWT = 'test-jwt';
  });

  it('should call tool via JSON-RPC and return result', async () => {
    const mockResult = {
      content: [{ type: 'text', text: 'Hello' }],
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          jsonrpc: '2.0',
          id: 1,
          result: mockResult,
        }),
    });

    const result = await callTool('test_tool', { arg: 'value' });

    expect(result).toEqual(mockResult);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:4444/rpc',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-jwt',
          'Content-Type': 'application/json',
        }),
      })
    );

    const callBody = JSON.parse(
      (fetch as jest.Mock).mock.calls[0][1].body
    );
    expect(callBody.method).toBe('tools/call');
    expect(callBody.params.name).toBe('test_tool');
    expect(callBody.params.arguments).toEqual({ arg: 'value' });
  });

  it('should throw on JSON-RPC error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          jsonrpc: '2.0',
          id: 1,
          error: { code: -32600, message: 'Invalid request' },
        }),
    });

    await expect(callTool('bad_tool', {})).rejects.toThrow(
      'MCP tool error (-32600): Invalid request'
    );
  });

  it('should throw on empty result', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ jsonrpc: '2.0', id: 1 }),
    });

    await expect(callTool('empty_tool', {})).rejects.toThrow(
      'MCP gateway returned empty result'
    );
  });

  it('should throw on HTTP error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    await expect(callTool('test_tool', {})).rejects.toThrow(
      'MCP gateway returned 401: Unauthorized'
    );
  });

  it('should strip trailing slash from URL', async () => {
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
    expect((fetch as jest.Mock).mock.calls[0][0]).toBe(
      'http://localhost:4444/rpc'
    );
  });
});

describe('generateComponent', () => {
  beforeEach(() => {
    process.env.MCP_GATEWAY_URL = 'http://localhost:4444';
    process.env.MCP_GATEWAY_JWT = 'test-jwt';
  });

  it('should generate component via execute_specialist_task', async () => {
    const generatedCode = 'export default function Button() { return <button>Click</button>; }';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          jsonrpc: '2.0',
          id: 1,
          result: {
            content: [{ type: 'text', text: generatedCode }],
          },
        }),
    });

    const code = await generateComponent({
      prompt: 'A primary button component',
      framework: 'react',
      componentLibrary: 'tailwind',
      style: 'modern',
      typescript: true,
    });

    expect(code).toBe(generatedCode);

    const callBody = JSON.parse(
      (fetch as jest.Mock).mock.calls[0][1].body
    );
    expect(callBody.params.name).toBe('execute_specialist_task');
    expect(callBody.params.arguments.category).toBe('ui_generation');

    const prefs = JSON.parse(
      callBody.params.arguments.user_preferences
    );
    expect(prefs.framework).toBe('react');
    expect(prefs.design_system).toBe('tailwind_ui');
  });

  it('should map component libraries to design systems', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          jsonrpc: '2.0',
          id: 1,
          result: { content: [{ type: 'text', text: 'code' }] },
        }),
    });

    await generateComponent({
      prompt: 'test',
      framework: 'react',
      componentLibrary: 'mui',
    });

    const body1 = JSON.parse(
      (fetch as jest.Mock).mock.calls[0][1].body
    );
    const prefs1 = JSON.parse(body1.params.arguments.user_preferences);
    expect(prefs1.design_system).toBe('material_design');

    (fetch as jest.Mock).mockClear();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          jsonrpc: '2.0',
          id: 1,
          result: { content: [{ type: 'text', text: 'code' }] },
        }),
    });

    await generateComponent({
      prompt: 'test',
      framework: 'react',
      componentLibrary: 'chakra',
    });

    const body2 = JSON.parse(
      (fetch as jest.Mock).mock.calls[0][1].body
    );
    const prefs2 = JSON.parse(body2.params.arguments.user_preferences);
    expect(prefs2.design_system).toBe('chakra_ui');
  });

  it('should throw when no text content returned', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          jsonrpc: '2.0',
          id: 1,
          result: { content: [{ type: 'image', data: 'base64' }] },
        }),
    });

    await expect(
      generateComponent({ prompt: 'test', framework: 'react' })
    ).rejects.toThrow('MCP gateway returned no text content');
  });

  it('should include context addition in task', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          jsonrpc: '2.0',
          id: 1,
          result: { content: [{ type: 'text', text: 'code' }] },
        }),
    });

    await generateComponent({
      prompt: 'A button',
      framework: 'react',
      contextAddition: 'Use brand colors',
    });

    const body = JSON.parse(
      (fetch as jest.Mock).mock.calls[0][1].body
    );
    expect(body.params.arguments.task).toContain('Use brand colors');
  });
});
