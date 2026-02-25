'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Code2,
  Palette,
  Key,
  LayoutGrid,
  Eye,
  Github,
  Twitter,
  ArrowRight,
  Terminal,
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
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, ease: EASE_SIZA, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const capabilities = [
  'React',
  'Next.js',
  'Vue',
  'Angular',
  'Tailwind CSS',
  'shadcn/ui',
  'TypeScript',
  'Figma Integration',
];

const features = [
  {
    icon: Sparkles,
    title: 'AI Generation',
    description: 'Describe a component in natural language. Get production-ready code.',
  },
  {
    icon: Code2,
    title: 'Multi-Framework',
    description: 'Output for React, Vue, Angular, and Svelte with consistent quality.',
  },
  {
    icon: Palette,
    title: 'Design Systems',
    description: 'Works with Tailwind, Material-UI, Chakra UI, and shadcn/ui.',
  },
  {
    icon: Key,
    title: 'BYOK',
    description: 'Bring your own AI keys. Complete privacy and control.',
  },
  {
    icon: LayoutGrid,
    title: 'Template Library',
    description: 'Start from curated templates. Customize to fit your needs.',
  },
  {
    icon: Eye,
    title: 'Live Preview',
    description: 'See your component render in real-time as the AI writes code.',
  },
];

const steps = [
  { number: '01', title: 'Describe', text: 'Write what you want to build in plain language.' },
  { number: '02', title: 'Generate', text: 'AI creates clean, production-ready code instantly.' },
  { number: '03', title: 'Deploy', text: 'Fine-tune in the editor, then ship to your project.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Mesh background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 80% 60% at 10% 20%, rgba(124, 58, 237, 0.07) 0%, transparent 60%)',
            'radial-gradient(ellipse 60% 80% at 85% 75%, rgba(99, 102, 241, 0.05) 0%, transparent 55%)',
            'radial-gradient(ellipse 40% 40% at 50% 10%, rgba(139, 92, 246, 0.04) 0%, transparent 50%)',
            'hsl(var(--background))',
          ].join(', '),
        }}
      />

      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_SIZA }}
          >
            <Badge
              variant="outline"
              className="mb-8 px-4 py-1.5 text-xs font-mono border-border text-muted-foreground"
            >
              Open Source &middot; Generous Free Tier
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_SIZA, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
          >
            <span className="bg-gradient-to-r from-primary via-[#8B5CF6] to-[#6366F1] bg-clip-text text-transparent">
              Design that thinks.
            </span>
            <br />
            <span className="text-foreground">Code that lasts.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_SIZA, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-xl mx-auto mb-10"
          >
            Precision UI generation for the exacting developer.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_SIZA, delay: 0.3 }}
          >
            <Button size="lg" className="gap-2" asChild>
              <a href="/signup">
                Start Building
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Capabilities marquee */}
      <section className="py-8 border-y border-border/50 bg-[#18181B]/50 overflow-hidden">
        <div className="relative">
          <motion.div
            className="flex gap-8 whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            {[...capabilities, ...capabilities].map((cap, i) => (
              <span
                key={`${cap}-${i}`}
                className="text-sm font-mono text-muted-foreground/60 uppercase tracking-widest"
              >
                {cap}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Built for precision</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Every feature designed with purpose. Nothing unnecessary.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 0.08}>
                <Card className="p-6 h-full bg-card border-border hover:border-primary/30 transition-all duration-300 group">
                  <feature.icon className="w-5 h-5 text-primary mb-4 group-hover:text-[#8B5CF6] transition-colors" />
                  <h3 className="font-semibold mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-24 px-6 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Three steps. That&apos;s it.</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <FadeIn key={step.number} delay={i * 0.1}>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary/20 mb-3 font-mono">
                    {step.number}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Code showcase */}
      <section className="relative py-24 px-6 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Terminal input */}
              <div className="rounded-lg border border-border bg-[#1E1E22] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2 font-mono">prompt</span>
                </div>
                <div className="p-5">
                  <div className="flex items-start gap-2">
                    <Terminal className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <code className="text-sm font-mono text-foreground/90 leading-relaxed">
                      Create a responsive pricing card with Tailwind CSS, dark theme, and hover
                      animation
                    </code>
                  </div>
                </div>
              </div>

              {/* Preview output */}
              <div className="rounded-lg border border-border bg-[#1E1E22] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
                  <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-mono">preview</span>
                </div>
                <div className="p-5 flex items-center justify-center min-h-[120px]">
                  <div className="w-full max-w-[200px] rounded-lg border border-primary/20 bg-card p-4 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Pro</div>
                    <div className="text-2xl font-bold mb-2">$29</div>
                    <div className="h-1.5 w-full bg-primary/20 rounded-full mb-3">
                      <div className="h-full w-3/4 bg-primary rounded-full" />
                    </div>
                    <div className="text-xs text-muted-foreground">Generated in 2.3s</div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Open Source CTA */}
      <section className="relative py-24 px-6 border-t border-border/50">
        <FadeIn className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            Built in the open.
            <br />
            <span className="text-muted-foreground">Generous free tier.</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Siza starts free with generous limits. No surprises, no paywalls. Scale when you need
            to.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" asChild>
              <a href="https://github.com/Forge-Space/UI" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" />
                View on GitHub
              </a>
            </Button>
            <Button asChild>
              <a href="/signup">
                Start Building
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border/50 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="text-lg font-bold mb-2">
                <span className="bg-gradient-to-r from-primary to-[#6366F1] bg-clip-text text-transparent">
                  Siza
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Design that thinks. Code that lasts.</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/landing" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="/docs" className="hover:text-foreground transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="/roadmap" className="hover:text-foreground transition-colors">
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/about" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/Forge-Space/UI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Connect</h4>
              <div className="flex gap-3">
                <a
                  href="https://github.com/Forge-Space"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-border/50 mt-8 pt-8 text-center">
            <p className="text-xs text-muted-foreground">&copy; 2026 Siza. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
