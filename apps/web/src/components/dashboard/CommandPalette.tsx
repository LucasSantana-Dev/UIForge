'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  RocketIcon,
  BookOpenIcon,
  LayersIcon,
  LoaderIcon,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';

interface CommandItem {
  label: string;
  icon: React.ElementType;
  href: string;
  shortcut?: string;
  group: 'actions' | 'pages';
}

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'project' | 'catalog' | 'golden-path' | 'template';
  href: string;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  project: FolderIcon,
  catalog: LayersIcon,
  'golden-path': RocketIcon,
  template: FileTextIcon,
};

const TYPE_LABELS: Record<string, string> = {
  project: 'Projects',
  catalog: 'Catalog',
  'golden-path': 'Golden Paths',
  template: 'Templates',
};

const items: CommandItem[] = [
  { label: 'New Generation', icon: PlusIcon, href: '/generate', shortcut: '⌘N', group: 'actions' },
  { label: 'Browse Templates', icon: FileTextIcon, href: '/templates', group: 'actions' },
  { label: 'View Catalog', icon: BookOpenIcon, href: '/catalog', group: 'actions' },
  { label: 'Golden Paths', icon: RocketIcon, href: '/golden-paths', group: 'actions' },
  { label: 'Dashboard', icon: LayoutDashboardIcon, href: '/dashboard', group: 'pages' },
  { label: 'Projects', icon: FolderIcon, href: '/projects', shortcut: '⌘1', group: 'pages' },
  { label: 'Templates', icon: FileTextIcon, href: '/templates', shortcut: '⌘2', group: 'pages' },
  { label: 'History', icon: ClockIcon, href: '/history', shortcut: '⌘3', group: 'pages' },
  { label: 'Settings', icon: SettingsIcon, href: '/settings', shortcut: '⌘4', group: 'pages' },
  { label: 'AI Keys', icon: KeyIcon, href: '/ai-keys', group: 'pages' },
  { label: 'Billing', icon: CreditCardIcon, href: '/billing', group: 'pages' },
];

const GROUP_HEADING_CLASS =
  '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-muted-foreground [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider';

const ITEM_CLASS =
  'relative flex cursor-pointer select-none items-center rounded-lg px-2 py-2 text-sm text-text-secondary outline-none data-[selected=true]:bg-brand/10 data-[selected=true]:text-brand-light hover:bg-surface-2 transition-colors';

export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen);
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery('');
      setResults([]);
      router.push(href);
    },
    [router, setOpen]
  );

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      return;
    }
    const prev = document.activeElement as HTMLElement | null;
    return () => {
      prev?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const json = await res.json();
          setResults(json.results || []);
        }
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  if (!open) return null;

  const actions = items.filter((i) => i.group === 'actions');
  const pages = items.filter((i) => i.group === 'pages');
  const hasResults = results.length > 0;
  const showStatic = query.length < 2;

  const resultsByType = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.type] ??= []).push(r);
    return acc;
  }, {});

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
          shouldFilter={showStatic}
        >
          <div className="flex items-center border-b border-surface-3 px-3">
            {searching ? (
              <LoaderIcon className="mr-2 h-4 w-4 shrink-0 text-text-muted-foreground animate-spin" />
            ) : (
              <SearchIcon className="mr-2 h-4 w-4 shrink-0 text-text-muted-foreground" />
            )}
            {/* eslint-disable jsx-a11y/no-autofocus */}
            <Command.Input
              placeholder="Search projects, catalog, templates..."
              className="flex h-12 w-full bg-transparent py-3 text-sm text-text-primary outline-none placeholder:text-text-muted-foreground"
              autoFocus
              value={query}
              onValueChange={setQuery}
            />
            {/* eslint-enable jsx-a11y/no-autofocus */}
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-text-muted-foreground">
              {searching ? 'Searching...' : 'No results found.'}
            </Command.Empty>

            {hasResults &&
              Object.entries(resultsByType).map(([type, items]) => {
                const Icon = TYPE_ICONS[type] || FileTextIcon;
                return (
                  <Command.Group
                    key={type}
                    heading={TYPE_LABELS[type] || type}
                    className={GROUP_HEADING_CLASS}
                  >
                    {items.map((r) => (
                      <Command.Item
                        key={r.id}
                        value={`${r.title} ${r.subtitle || ''}`}
                        onSelect={() => handleSelect(r.href)}
                        className={ITEM_CLASS}
                      >
                        <Icon className="mr-3 h-4 w-4 text-text-muted-foreground" />
                        <div className="flex flex-col">
                          <span>{r.title}</span>
                          {r.subtitle && (
                            <span className="text-[11px] text-text-muted">{r.subtitle}</span>
                          )}
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                );
              })}

            {showStatic && (
              <>
                <Command.Group heading="Quick Actions" className={GROUP_HEADING_CLASS}>
                  {actions.map((item) => (
                    <Command.Item
                      key={item.label}
                      value={item.label}
                      onSelect={() => handleSelect(item.href)}
                      className={ITEM_CLASS}
                    >
                      <item.icon className="mr-3 h-4 w-4 text-text-muted-foreground" />
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="ml-auto text-xs text-text-muted-foreground opacity-60">
                          {item.shortcut}
                        </span>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
                <Command.Separator className="mx-2 my-1 h-px bg-surface-3" />
                <Command.Group heading="Pages" className={GROUP_HEADING_CLASS}>
                  {pages.map((item) => (
                    <Command.Item
                      key={item.label}
                      value={item.label}
                      onSelect={() => handleSelect(item.href)}
                      className={ITEM_CLASS}
                    >
                      <item.icon className="mr-3 h-4 w-4 text-text-muted-foreground" />
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="ml-auto text-xs text-text-muted-foreground opacity-60">
                          {item.shortcut}
                        </span>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              </>
            )}
          </Command.List>
          <div className="border-t border-surface-3 px-3 py-2 flex items-center justify-between text-[11px] text-text-muted">
            <span>↑↓ Navigate · ↵ Select · Esc Close</span>
            <span className="text-text-muted-foreground">⌘K</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
