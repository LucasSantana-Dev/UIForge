'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/stores/ui-store';

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  if (target.isContentEditable) return true;
  if (target.closest('.monaco-editor')) return true;
  return false;
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette);
  const toggleSidebarCollapsed = useUIStore((s) => s.toggleSidebarCollapsed);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      if (e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      if (isEditableTarget(e.target)) return;

      if (e.key === 'b') {
        e.preventDefault();
        toggleSidebarCollapsed();
        return;
      }

      const navMap: Record<string, string> = {
        '1': '/projects',
        '2': '/templates',
        '3': '/history',
        '4': '/settings',
      };
      if (navMap[e.key]) {
        e.preventDefault();
        router.push(navMap[e.key]);
        return;
      }

      if (e.key === 'n') {
        e.preventDefault();
        router.push('/generate');
        return;
      }

      if (e.key === ',') {
        e.preventDefault();
        router.push('/settings');
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, toggleCommandPalette, toggleSidebarCollapsed]);
}
