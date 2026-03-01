'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  SearchIcon,
  PlusIcon,
  FileTextIcon,
  FolderIcon,
  ClockIcon,
  SettingsIcon,
  CreditCardIcon,
  KeyIcon,
  LayoutDashboardIcon,
  BarChart3Icon,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';

interface CommandItem {
  label: string;
  icon: React.ElementType;
  href: string;
  shortcut?: string;
  group: 'actions' | 'pages';
}

const items: CommandItem[] = [
  { label: 'New Generation', icon: PlusIcon, href: '/generate', shortcut: '⌘N', group: 'actions' },
  { label: 'Browse Templates', icon: FileTextIcon, href: '/templates', group: 'actions' },
  { label: 'View Analytics', icon: BarChart3Icon, href: '/projects', group: 'actions' },
  { label: 'Dashboard', icon: LayoutDashboardIcon, href: '/dashboard', group: 'pages' },
  { label: 'Projects', icon: FolderIcon, href: '/projects', shortcut: '⌘1', group: 'pages' },
  { label: 'Templates', icon: FileTextIcon, href: '/templates', shortcut: '⌘2', group: 'pages' },
  { label: 'History', icon: ClockIcon, href: '/history', shortcut: '⌘3', group: 'pages' },
  { label: 'Settings', icon: SettingsIcon, href: '/settings', shortcut: '⌘4', group: 'pages' },
  { label: 'AI Keys', icon: KeyIcon, href: '/ai-keys', group: 'pages' },
  { label: 'Billing', icon: CreditCardIcon, href: '/billing', group: 'pages' },
];

export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen);
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const router = useRouter();

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router, setOpen],
  );

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    return () => {
      prev?.focus();
    };
  }, [open]);

  if (!open) return null;

  const actions = items.filter((i) => i.group === 'actions');
  const pages = items.filter((i) => i.group === 'pages');

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-150"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div className="fixed inset-x-0 top-[20vh] mx-auto max-w-lg px-4">
        <Command
          className="rounded-xl border border-surface-3 bg-surface-1 shadow-2xl overflow-hidden"
          loop
        >
          <div className="flex items-center border-b border-surface-3 px-3">
            <SearchIcon className="mr-2 h-4 w-4 shrink-0 text-text-muted" />
            <Command.Input
              placeholder="Type a command or search..."
              className="flex h-12 w-full bg-transparent py-3 text-sm text-text-primary outline-none placeholder:text-text-muted"
              {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
              autoFocus
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-text-muted">
              No results found.
            </Command.Empty>
            <Command.Group
              heading="Quick Actions"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-muted [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
            >
              {actions.map((item) => (
                <Command.Item
                  key={item.label}
                  value={item.label}
                  onSelect={() => handleSelect(item.href)}
                  className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-2 text-sm text-text-secondary outline-none data-[selected=true]:bg-brand/10 data-[selected=true]:text-brand-light hover:bg-surface-2 transition-colors"
                >
                  <item.icon className="mr-3 h-4 w-4 text-text-muted" />
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <span className="ml-auto text-xs text-text-muted opacity-60">
                      {item.shortcut}
                    </span>
                  )}
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Separator className="mx-2 my-1 h-px bg-surface-3" />
            <Command.Group
              heading="Pages"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-muted [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
            >
              {pages.map((item) => (
                <Command.Item
                  key={item.label}
                  value={item.label}
                  onSelect={() => handleSelect(item.href)}
                  className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-2 text-sm text-text-secondary outline-none data-[selected=true]:bg-brand/10 data-[selected=true]:text-brand-light hover:bg-surface-2 transition-colors"
                >
                  <item.icon className="mr-3 h-4 w-4 text-text-muted" />
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <span className="ml-auto text-xs text-text-muted opacity-60">
                      {item.shortcut}
                    </span>
                  )}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
