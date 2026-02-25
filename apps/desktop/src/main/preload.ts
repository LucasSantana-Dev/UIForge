import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '../shared/ipc-channels';
import type { SizaApi } from '../shared/types';

const api: SizaApi = {
  callTool: (name, args) => ipcRenderer.invoke(IPC.MCP_CALL_TOOL, name, args),
  listTools: () => ipcRenderer.invoke(IPC.MCP_LIST_TOOLS),
  getMcpStatus: () => ipcRenderer.invoke(IPC.MCP_STATUS),

  checkOllama: () => ipcRenderer.invoke(IPC.OLLAMA_CHECK),
  listOllamaModels: () => ipcRenderer.invoke(IPC.OLLAMA_LIST_MODELS),

  selectDirectory: () => ipcRenderer.invoke(IPC.FS_SELECT_DIRECTORY),
  readFile: (path) => ipcRenderer.invoke(IPC.FS_READ_FILE, path),
  writeFile: (path, content) => ipcRenderer.invoke(IPC.FS_WRITE_FILE, path, content),
  listDirectory: (path) => ipcRenderer.invoke(IPC.FS_LIST_DIRECTORY, path),

  getVersion: () => ipcRenderer.invoke(IPC.APP_GET_VERSION),
  getPreference: (key) => ipcRenderer.invoke(IPC.STORE_GET, key),
  setPreference: (key, value) => ipcRenderer.invoke(IPC.STORE_SET, key, value),
};

contextBridge.exposeInMainWorld('siza', api);
