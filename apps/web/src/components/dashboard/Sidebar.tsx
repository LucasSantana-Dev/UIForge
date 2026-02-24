'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FolderIcon,
  FileTextIcon,
  SettingsIcon,
  PlusIcon,
  KeyIcon,
  CreditCardIcon,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Projects', href: '/projects', icon: FolderIcon },
  { name: 'Templates', href: '/templates', icon: FileTextIcon },
  { name: 'AI Keys', href: '/ai-keys', icon: KeyIcon },
  { name: 'Billing', href: '/billing', icon: CreditCardIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-surface-0 border-r border-surface-3 overflow-y-auto">
        <Link
          href="/dashboard"
          className="flex items-center flex-shrink-0 px-4 gap-3 hover:opacity-80 transition-opacity"
        >
          <Image src="/siza-icon.png" alt="Siza" width={32} height={32} className="flex-shrink-0" />
          <h1 className="text-xl font-display font-bold text-text-primary">Siza</h1>
        </Link>
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            <Button asChild className="w-full justify-start mb-4">
              <Link href="/generate">
                <PlusIcon className="mr-2 h-4 w-4" />
                Generate Component
              </Link>
            </Button>
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Button
                  key={item.name}
                  asChild
                  variant="ghost"
                  className={`w-full justify-start ${isActive ? 'bg-brand/15 text-brand-light hover:bg-brand/20 hover:text-brand-light' : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'}`}
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
