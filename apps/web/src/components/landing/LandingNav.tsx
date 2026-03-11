import Image from 'next/image';
import { CONTAINER } from './constants';

export function LandingNav() {
  const navLinks = [
    { label: 'Platform', href: '#capabilities' },
    { label: 'Ecosystem', href: '#ecosystem' },
    { label: 'Docs', href: '/docs' },
    { label: 'Dashboard', href: '#preview' },
  ];

  return (
    <nav className="sticky top-0 z-50 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className={`${CONTAINER} h-full flex items-center justify-between`}>
        <a href="/" className="flex items-center gap-2">
          <Image src="/monogram.svg" alt="Siza" width={24} height={24} priority />
          <span className="font-display font-bold text-lg">siza</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/signin"
            className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
          >
            Sign in
          </a>
          <a
            href="/signup"
            className="bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors shadow-[0_0_16px_rgba(139,92,246,0.25)]"
          >
            Get Started
          </a>

          <details className="relative md:hidden">
            <summary
              aria-label="Open menu"
              className="list-none p-2 text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden"
            >
              <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                <path
                  d="M3 5h14M3 10h14M3 15h14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </summary>
            <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-background p-3 shadow-card">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-violet-500/8 hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </details>
        </div>
      </div>
    </nav>
  );
}
