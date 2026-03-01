'use client';

import { usePathname } from 'next/navigation';
import {
  FolderIcon,
  FileTextIcon,
  PlusIcon,
  ClockIcon,
  SettingsIcon,
  CreditCardIcon,
  KeyIcon,
  LayoutDashboardIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface PageMeta {
  title: string;
  icon?: LucideIcon;
}

const PAGE_META: Record<string, PageMeta> = {
  '/dashboard': { title: 'Dashboard', icon: LayoutDashboardIcon },
  '/projects': { title: 'Projects', icon: FolderIcon },
  '/templates': { title: 'Templates', icon: FileTextIcon },
  '/generate': { title: 'Generator', icon: PlusIcon },
  '/history': { title: 'History', icon: ClockIcon },
  '/settings': { title: 'Settings', icon: SettingsIcon },
  '/billing': { title: 'Billing', icon: CreditCardIcon },
  '/ai-keys': { title: 'AI Keys', icon: KeyIcon },
};

interface Breadcrumb {
  label: string;
  href: string;
}

interface PageMetaResult {
  title: string;
  icon?: LucideIcon;
  breadcrumbs: Breadcrumb[];
}

export function usePageMeta(): PageMetaResult {
  const pathname = usePathname();

  const matchedKey = Object.keys(PAGE_META).find((key) =>
    pathname.startsWith(key),
  );
  const meta = matchedKey ? PAGE_META[matchedKey] : null;

  const breadcrumbs: Breadcrumb[] = [{ label: 'Home', href: '/dashboard' }];

  if (meta && matchedKey !== '/dashboard') {
    breadcrumbs.push({ label: meta.title, href: matchedKey });
  }

  const segments = pathname.split('/').filter(Boolean);
  if (matchedKey && segments.length > 1) {
    const remaining = segments.slice(1);
    for (let i = 0; i < remaining.length; i++) {
      const seg = remaining[i];
      const href = '/' + segments.slice(0, i + 2).join('/');
      const label = seg
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      breadcrumbs.push({ label, href });
    }
  }

  return {
    title: meta?.title ?? 'Dashboard',
    icon: meta?.icon,
    breadcrumbs,
  };
}
