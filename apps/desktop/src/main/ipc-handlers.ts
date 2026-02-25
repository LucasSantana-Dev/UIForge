import { ipcMain, BrowserWindow, app } from 'electron';
import { IPC } from '../shared/ipc-channels';
import {
  getMcpClient,
  startMcpServer,
} from './mcp-server';
import {
  selectDirectory,
  readProjectFile,
  writeProjectFile,
  listDirectoryRecursive,
} from './file-system';
import type { OllamaStatus, OllamaModel } from '../shared/types';

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
    async (_e, path: string) => {
      return readProjectFile(path);
    }
  );

  ipcMain.handle(
    IPC.FS_WRITE_FILE,
    async (_e, path: string, content: string) => {
      return writeProjectFile(path, content);
    }
  );

  ipcMain.handle(
    IPC.FS_LIST_DIRECTORY,
    async (_e, path: string) => {
      return listDirectoryRecursive(path);
    }
  );

  ipcMain.handle(IPC.APP_GET_VERSION, () => {
    return app.getVersion();
  });

  ipcMain.handle(
    IPC.STORE_GET,
    async (_e, key: string) => {
      const Store = (await import('electron-store')).default;
      const store = new Store();
      return store.get(key);
    }
  );

  ipcMain.handle(
    IPC.STORE_SET,
    async (_e, key: string, value: unknown) => {
      const Store = (await import('electron-store')).default;
      const store = new Store();
      store.set(key, value);
    }
  );
}
