'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CONTAINER } from './constants';

interface LandingNavProps {
  user: { id: string } | null;
}

export function LandingNav({ user }: LandingNavProps) {
  const [isScrolled, setIsScrolled] = useState(
    () => typeof window !== 'undefined' && window.scrollY > 0
  );

  useEffect(() => {
    let rafId = 0;
    const handleScroll = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 0);
          rafId = 0;
        });
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const navLinks = [
    { label: 'Platform', href: '/generate' },
    { label: 'Ecosystem', href: '#ecosystem' },
    { label: 'Docs', href: '/docs' },
    { label: 'Dashboard', href: '/generate' },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 h-16 border-b border-[#27272A] transition-all duration-200 ${
        isScrolled ? 'backdrop-blur-xl bg-[#121214]/80' : 'bg-transparent'
      }`}
    >
      <div className={`${CONTAINER} h-full flex items-center justify-between`}>
        <Link href="/" className="flex items-center gap-2">
          <Image src="/siza-icon.png" alt="Siza" width={24} height={24} priority />
          <span className="font-display font-bold text-lg">siza</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/generate"
              className="bg-[#7C3AED] hover:bg-[#8B5CF6] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/signin"
                className="hidden sm:inline-block text-sm text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors px-4 py-2"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="bg-[#7C3AED] hover:bg-[#8B5CF6] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            </>
          )}

          <Sheet>
            <SheetTrigger
              aria-label="Open menu"
              className="md:hidden p-2 text-[#A1A1AA] hover:text-[#FAFAFA]"
            >
              <Menu size={20} />
            </SheetTrigger>
            <SheetContent className="bg-[#121214] border-[#27272A]">
              <SheetTitle className="font-display text-lg mb-6">Menu</SheetTitle>
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors py-2"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
