'use client';

import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { CommandPalette } from './CommandPalette';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts();
  return (
    <>
      <CommandPalette />
      {children}
    </>
  );
}
