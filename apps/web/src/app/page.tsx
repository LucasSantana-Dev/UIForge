export const dynamic = 'force-dynamic';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Zap, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { AnimatedBackground } from '@/components/animations/AnimatedBackground';
import { AnimatedHeading } from '@/components/animations/AnimatedHeading';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import { RotatingSparkles } from '@/components/ui/RotatingSparkles';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { FeatureCard } from '@/components/animations/FeatureCard';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col relative">
      <AnimatedBackground />
      <header className="border-b relative z-10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image src="/anvil-logo.svg" alt="UIForge" width={24} height={24} className="flex-shrink-0" />
            <span className="text-xl font-bold">UIForge</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Beta
            </span>
          </div>
          <nav className="flex items-center gap-4">
            {!user ? (
              <>
                <Link
                  href="/signin"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="mx-auto max-w-3xl space-y-8">
            <ScrollReveal delay={0.2}>
              <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-2 text-sm">
                <RotatingSparkles />
                <span>AI-Powered UI Generation</span>
              </div>
            </ScrollReveal>

            <AnimatedHeading delay={0.4} className="text-5xl font-bold tracking-tight sm:text-6xl">
              Generate Production-Ready
              <span className="text-primary"> UI Components</span>
            </AnimatedHeading>

            <ScrollReveal delay={0.6} className="text-xl text-muted-foreground">
              Transform your ideas into beautiful, functional UI components with AI. Support for
              React, Next.js, Vue, Angular, and more. Zero cost, unlimited possibilities.
            </ScrollReveal>

            <ScrollReveal delay={0.8} className="flex items-center justify-center gap-4">
              {!user ? (
                <AnimatedButton
                  href="/signup"
                  variant="primary"
                >
                  Start Building Free
                  <ArrowRight className="h-4 w-4" />
                </AnimatedButton>
              ) : (
                <AnimatedButton
                  href="/dashboard"
                  variant="primary"
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </AnimatedButton>
              )}
              <AnimatedButton
                href="https://github.com/yourusername/uiforge-mcp"
                variant="secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </AnimatedButton>
            </ScrollReveal>
          </div>
        </section>

        <ScrollReveal delay={1.0} className="border-t bg-gradient-to-b from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 py-24">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard
                delay={0.2}
                icon={<Zap className="h-6 w-6 text-primary" />}
                title="Lightning Fast"
                description="Generate components in seconds. No waiting, no setup required."
              />

              <FeatureCard
                delay={0.4}
                icon={<CheckCircle className="h-6 w-6 text-primary" />}
                title="Production Ready"
                description="Clean, maintainable code following best practices and conventions."
              />

              <FeatureCard
                delay={0.6}
                icon={<Sparkles className="h-6 w-6 text-primary" />}
                title="AI-Powered"
                description="Bring your own AI key or use our free tier. Your choice, your control."
              />
            </div>
          </div>
        </ScrollReveal>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 UIForge. Open source and free.</p>
        </div>
      </footer>
    </div>
  );
}
