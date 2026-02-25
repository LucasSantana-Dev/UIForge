import { describe, it, expect, vi, beforeEach } from 'vitest';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

vi.mock('electron', () => ({
  dialog: {
    showOpenDialog: vi.fn().mockResolvedValue({
      canceled: false,
      filePaths: ['/test/project'],
    }),
  },
  BrowserWindow: vi.fn(),
}));

describe('File System Operations', () => {
  const testDir = join(tmpdir(), 'siza-test-' + Date.now());

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
    await writeFile(join(testDir, 'index.tsx'), 'export default function App() {}');
    await mkdir(join(testDir, 'components'), { recursive: true });
    await writeFile(join(testDir, 'components', 'Button.tsx'), 'export function Button() {}');
  });

  it('should read project files', async () => {
    const { readProjectFile } = await import('../main/file-system');
    const content = await readProjectFile(join(testDir, 'index.tsx'));
    expect(content).toContain('export default function App');
  });

  it('should write files to disk', async () => {
    const { writeProjectFile, readProjectFile } = await import('../main/file-system');
    const filePath = join(testDir, 'NewComponent.tsx');
    await writeProjectFile(filePath, 'export function New() {}');
    const content = await readProjectFile(filePath);
    expect(content).toBe('export function New() {}');
  });

  it('should list directory recursively', async () => {
    const { listDirectoryRecursive } = await import('../main/file-system');
    const entries = await listDirectoryRecursive(testDir);
    expect(entries.length).toBeGreaterThan(0);
    const names = entries.map((e) => e.name);
    expect(names).toContain('components');
    expect(names).toContain('index.tsx');
  });
});
