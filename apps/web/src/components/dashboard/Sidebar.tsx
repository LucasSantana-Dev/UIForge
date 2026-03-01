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
  ClockIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@siza/ui';
import { useUIStore } from '@/stores/ui-store';

const navigation = [
  { name: 'Projects', href: '/projects', icon: FolderIcon, shortcut: '⌘1' },
  { name: 'Templates', href: '/templates', icon: FileTextIcon, shortcut: '⌘2' },
  { name: 'History', href: '/history', icon: ClockIcon, shortcut: '⌘3' },
  { name: 'AI Keys', href: '/ai-keys', icon: KeyIcon },
  { name: 'Billing', href: '/billing', icon: CreditCardIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon, shortcut: '⌘4' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleCollapsed = useUIStore((s) => s.toggleSidebarCollapsed);

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={`hidden md:flex md:flex-col transition-[width] duration-200 ease-siza ${collapsed ? 'md:w-16' : 'md:w-64'}`}
      >
        <div className="flex flex-col flex-grow pt-5 bg-surface-0 border-r border-surface-3 overflow-y-auto overflow-x-hidden">
          <Link
            href="/dashboard"
            className={`flex items-center flex-shrink-0 gap-3 hover:opacity-80 transition-opacity ${collapsed ? 'justify-center px-2' : 'px-4'}`}
          >
            <Image
              src="/siza-icon.png"
              alt="Siza"
              width={32}
              height={32}
              className="flex-shrink-0"
            />
            {!collapsed && (
              <h1 className="text-xl font-display font-bold text-text-primary">Siza</h1>
            )}
          </Link>
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild className="w-full mb-4 px-0 justify-center">
                      <Link href="/generate">
                        <PlusIcon className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Generate Component</TooltipContent>
                </Tooltip>
              ) : (
                <Button asChild className="w-full justify-start mb-4">
                  <Link href="/generate">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Generate Component
                  </Link>
                </Button>
              )}
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const cls = isActive
                  ? 'bg-brand/15 text-brand-light hover:bg-brand/20 hover:text-brand-light before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:rounded-full before:bg-brand-light'
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary';
                if (collapsed) {
                  return (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          variant="ghost"
                          className={`w-full justify-center px-0 relative ${cls}`}
                        >
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {item.name}
                        {item.shortcut && (
                          <span className="ml-2 text-text-muted text-xs">{item.shortcut}</span>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                return (
                  <Button
                    key={item.name}
                    asChild
                    variant="ghost"
                    className={`w-full justify-start relative ${cls}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="overflow-hidden whitespace-nowrap">{item.name}</span>
                      {item.shortcut && (
                        <span className="ml-auto text-xs text-text-muted opacity-60">
                          {item.shortcut}
                        </span>
                      )}
                    </Link>
                  </Button>
                );
              })}
            </nav>
          </div>
          <div className="px-2 pb-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={toggleCollapsed}
                  className="flex items-center justify-center w-full rounded-lg p-2 text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
                  aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {collapsed ? (
                    <ChevronsRightIcon className="h-4 w-4" />
                  ) : (
                    <>
                      <ChevronsLeftIcon className="h-4 w-4 mr-2" />
                      <span className="text-xs">Collapse</span>
                    </>
                  )}
                </button>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Expand sidebar</TooltipContent>}
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
