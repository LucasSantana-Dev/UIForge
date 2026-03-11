'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CONTAINER } from './constants';

export function LandingNav() {
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
    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const navLinks = [
    { label: 'About', href: '/about' },
    { label: 'Roadmap', href: '/roadmap' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Docs', href: '/docs' },
    { label: 'Gallery', href: '/gallery' },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 h-16 border-b transition-all duration-300 ${
        isScrolled
          ? 'backdrop-blur-xl bg-background/80 border-border shadow-[0_1px_3px_rgba(0,0,0,0.3)]'
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className={`${CONTAINER} h-full flex items-center justify-between`}>
        <Link href="/" className="flex items-center gap-2">
          <Image src="/monogram.svg" alt="Siza" width={24} height={24} priority />
          <span className="font-display font-bold text-lg">siza</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/signin"
            className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors shadow-[0_0_16px_rgba(139,92,246,0.25)]"
          >
            Get Started
          </Link>

          <Sheet>
            <SheetTrigger
              aria-label="Open menu"
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            >
              <Menu size={20} />
            </SheetTrigger>
            <SheetContent className="bg-background border-border">
              <SheetTitle className="font-display text-lg mb-6">Menu</SheetTitle>
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors py-2"
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
