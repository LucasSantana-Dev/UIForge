'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
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

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: EASE_SIZA, delay }}
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
    <div className="min-h-screen bg-background">
      <FadeIn className="pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            About{' '}
            <span className="bg-gradient-to-r from-primary to-[#6366F1] bg-clip-text text-transparent">
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
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-8 text-center">
              Philosophy
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {principles.map((principle, i) => (
              <FadeIn key={principle.title} delay={i * 0.1}>
                <Card className="p-6 h-full bg-card border-border hover:border-primary/30 transition-colors duration-300">
                  <principle.icon className="w-5 h-5 text-primary mb-4" />
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
        <div className="max-w-5xl mx-auto">
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
                <Card className="p-6 h-full bg-card border-border hover:border-primary/30 transition-colors duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <project.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{project.name}</h3>
                        {project.badge && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-primary/20 text-primary border-0"
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
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-8">
              Tech Stack
            </h2>
          </FadeIn>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech, i) => (
              <FadeIn key={tech} delay={i * 0.05}>
                <Badge
                  variant="outline"
                  className="px-4 py-2 text-sm font-mono border-border text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                >
                  {tech}
                </Badge>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 border-t border-border">
        <FadeIn className="max-w-3xl mx-auto text-center">
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

      <div className="py-20 px-6 text-center">
        <p className="text-2xl font-light tracking-tight text-muted-foreground italic">
          &ldquo;Design that thinks. Code that lasts.&rdquo;
        </p>
      </div>
    </div>
  );
}
