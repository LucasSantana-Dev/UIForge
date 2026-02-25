import { describe, it, expect } from 'vitest';
import { IPC } from '../shared/ipc-channels';

describe('IPC Channels', () => {
  it('should define all required channels', () => {
    expect(IPC.MCP_CALL_TOOL).toBe('mcp:call-tool');
    expect(IPC.MCP_LIST_TOOLS).toBe('mcp:list-tools');
    expect(IPC.MCP_STATUS).toBe('mcp:status');
    expect(IPC.OLLAMA_CHECK).toBe('ollama:check');
    expect(IPC.OLLAMA_LIST_MODELS).toBe('ollama:list-models');
    expect(IPC.FS_SELECT_DIRECTORY).toBe('fs:select-directory');
    expect(IPC.FS_READ_FILE).toBe('fs:read-file');
    expect(IPC.FS_WRITE_FILE).toBe('fs:write-file');
    expect(IPC.FS_LIST_DIRECTORY).toBe('fs:list-directory');
    expect(IPC.APP_GET_VERSION).toBe('app:get-version');
    expect(IPC.STORE_GET).toBe('store:get');
    expect(IPC.STORE_SET).toBe('store:set');
  });

  it('should have unique channel names', () => {
    const values = Object.values(IPC);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });
});
