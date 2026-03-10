'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Zap,
  DollarSign,
  Unlock,
  Layers,
  Shield,
  Router,
  Paintbrush,
  Github,
  ExternalLink,
  Wrench,
  PenTool,
  MonitorSmartphone,
  type LucideIcon,
} from 'lucide-react';
import { AmbientVideoBackground } from '@/components/migration/ambient-video-background';
import { type EcosystemSnapshot } from '@/lib/marketing/ecosystem-data';

const EASE_SIZA = [0.16, 1, 0.3, 1] as const;

interface AboutPageClientProps {
  snapshot: EcosystemSnapshot;
}

function FadeIn({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={
        prefersReducedMotion ? { duration: 0 } : { duration: 0.5, ease: EASE_SIZA, delay }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}

const principles = [
  {
    icon: Zap,
    title: 'Full-stack, not frontend-only',
    description:
      'Siza focuses on integration quality across UI, backend, governance, and shipping workflows.',
  },
  {
    icon: DollarSign,
    title: 'Sustainable economics by design',
    description:
      'Open-source defaults and BYOK flows let teams adopt progressively without lock-in pricing pressure.',
  },
  {
    icon: Unlock,
    title: 'Open by default, private by design',
    description:
      'MIT licensing, self-host options, and encrypted credentials keep ownership and control with the team.',
  },
];

const techStack = [
  'Next.js 16',
  'React 19',
  'TypeScript',
  'Supabase',
  'Tailwind CSS',
  'Cloudflare Workers',
  'Turborepo',
  'shadcn/ui',
];

const iconByRepo: Record<string, LucideIcon> = {
  siza: Paintbrush,
  core: Layers,
  'mcp-gateway': Router,
  'ui-mcp': Shield,
  'siza-gen': Wrench,
  'forge-ai-init': Shield,
  'forge-ai-action': Shield,
  'branding-mcp': PenTool,
  'brand-guide': Paintbrush,
  'forgespace-web': MonitorSmartphone,
  'siza-desktop': MonitorSmartphone,
};

function formatDate(iso: string | null): string {
  if (!iso) return 'No release';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}

export default function AboutPageClient({ snapshot }: AboutPageClientProps) {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background">
      <AmbientVideoBackground />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute left-1/2 top-[20%] h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              'conic-gradient(from 120deg, rgba(139,92,246,0.18), rgba(6,182,212,0.10), rgba(99,102,241,0.14), rgba(139,92,246,0.18))',
            filter: 'blur(90px)',
            animation: 'mesh-rotate 70s linear infinite',
          }}
        />
        <div
          className="absolute right-[10%] top-[60%] h-[500px] w-[500px] -translate-y-1/2"
          style={{
            background: 'radial-gradient(ellipse, rgba(6,182,212,0.10), transparent 70%)',
            filter: 'blur(60px)',
            animation: 'mesh-rotate 100s linear infinite reverse',
          }}
        />
      </div>
      <FadeIn className="px-6 pb-16 pt-24">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl">
            About{' '}
            <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
              Siza
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Named after <span className="font-medium text-foreground">Álvaro Siza Vieira</span>,
            with the same philosophy: restraint, precision, and systems that endure.
          </p>
        </div>
      </FadeIn>

      <section className="px-6 py-16">
        <div className="relative z-10 mx-auto max-w-5xl">
          <FadeIn>
            <p className="mb-8 text-center text-sm font-mono uppercase tracking-wider text-violet-400">
              Philosophy
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {principles.map((principle, index) => (
              <FadeIn key={principle.title} delay={index * 0.1}>
                <Card className="h-full border-border bg-card p-6 transition-all duration-300 hover:border-violet-500/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.08)]">
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15">
                    <principle.icon className="h-5 w-5 text-violet-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{principle.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {principle.description}
                  </p>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="relative z-10 mx-auto max-w-5xl">
          <FadeIn className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight">The Forge Space Ecosystem</h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Siza ships as part of an 11-repository product ecosystem with{' '}
              {snapshot.releasedRepoCount} tagged releases and shared governance standards.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {snapshot.repos.map((project, index) => {
              const Icon = iconByRepo[project.name] ?? Layers;
              return (
                <FadeIn key={project.name} delay={index * 0.06}>
                  <Card className="h-full border-border bg-card p-6 transition-all duration-300 hover:border-violet-500/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.08)]">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-violet-500/15 p-2">
                        <Icon className="h-5 w-5 text-violet-400" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="font-semibold">{project.name}</h3>
                          <Badge
                            variant="secondary"
                            className="border-0 bg-violet-500/20 text-xs text-violet-300"
                          >
                            {project.latestReleaseTag ?? 'No release'}
                          </Badge>
                        </div>
                        <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
                          {project.description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          Updated {formatDate(project.updatedAt)}
                        </div>
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          Open repository
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </Card>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <FadeIn>
            <p className="mb-8 text-sm font-mono uppercase tracking-wider text-violet-400">
              Tech Stack
            </p>
          </FadeIn>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech, index) => (
              <FadeIn key={tech} delay={index * 0.05}>
                <Badge
                  variant="outline"
                  className="border-border px-4 py-2 text-sm font-mono text-muted-foreground transition-all hover:border-violet-500/40 hover:bg-violet-500/5 hover:text-violet-300"
                >
                  {tech}
                </Badge>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border px-6 py-16">
        <FadeIn className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="mb-6 text-muted-foreground">
            Siza is built by <span className="font-medium text-foreground">Lucas Santana</span> as
            part of the Forge Space initiative.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <a href="https://github.com/Forge-Space" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                Forge Space
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://github.com/Forge-Space/siza"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Source
              </a>
            </Button>
          </div>
        </FadeIn>
      </section>

      <div className="relative z-10 px-6 py-20 text-center">
        <p className="text-2xl italic tracking-tight text-muted-foreground">
          &ldquo;Design that thinks. Code that lasts.&rdquo;
        </p>
      </div>
    </div>
  );
}
