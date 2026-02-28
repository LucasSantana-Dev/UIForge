import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/error-boundary/RouteErrorBoundary';

function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test error');
  return <div>Child content</div>;
}

const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Hello</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Hello')).toBeDefined();
  });

  it('renders default fallback on error', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeDefined();
    expect(screen.getByText('Test error')).toBeDefined();
  });

  it('renders custom fallback on error', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom fallback')).toBeDefined();
  });

  it('calls onError callback', () => {
    const onError = jest.fn();
    render(
      <ErrorBoundary onError={onError}>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('shows Try Again button on error', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeDefined();
    expect(screen.getByText('Try Again')).toBeDefined();
  });
});

describe('RouteErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <RouteErrorBoundary>
        <div>Route content</div>
      </RouteErrorBoundary>
    );
    expect(screen.getByText('Route content')).toBeDefined();
  });

  it('shows route-specific error message', () => {
    render(
      <RouteErrorBoundary routeName="Generate">
        <ThrowingChild shouldThrow={true} />
      </RouteErrorBoundary>
    );
    expect(screen.getByText(/The Generate page encountered an error/)).toBeDefined();
  });

  it('shows refresh and dashboard buttons', () => {
    render(
      <RouteErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </RouteErrorBoundary>
    );
    expect(screen.getByText('Refresh Page')).toBeDefined();
    expect(screen.getByText('Go to Dashboard')).toBeDefined();
  });
});
