'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const SHORTCUTS = [
  { keys: ['⌘', 'K'], description: 'Open command palette' },
  { keys: ['⌘', 'B'], description: 'Toggle sidebar' },
  { keys: ['⌘', 'N'], description: 'New generation' },
  { keys: ['⌘', '1'], description: 'Go to Projects' },
  { keys: ['⌘', '2'], description: 'Go to Templates' },
  { keys: ['⌘', '3'], description: 'Go to History' },
  { keys: ['⌘', '4'], description: 'Go to Settings' },
  { keys: ['⌘', ','], description: 'Open Settings' },
  { keys: ['⌘', '?'], description: 'Show this dialog' },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface-1 border-surface-3">
        <DialogHeader>
          <DialogTitle className="text-text-primary font-display">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-1 mt-2">
          {SHORTCUTS.map((shortcut) => (
            <div key={shortcut.description} className="flex items-center justify-between py-2 px-1">
              <span className="text-sm text-text-secondary">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key) => (
                  <kbd
                    key={key}
                    className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-surface-3 bg-surface-2 px-1.5 text-xs font-mono text-text-muted"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
