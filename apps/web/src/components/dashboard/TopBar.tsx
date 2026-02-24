'use client';

import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { MenuIcon } from 'lucide-react';
import UserMenu from './UserMenu';
import MobileNav from './MobileNav';

interface TopBarProps {
  user: User;
}

export default function TopBar({ user }: TopBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-surface-0 border-b border-surface-3">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <button
                type="button"
                className="md:hidden -ml-2 mr-2 inline-flex items-center justify-center p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-2"
                onClick={() => setMobileMenuOpen(true)}
                aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
                aria-expanded={mobileMenuOpen}
              >
                <MenuIcon className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-text-primary">Dashboard</h2>
              </div>
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
