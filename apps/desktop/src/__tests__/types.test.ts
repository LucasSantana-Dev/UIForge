import { describe, it, expect } from 'vitest';
import type { McpToolResult, OllamaStatus, FileEntry, AppPreferences } from '../shared/types';

describe('Shared Types', () => {
  it('should have correct McpToolResult shape', () => {
    const result: McpToolResult = {
      content: [{ type: 'text', text: 'hello' }],
    };
    expect(result.content[0].type).toBe('text');
  });

  it('should have correct OllamaStatus shape', () => {
    const status: OllamaStatus = {
      running: true,
      version: '0.1.0',
      models: [{ name: 'codellama:7b', size: 3800000000, modifiedAt: '2024-01-01' }],
    };
    expect(status.running).toBe(true);
    expect(status.models).toHaveLength(1);
  });

  it('should have correct FileEntry shape', () => {
    const entry: FileEntry = {
      name: 'src',
      path: '/project/src',
      isDirectory: true,
      children: [{ name: 'index.ts', path: '/project/src/index.ts', isDirectory: false }],
    };
    expect(entry.isDirectory).toBe(true);
    expect(entry.children).toHaveLength(1);
  });

  it('should have correct AppPreferences defaults', () => {
    const prefs: AppPreferences = {
      ollamaBaseUrl: 'http://localhost:11434',
      ollamaModel: 'codellama:7b',
      ollamaEnabled: false,
      recentProjects: [],
      theme: 'dark',
    };
    expect(prefs.theme).toBe('dark');
  });
});
