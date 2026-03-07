'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusIcon, ChevronsLeftIcon } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@siza/ui';
import { useUIStore } from '@/stores/ui-store';
import { getDashboardNavigation } from './navigation';

interface SidebarProps {
  isAdmin: boolean;
}

export default function Sidebar({ isAdmin }: SidebarProps) {
  const pathname = usePathname();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleCollapsed = useUIStore((s) => s.toggleSidebarCollapsed);
  const navigationItems = getDashboardNavigation(isAdmin);

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={`group/sidebar hidden md:flex md:flex-col transition-[width] duration-200 ease-siza ${collapsed ? 'md:w-16' : 'md:w-64'}`}
      >
        <div className="flex flex-col flex-grow pt-5 bg-surface-0 border-r border-surface-3 overflow-y-auto overflow-x-hidden">
          <Link
            href="/dashboard"
            className={`flex items-center flex-shrink-0 gap-3 hover:opacity-80 transition-opacity ${collapsed ? 'justify-center px-2' : 'px-4'}`}
          >
            <Image
              src="/monogram.svg"
              alt="Siza"
              width={32}
              height={32}
              className="flex-shrink-0"
            />
            <h1
              className={`text-xl font-display font-bold text-text-primary whitespace-nowrap transition-opacity duration-200 ${collapsed ? 'hidden' : 'opacity-100'}`}
            >
              Siza
            </h1>
          </Link>

          <div className="mt-6 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    className={`w-full mb-3 bg-brand hover:bg-brand-light shadow-[0_0_20px_rgba(124,58,237,0.15)] hover:shadow-[0_0_28px_rgba(124,58,237,0.25)] transition-all ${collapsed ? 'px-0 justify-center' : 'justify-start'}`}
                  >
                    <Link href="/generate">
                      <PlusIcon className="h-5 w-5 flex-shrink-0" />
                      <span
                        className={`whitespace-nowrap transition-opacity duration-200 ${collapsed ? 'hidden' : 'opacity-100 ml-2'}`}
                      >
                        Generate
                      </span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">Generate Component</TooltipContent>}
              </Tooltip>

              {navigationItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const activeCls = isActive
                  ? 'bg-brand/15 text-brand-light hover:bg-brand/20 before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:rounded-full before:bg-brand'
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary';

                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant="ghost"
                        className={`w-full relative h-10 ${activeCls} ${collapsed ? 'justify-center px-0' : 'justify-start px-3'}`}
                      >
                        <Link href={item.href}>
                          <item.icon
                            className={`h-[18px] w-[18px] flex-shrink-0 transition-colors ${isActive ? 'text-brand-light' : ''}`}
                          />
                          <span
                            className={`whitespace-nowrap overflow-hidden transition-opacity duration-200 ${collapsed ? 'hidden' : 'opacity-100 ml-2.5'}`}
                          >
                            {item.name}
                          </span>
                          {item.shortcut && (
                            <span
                              className={`ml-auto text-xs text-text-muted opacity-60 ${collapsed ? 'hidden' : ''}`}
                            >
                              {item.shortcut}
                            </span>
                          )}
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right">
                        {item.name}
                        {item.shortcut && (
                          <span className="ml-2 text-xs opacity-60">{item.shortcut}</span>
                        )}
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </nav>
          </div>

          <div className="px-2 pb-4">
            <button
              type="button"
              onClick={toggleCollapsed}
              className={`flex items-center w-full rounded-lg p-2 text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors ${collapsed ? 'justify-center' : 'justify-start px-3'}`}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronsLeftIcon
                className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
              />
              <span
                className={`text-xs whitespace-nowrap transition-opacity duration-200 ${collapsed ? 'hidden' : 'opacity-100 ml-2'}`}
              >
                Collapse
              </span>
            </button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
