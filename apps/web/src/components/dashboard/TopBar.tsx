'use client';

import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { MenuIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import UserMenu from './UserMenu';
import MobileNav from './MobileNav';

interface TopBarProps {
  user: User;
}

export default function TopBar({ user }: TopBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!mounted) {
      setTimeout(() => setMounted(true), 0);
    }
  }, []);

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <button
                type="button"
                className="md:hidden -ml-2 mr-2 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(true)}
                aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
                aria-expanded={mobileMenuOpen}
              >
                <MenuIcon className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                aria-label="Toggle theme"
              >
                {mounted && theme === 'dark' ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>
              <UserMenu user={user} />
            </div>
          </div>
        </div>
      </header>
      <MobileNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
