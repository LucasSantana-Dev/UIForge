import { ipcMain, BrowserWindow, app } from 'electron';
import { IPC } from '../shared/ipc-channels';
import { getMcpClient } from './mcp-server';
import {
  selectDirectory,
  readProjectFile,
  writeProjectFile,
  listDirectoryRecursive,
} from './file-system';
import { resolve, normalize, relative } from 'path';
import type { OllamaStatus, OllamaModel } from '../shared/types';

function validateFilePath(filePath: string): string {
  const normalized = normalize(resolve(filePath));
  const home = process.env.HOME || process.env.USERPROFILE || '';
  if (!home) {
    throw new Error('Unable to determine home directory');
  }
  const rel = relative(home, normalized);
  if (rel.startsWith('..') || resolve(rel) === rel) {
    throw new Error('Access denied: path outside home directory');
  }
  return normalized;
}

const OLLAMA_BASE = 'http://localhost:11434';

export function registerIpcHandlers(mainWindow: BrowserWindow) {
  ipcMain.handle(
    IPC.MCP_CALL_TOOL,
    async (_e, name: string, args: Record<string, unknown>) => {
      const client = await getMcpClient();
      if (!client) throw new Error('MCP server not connected');
      return client.callTool({ name, arguments: args });
    }
  );

  ipcMain.handle(IPC.MCP_LIST_TOOLS, async () => {
    const client = await getMcpClient();
    if (!client) return [];
    const result = await client.listTools();
    return result.tools.map((t) => ({
      name: t.name,
      description: t.description,
    }));
  });

  ipcMain.handle(IPC.MCP_STATUS, async () => {
    const client = await getMcpClient();
    if (!client) return { connected: false, toolCount: 0 };
    try {
      const result = await client.listTools();
      return { connected: true, toolCount: result.tools.length };
    } catch {
      return { connected: false, toolCount: 0 };
    }
  });

  ipcMain.handle(IPC.OLLAMA_CHECK, async (): Promise<OllamaStatus> => {
    try {
      const res = await fetch(`${OLLAMA_BASE}/api/version`);
      if (!res.ok) return { running: false, models: [] };
      const data = await res.json();
      const modelsRes = await fetch(`${OLLAMA_BASE}/api/tags`);
      const modelsData = await modelsRes.json();
      return {
        running: true,
        version: data.version,
        models: (modelsData.models || []).map((m: any) => ({
          name: m.name,
          size: m.size,
          modifiedAt: m.modified_at,
        })),
      };
    } catch {
      return { running: false, models: [] };
    }
  });

  ipcMain.handle(
    IPC.OLLAMA_LIST_MODELS,
    async (): Promise<OllamaModel[]> => {
      try {
        const res = await fetch(`${OLLAMA_BASE}/api/tags`);
        const data = await res.json();
        return (data.models || []).map((m: any) => ({
          name: m.name,
          size: m.size,
          modifiedAt: m.modified_at,
        }));
      } catch {
        return [];
      }
    }
  );

  ipcMain.handle(IPC.FS_SELECT_DIRECTORY, async () => {
    return selectDirectory(mainWindow);
  });

  ipcMain.handle(
    IPC.FS_READ_FILE,
    async (_e, filePath: string) => {
      return readProjectFile(validateFilePath(filePath));
    }
  );

  ipcMain.handle(
    IPC.FS_WRITE_FILE,
    async (_e, filePath: string, content: string) => {
      return writeProjectFile(validateFilePath(filePath), content);
    }
  );

  ipcMain.handle(
    IPC.FS_LIST_DIRECTORY,
    async (_e, dirPath: string) => {
      return listDirectoryRecursive(validateFilePath(dirPath));
    }
  );

  ipcMain.handle(IPC.APP_GET_VERSION, () => {
    return app.getVersion();
  });

  let storeInstance: InstanceType<typeof import('electron-store').default> | null = null;
  async function getStore() {
    if (!storeInstance) {
      const Store = (await import('electron-store')).default;
      storeInstance = new Store();
    }
    return storeInstance;
  }

  ipcMain.handle(
    IPC.STORE_GET,
    async (_e, key: string) => {
      const s = await getStore();
      return s.get(key);
    }
  );

  ipcMain.handle(
    IPC.STORE_SET,
    async (_e, key: string, value: unknown) => {
      const s = await getStore();
      s.set(key, value);
    }
  );
}
