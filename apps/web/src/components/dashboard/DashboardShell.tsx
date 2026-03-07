'use client';

import { useState } from 'react';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { CommandPalette } from './CommandPalette';
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  useKeyboardShortcuts({ onShowShortcuts: () => setShortcutsOpen(true) });
  return (
    <>
      <CommandPalette />
      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      {children}
    </>
  );
}
