'use client';

import { ErrorBoundary } from './ErrorBoundary';
import type { ReactNode } from 'react';

interface RouteErrorBoundaryProps {
  children: ReactNode;
  routeName?: string;
}

export function RouteErrorBoundary({ children, routeName }: RouteErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 p-8">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Oops! Something broke
            </h2>
            <p className="text-text-secondary">
              {routeName
                ? `The ${routeName} page encountered an error.`
                : 'This page encountered an error.'}
              {' '}Please try refreshing, or go back to the dashboard.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-medium rounded-md bg-brand text-white hover:bg-brand/90"
            >
              Refresh Page
            </button>
            <a
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium rounded-md border border-surface-3 text-text-primary hover:bg-surface-1"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
