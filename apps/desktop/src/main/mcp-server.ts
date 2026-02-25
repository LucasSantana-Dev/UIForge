import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { resolve } from 'path';
import { app } from 'electron';

let client: Client | null = null;
let transport: StdioClientTransport | null = null;

function getMcpServerPath(): string {
  if (app.isPackaged) {
    return resolve(process.resourcesPath, 'mcp-server', 'dist', 'index.js');
  }
  return resolve(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    'node_modules',
    '@siza/mcp-server',
    'dist',
    'index.js'
  );
}

export async function startMcpServer(): Promise<Client> {
  if (client) return client;

  const serverPath = getMcpServerPath();

  client = new Client({ name: 'siza-desktop', version: app.getVersion() }, { capabilities: {} });

  transport = new StdioClientTransport({
    command: 'node',
    args: [serverPath],
    env: {
      ...process.env,
      NODE_ENV: 'production',
      LOG_LEVEL: 'info',
    },
    stderr: 'pipe',
  });

  transport.stderr?.on('data', (chunk: Buffer) => {
    console.error('[mcp-server]', chunk.toString().trim());
  });

  client.onerror = (error) => {
    console.error('MCP client error:', error);
  };

  await client.connect(transport);
  return client;
}

export async function getMcpClient(): Promise<Client | null> {
  return client;
}

export async function stopMcpServer(): Promise<void> {
  if (transport) {
    await transport.close();
    transport = null;
  }
  client = null;
}
