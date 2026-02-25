export const IPC = {
  MCP_CALL_TOOL: 'mcp:call-tool',
  MCP_LIST_TOOLS: 'mcp:list-tools',
  MCP_STATUS: 'mcp:status',

  OLLAMA_CHECK: 'ollama:check',
  OLLAMA_LIST_MODELS: 'ollama:list-models',

  FS_SELECT_DIRECTORY: 'fs:select-directory',
  FS_READ_FILE: 'fs:read-file',
  FS_WRITE_FILE: 'fs:write-file',
  FS_LIST_DIRECTORY: 'fs:list-directory',

  APP_GET_VERSION: 'app:get-version',
  STORE_GET: 'store:get',
  STORE_SET: 'store:set',
} as const;

export type IpcChannel = (typeof IPC)[keyof typeof IPC];
