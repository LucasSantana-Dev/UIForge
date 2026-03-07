'use client';

import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { getDashboardPages } from '@/components/dashboard/navigation';

interface PageMeta {
  title: string;
  icon?: LucideIcon;
}

interface Breadcrumb {
  label: string;
  href: string;
}

interface PageMetaResult {
  title: string;
  icon?: LucideIcon;
  breadcrumbs: Breadcrumb[];
}

export function usePageMeta(isAdmin = false): PageMetaResult {
  const pathname = usePathname();
  const dashboardPages = getDashboardPages(isAdmin);

  const matched = dashboardPages.find((page) => pathname.startsWith(page.href));
  const matchedKey = matched?.href ?? null;
  const meta: PageMeta | null = matched ? { title: matched.name, icon: matched.icon } : null;

  const breadcrumbs: Breadcrumb[] = [{ label: 'Home', href: '/dashboard' }];

  if (meta && matchedKey && matchedKey !== '/dashboard') {
    breadcrumbs.push({ label: meta.title, href: matchedKey });
  }

  const segments = pathname.split('/').filter(Boolean);
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (matchedKey && segments.length > 1) {
    const remaining = segments.slice(1);
    for (let i = 0; i < remaining.length; i++) {
      const seg = remaining[i];
      const href = '/' + segments.slice(0, i + 2).join('/');
      if (uuidPattern.test(seg)) continue;
      const label = seg.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      breadcrumbs.push({ label, href });
    }
  }

  return {
    title: meta?.title ?? 'Dashboard',
    icon: meta?.icon,
    breadcrumbs,
  };
}
