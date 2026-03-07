'use client';

import type { ReactNode } from 'react';

interface BaseSectionProps {
  children: ReactNode;
  className?: string;
}

interface HeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function AuthCardShell({ children, className = '' }: BaseSectionProps) {
  return (
    <div
      className={`relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-0 px-4 py-10 ${className}`}
    >
      <div className="pointer-events-none absolute left-1/2 top-[-20%] h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-violet-600/30 blur-[120px] opacity-50" />
      <div className="pointer-events-none absolute inset-0 opacity-5 [background-image:radial-gradient(circle_at_20px_20px,var(--forge-border)_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="relative z-10 w-full max-w-[440px] rounded-xl border border-border bg-surface p-8 shadow-2xl sm:p-10">
        {children}
      </div>
    </div>
  );
}

export function MarketingSection({ children, className = '' }: BaseSectionProps) {
  return <section className={`mx-auto w-full max-w-6xl px-6 ${className}`}>{children}</section>;
}

export function DashboardSection({ title, description, actions }: HeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">{title}</h1>
        {description ? <p className="mt-2 text-sm text-text-secondary">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
