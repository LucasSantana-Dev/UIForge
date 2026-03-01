'use client';

import type { User } from '@supabase/supabase-js';
import { MenuIcon, SearchIcon, ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import UserMenu from './UserMenu';
import MobileNav from './MobileNav';
import { usePageMeta } from '@/hooks/use-page-meta';
import { useUIStore } from '@/stores/ui-store';
import { useState } from 'react';

interface TopBarProps {
  user: User;
}

export default function TopBar({ user }: TopBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { title, icon: PageIcon, breadcrumbs } = usePageMeta();
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);

  return (
    <>
      <header className="bg-surface-0 border-b border-surface-3" role="banner">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="md:hidden -ml-2 inline-flex items-center justify-center p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors focus-visible:shadow-glow-focus"
                onClick={() => setMobileMenuOpen(true)}
                aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
                aria-expanded={mobileMenuOpen}
              >
                <MenuIcon className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden md:flex items-center gap-2 bg-surface-2 rounded-lg px-3 h-8 text-text-muted text-sm hover:bg-surface-3 hover:text-text-secondary transition-colors"
              >
                <SearchIcon className="h-3.5 w-3.5" />
                <span>Search...</span>
                <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-surface-3 bg-surface-1 px-1.5 font-mono text-[10px] font-medium text-text-muted">
                  ⌘K
                </kbd>
              </button>

              <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1">
                {breadcrumbs.map((crumb, i) => (
                  <span key={crumb.href} className="flex items-center gap-1">
                    {i > 0 && <ChevronRightIcon className="h-3 w-3 text-text-muted" />}
                    {i === breadcrumbs.length - 1 ? (
                      <span className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
                        {i === breadcrumbs.length - 1 && PageIcon && (
                          <PageIcon className="h-4 w-4 text-text-muted" />
                        )}
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="text-sm text-text-muted hover:text-text-secondary transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </span>
                ))}
              </nav>

              <h2 className="md:hidden text-lg font-semibold text-text-primary">{title}</h2>
            </div>
            <div className="flex items-center space-x-4">
              <UserMenu user={user} />
            </div>
          </div>
        </div>
      </header>
      <MobileNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
