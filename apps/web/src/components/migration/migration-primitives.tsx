import type { ReactNode } from 'react';
import { Sparkles, GitBranch, Zap, Shield, Users, Code2, Check } from 'lucide-react';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI-generated UI in seconds',
    description: 'Describe your component, get production-ready code.',
  },
  {
    icon: GitBranch,
    title: 'Framework-aware output',
    description: 'React, Next.js, Vue, and more — with your design tokens baked in.',
  },
  {
    icon: Zap,
    title: 'Live preview + copy',
    description: 'See the result instantly. Copy, export, or push to your project.',
  },
  {
    icon: Shield,
    title: 'Privacy-first',
    description: 'Your prompts and designs never leave our secure infrastructure.',
  },
];

const TRUST_SIGNALS = [
  { icon: Users, label: '1,200+ developers' },
  { icon: Code2, label: '40k+ components generated' },
  { icon: Check, label: 'SOC 2 in progress' },
];

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
    <main
      id="main-content"
      className={`relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-0 px-4 py-10 ${className}`}
    >
      <div className="pointer-events-none absolute left-1/2 top-[-20%] h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-violet-600/30 blur-[120px] opacity-50" />
      <div className="pointer-events-none absolute inset-0 opacity-5 [background-image:radial-gradient(circle_at_20px_20px,var(--forge-border)_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="relative z-10 w-full max-w-[440px] rounded-xl border border-border bg-surface p-8 shadow-2xl sm:p-10">
        {children}
      </div>
    </main>
  );
}

export function AuthSplitShell({ children, className = '' }: BaseSectionProps) {
  return (
    <main
      id="main-content"
      className={`relative flex min-h-screen overflow-hidden bg-surface-0 ${className}`}
    >
      {/* Left panel — feature showcase, hidden on mobile */}
      <div className="relative hidden w-[480px] flex-shrink-0 flex-col justify-between overflow-hidden bg-[#0d0d12] px-12 py-14 lg:flex xl:w-[520px]">
        <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[36rem] w-[36rem] rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_20px_20px,#fff_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xl font-display font-bold text-white">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-xs">
              S
            </span>
            Siza
          </div>
          <p className="mt-2 text-sm text-zinc-400">The AI UI generation platform</p>
        </div>
        <div className="relative z-10 space-y-8">
          <h2 className="text-2xl font-semibold leading-snug text-white">
            Build UI components at the speed of thought
          </h2>
          <ul className="space-y-5">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-violet-600/20 text-violet-400">
                  <Icon size={14} />
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="mt-0.5 text-xs text-zinc-400">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative z-10">
          <div className="mb-3 h-px bg-zinc-800" />
          <div className="flex items-center gap-6">
            {TRUST_SIGNALS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Icon size={12} className="text-violet-400" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-10">
        <div className="pointer-events-none absolute left-1/2 top-[-20%] h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px] opacity-40 lg:hidden" />
        <div className="pointer-events-none absolute inset-0 opacity-5 [background-image:radial-gradient(circle_at_20px_20px,var(--forge-border)_1px,transparent_1px)] [background-size:40px_40px] lg:hidden" />
        <div className="relative z-10 w-full max-w-[420px] rounded-xl border border-border bg-surface p-8 shadow-2xl sm:p-10">
          {children}
        </div>
      </div>
    </main>
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
