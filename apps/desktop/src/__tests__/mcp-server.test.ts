import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('electron', () => ({
  app: {
    isPackaged: false,
    getVersion: () => '0.1.0',
  },
}));

vi.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    listTools: vi.fn().mockResolvedValue({
      tools: [
        { name: 'generate_ui_component', description: 'Generate UI' },
        { name: 'generate_page_template', description: 'Generate page' },
      ],
    }),
    callTool: vi.fn().mockResolvedValue({
      content: [{ type: 'text', text: 'generated code' }],
    }),
    onerror: null,
  })),
}));

vi.mock('@modelcontextprotocol/sdk/client/stdio.js', () => ({
  StdioClientTransport: vi.fn().mockImplementation(() => ({
    stderr: { on: vi.fn() },
    close: vi.fn(),
  })),
}));

describe('MCP Server Manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export start and stop functions', async () => {
    const { startMcpServer, stopMcpServer } = await import(
      '../main/mcp-server'
    );
    expect(startMcpServer).toBeDefined();
    expect(stopMcpServer).toBeDefined();
  });
});
