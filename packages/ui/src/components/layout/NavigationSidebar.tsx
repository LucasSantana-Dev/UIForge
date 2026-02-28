'use client';

import type { NavigationItem } from '../../lib/generation-types';
import { cn } from '../../lib/utils';

interface NavigationSidebarProps {
  items: NavigationItem[];
  activeId: string;
  renderLink: (
    item: NavigationItem,
    isActive: boolean,
    children: React.ReactNode
  ) => React.ReactNode;
  header?: React.ReactNode;
  primaryAction?: React.ReactNode;
  className?: string;
}

export function NavigationSidebar({
  items,
  activeId,
  renderLink,
  header,
  primaryAction,
  className,
}: NavigationSidebarProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {header && (
        <div className="flex-shrink-0 px-4 pt-5">
          {header}
        </div>
      )}
      <div className="mt-8 flex-grow flex flex-col">
        <nav className="flex-1 px-2 space-y-1">
          {primaryAction && (
            <div className="mb-4">{primaryAction}</div>
          )}
          {items.map((item) => {
            const isActive = activeId.startsWith(
              item.id
            );
            const Icon = item.icon;
            return (
              <div key={item.id}>
                {renderLink(
                  item,
                  isActive,
                  <span
                    className={cn(
                      'relative flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-purple-500/15 text-purple-300 before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:rounded-full before:bg-purple-300'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    )}
                  >
                    {Icon && (
                      <Icon className="mr-2 h-4 w-4" />
                    )}
                    {item.label}
                  </span>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
