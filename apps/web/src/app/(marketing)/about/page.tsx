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
} from 'lucide-react';
import { AmbientVideoBackground } from '@/components/migration/ambient-video-background';

const EASE_SIZA = [0.16, 1, 0.3, 1] as const;

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
      'Every AI code tool generates beautiful frontends. We own the integration layer — UI, backend, deployment — so you ship, not glue.',
  },
  {
    icon: DollarSign,
    title: 'Generous free tier, not freemium bait',
    description:
      'Cloudflare Workers, Supabase, and Gemini free tiers give you a generous starting point at $0/month. No VC burn rate, no surprise bills. Scale when you\u2019re ready.',
  },
  {
    icon: Unlock,
    title: 'Open by default, private by design',
    description:
      'Open source, self-hostable, BYOK with AES-256 encryption. We cannot read your keys. Your code stays yours. Trust is the moat.',
  },
];

const ecosystem = [
  {
    icon: Paintbrush,
    name: 'Siza',
    badge: 'This App',
    description:
      'The open full-stack AI workspace. Generate, preview, and export production-ready components.',
  },
  {
    icon: Shield,
    name: 'siza-mcp',
    badge: '12 Tools',
    description:
      'MCP server for UI generation — scaffolding, components, prototypes, accessibility audits, Figma sync.',
  },
  {
    icon: Router,
    name: 'mcp-gateway',
    badge: '20+ Servers',
    description:
      'AI-powered tool routing hub. Connect any MCP server, route intelligently, manage via admin UI.',
  },
  {
    icon: Layers,
    name: 'forge-patterns',
    badge: null,
    description:
      'Shared patterns, configs, security framework, and MCP context server for the ecosystem.',
  },
  {
    icon: Paintbrush,
    name: 'branding-mcp',
    badge: '7 Tools',
    description:
      'AI brand identity generation — color palettes, typography, design tokens, multi-format export.',
  },
];

const techStack = [
  'Next.js 16',
  'React 19',
  'TypeScript 5.7',
  'Supabase',
  'Tailwind CSS',
  'Cloudflare Workers',
  'Turborepo',
  'shadcn/ui',
];

export default function AboutPage() {
  return (
    <div className="relative isolate min-h-screen bg-background overflow-hidden">
      <AmbientVideoBackground />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute w-[900px] h-[900px] left-1/2 top-[20%] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              'conic-gradient(from 120deg, rgba(139,92,246,0.18), rgba(6,182,212,0.10), rgba(99,102,241,0.14), rgba(139,92,246,0.18))',
            filter: 'blur(90px)',
            animation: 'mesh-rotate 70s linear infinite',
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] right-[10%] top-[60%] -translate-y-1/2"
          style={{
            background: 'radial-gradient(ellipse, rgba(6,182,212,0.10), transparent 70%)',
            filter: 'blur(60px)',
            animation: 'mesh-rotate 100s linear infinite reverse',
          }}
        />
      </div>
      <FadeIn className="pt-24 pb-16 px-6">
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            About{' '}
            <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
              Siza
            </span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Named after{' '}
            <span className="text-foreground font-medium">&Aacute;lvaro Siza Vieira</span>, the
            Pritzker Prize-winning architect whose minimalist masterworks prove that restraint is
            the highest form of expression.
          </p>
        </div>
      </FadeIn>

      <section className="py-16 px-6">
        <div className="relative z-10 max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-sm font-mono text-violet-400 tracking-wider uppercase mb-8 text-center">
              Philosophy
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {principles.map((principle, i) => (
              <FadeIn key={principle.title} delay={i * 0.1}>
                <Card className="p-6 h-full bg-card border-border hover:border-violet-500/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.08)] transition-all duration-300">
                  <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-violet-500/15 mb-4">
                    <principle.icon className="w-5 h-5 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{principle.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {principle.description}
                  </p>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="relative z-10 max-w-5xl mx-auto">
          <FadeIn className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-3">The Forge Space Ecosystem</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Siza is part of Forge Space — an open-source developer workspace. Six repositories,
              MCP-native architecture, zero lock-in.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ecosystem.map((project, i) => (
              <FadeIn key={project.name} delay={i * 0.08}>
                <Card className="p-6 h-full bg-card border-border hover:border-violet-500/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.08)] transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-violet-500/15">
                      <project.icon className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{project.name}</h3>
                        {project.badge && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-violet-500/20 text-violet-300 border-0"
                          >
                            {project.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeIn>
            <p className="text-sm font-mono text-violet-400 tracking-wider uppercase mb-8">
              Tech Stack
            </p>
          </FadeIn>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech, i) => (
              <FadeIn key={tech} delay={i * 0.05}>
                <Badge
                  variant="outline"
                  className="px-4 py-2 text-sm font-mono border-border text-muted-foreground hover:border-violet-500/40 hover:text-violet-300 hover:bg-violet-500/5 transition-all"
                >
                  {tech}
                </Badge>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 border-t border-border">
        <FadeIn className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-muted-foreground mb-6">
            Siza is built by <span className="text-foreground font-medium">Lucas Santana</span> as
            part of the Forge Space initiative.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <a href="https://github.com/Forge-Space" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" />
                Forge Space
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://github.com/Forge-Space/siza"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Source
              </a>
            </Button>
          </div>
        </FadeIn>
      </section>

      <div className="relative z-10 py-20 px-6 text-center">
        <p className="text-2xl font-light tracking-tight text-muted-foreground italic">
          &ldquo;Design that thinks. Code that lasts.&rdquo;
        </p>
      </div>
    </div>
  );
}
