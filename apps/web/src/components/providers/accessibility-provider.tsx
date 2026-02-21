'use client';

import { useEffect, useRef } from 'react';

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const announcementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add keyboard navigation support
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip to main content with Alt+M
      if (event.altKey && event.key === 'm') {
        event.preventDefault();
        const main = document.querySelector('main');
        if (main) {
          main.focus();
          announceToScreenReader('Navigated to main content');
        }
      }

      // Skip to navigation with Alt+N
      if (event.altKey && event.key === 'n') {
        event.preventDefault();
        const nav = document.querySelector('nav');
        if (nav) {
          nav.focus();
          announceToScreenReader('Navigated to navigation');
        }
      }

      // Focus trap for modals
      if (event.key === 'Escape') {
        const activeModal = document.querySelector('[role="dialog"]');
        if (activeModal) {
          const closeButton = activeModal.querySelector('button[aria-label*="Close"], button[aria-label*="Cancel"]');
          if (closeButton) {
            (closeButton as HTMLElement).click();
          }
        }
      }
    };

    // Add focus management
    const handleFocusIn = (event: FocusEvent) => {
      const element = event.target as HTMLElement;
      element.setAttribute('data-focused', 'true');
    };

    const handleFocusOut = (event: FocusEvent) => {
      const element = event.target as HTMLElement;
      element.removeAttribute('data-focused');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  const announceToScreenReader = (message: string) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message;
      // Clear after announcement
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  // Expose announcement function globally for other components
  useEffect(() => {
    (window as any).announceToScreenReader = announceToScreenReader;
    return () => {
      delete (window as any).announceToScreenReader;
    };
  }, []);

  return (
    <>
      {children}
      {/* Screen reader announcements */}
      <div
        ref={announcementRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
      
      {/* Skip links */}
      <div className="sr-only">
        <a
          href="#main-content"
          className="absolute top-0 left-0 z-50 bg-primary text-primary-foreground px-4 py-2 -translate-y-full focus:translate-y-0 transition-transform"
        >
          Skip to main content
        </a>
        <a
          href="#navigation"
          className="absolute top-8 left-0 z-50 bg-primary text-primary-foreground px-4 py-2 -translate-y-full focus:translate-y-0 transition-transform"
        >
          Skip to navigation
        </a>
      </div>
    </>
  );
}

// Hook for accessibility features
export function useAccessibility() {
  const announceToScreenReader = (message: string) => {
    if ((window as any).announceToScreenReader) {
      (window as any).announceToScreenReader(message);
    }
  };

  const trapFocus = (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  };

  return {
    announceToScreenReader,
    trapFocus,
  };
}