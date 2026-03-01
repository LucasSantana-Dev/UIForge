'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  XIcon,
  FolderIcon,
  FileTextIcon,
  SettingsIcon,
  PlusIcon,
  ClockIcon,
  KeyIcon,
  CreditCardIcon,
} from 'lucide-react';
import { useEffect, useRef } from 'react';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Projects', href: '/projects', icon: FolderIcon },
  { name: 'Templates', href: '/templates', icon: FileTextIcon },
  { name: 'History', href: '/history', icon: ClockIcon },
  { name: 'AI Keys', href: '/ai-keys', icon: KeyIcon },
  { name: 'Billing', href: '/billing', icon: CreditCardIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
];

export default function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panelRef.current) return;

      const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleFocusTrap);

    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleFocusTrap);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleBackdropClick = () => {
    onClose();
  };

  const handleBackdropKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-200"
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Close navigation"
      />
      <div
        ref={panelRef}
        className="fixed inset-y-0 left-0 flex flex-col w-64 bg-surface-1 border-r border-surface-3 z-50 transition-transform duration-300 ease-siza"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-surface-3">
          <h1 className="text-xl font-display font-bold text-brand">Siza</h1>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
            aria-label="Close navigation"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          <Link
            href="/generate"
            onClick={onClose}
            className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg bg-brand text-white hover:bg-brand-light transition-colors mb-4"
          >
            <PlusIcon className="mr-3 h-5 w-5" />
            Generate Component
          </Link>
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`group relative flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-brand/15 text-brand-light before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:rounded-full before:bg-brand-light'
                    : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive
                      ? 'text-brand-light'
                      : 'text-text-muted group-hover:text-text-secondary'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
