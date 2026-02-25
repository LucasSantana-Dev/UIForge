export interface McpToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

export interface OllamaStatus {
  running: boolean;
  version?: string;
  models: OllamaModel[];
}

export interface OllamaModel {
  name: string;
  size: number;
  modifiedAt: string;
}

export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileEntry[];
}

export interface AppPreferences {
  ollamaBaseUrl: string;
  ollamaModel: string;
  ollamaEnabled: boolean;
  recentProjects: string[];
  theme: 'dark';
}

export interface SizaApi {
  callTool: (name: string, args: Record<string, unknown>) => Promise<McpToolResult>;
  listTools: () => Promise<Array<{ name: string; description?: string }>>;
  getMcpStatus: () => Promise<{ connected: boolean; toolCount: number }>;

  checkOllama: () => Promise<OllamaStatus>;
  listOllamaModels: () => Promise<OllamaModel[]>;

  selectDirectory: () => Promise<string | null>;
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
  listDirectory: (path: string) => Promise<FileEntry[]>;

  getVersion: () => Promise<string>;
  getPreference: <K extends keyof AppPreferences>(key: K) => Promise<AppPreferences[K]>;
  setPreference: <K extends keyof AppPreferences>(
    key: K,
    value: AppPreferences[K]
  ) => Promise<void>;
}

declare global {
  interface Window {
    siza: SizaApi;
  }
}
