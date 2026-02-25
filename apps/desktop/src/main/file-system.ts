import { dialog, BrowserWindow } from 'electron';
import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join } from 'path';
import type { FileEntry } from '../shared/types';

export async function selectDirectory(
  parent: BrowserWindow
): Promise<string | null> {
  const result = await dialog.showOpenDialog(parent, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select Project Directory',
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
}

export async function readProjectFile(
  filePath: string
): Promise<string> {
  return readFile(filePath, 'utf-8');
}

export async function writeProjectFile(
  filePath: string,
  content: string
): Promise<void> {
  await writeFile(filePath, content, 'utf-8');
}

export async function listDirectoryRecursive(
  dirPath: string,
  depth = 3
): Promise<FileEntry[]> {
  if (depth <= 0) return [];

  const entries = await readdir(dirPath, { withFileTypes: true });
  const result: FileEntry[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') {
      continue;
    }

    const fullPath = join(dirPath, entry.name);
    const fileEntry: FileEntry = {
      name: entry.name,
      path: fullPath,
      isDirectory: entry.isDirectory(),
    };

    if (entry.isDirectory()) {
      fileEntry.children = await listDirectoryRecursive(
        fullPath,
        depth - 1
      );
    }

    result.push(fileEntry);
  }

  return result.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) {
      return a.isDirectory ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}
