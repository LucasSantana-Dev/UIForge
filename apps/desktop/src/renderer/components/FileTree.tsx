import { useState } from 'react';
import {
  FolderIcon,
  FileIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  FileCodeIcon,
  FileTextIcon,
  ImageIcon,
} from 'lucide-react';
import type { FileEntry } from '../../shared/types';

function getFileIcon(name: string) {
  if (/\.(tsx?|jsx?)$/.test(name)) return FileCodeIcon;
  if (/\.(md|txt|json)$/.test(name)) return FileTextIcon;
  if (/\.(png|jpg|svg|webp)$/.test(name)) return ImageIcon;
  return FileIcon;
}

interface FileTreeNodeProps {
  entry: FileEntry;
  depth?: number;
  onSelect?: (entry: FileEntry) => void;
}

function FileTreeNode({
  entry,
  depth = 0,
  onSelect,
}: FileTreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 1);
  const Icon = entry.isDirectory
    ? FolderIcon
    : getFileIcon(entry.name);

  if (!entry.isDirectory) {
    return (
      <button
        onClick={() => onSelect?.(entry)}
        className="flex items-center gap-2 py-1 px-2 text-sm text-text-secondary hover:bg-surface-2 rounded w-full text-left"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <Icon className="w-4 h-4 text-text-muted shrink-0" />
        <span className="truncate">{entry.name}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 py-1 px-2 text-sm text-text-primary hover:bg-surface-2 rounded w-full text-left"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {expanded ? (
          <ChevronDownIcon className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <ChevronRightIcon className="w-3.5 h-3.5 shrink-0" />
        )}
        <FolderIcon className="w-4 h-4 text-brand shrink-0" />
        <span className="truncate">{entry.name}</span>
      </button>
      {expanded && entry.children && (
        <div>
          {entry.children.map((child) => (
            <FileTreeNode
              key={child.path}
              entry={child}
              depth={depth + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FileTreeProps {
  files: FileEntry[];
  onSelect?: (entry: FileEntry) => void;
}

export function FileTree({ files, onSelect }: FileTreeProps) {
  return (
    <div className="text-sm">
      {files.map((entry) => (
        <FileTreeNode
          key={entry.path}
          entry={entry}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
