'use client';

import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts();
  return <>{children}</>;
}
