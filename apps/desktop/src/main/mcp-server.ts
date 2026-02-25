import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { app } from 'electron';

let client: Client | null = null;
let transport: StdioClientTransport | null = null;

function getMcpServerPath(): string {
  if (process.env.SIZA_MCP_PATH) {
    return process.env.SIZA_MCP_PATH;
  }

  if (app.isPackaged) {
    return resolve(process.resourcesPath, 'mcp-server', 'dist', 'index.js');
  }

  const projectRoot = resolve(__dirname, '..', '..', '..', '..');
  const siblingRepo = resolve(projectRoot, '..', 'siza-mcp', 'dist', 'index.js');
  if (existsSync(siblingRepo)) {
    return siblingRepo;
  }

  return resolve(projectRoot, 'node_modules', '@siza', 'mcp-server', 'dist', 'index.js');
}

export async function startMcpServer(): Promise<Client> {
  if (client) return client;

  const serverPath = getMcpServerPath();
  console.log('[mcp] Server path:', serverPath);

  if (!existsSync(serverPath)) {
    console.error('[mcp] Server not found at:', serverPath);
    throw new Error(`MCP server not found at ${serverPath}. Run "npm run build" in siza-mcp first.`);
  }

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
  console.log('[mcp] Connected successfully');
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
