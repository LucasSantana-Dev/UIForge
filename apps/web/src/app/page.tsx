export const dynamic = 'force-dynamic';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Zap, Shield, Puzzle, KeyRound, Server, Github } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image
              src="/anvil-logo.svg"
              alt="Siza"
              width={24}
              height={24}
              className="flex-shrink-0"
            />
            <span className="text-xl font-bold">Siza</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Beta
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              About
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="/roadmap"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Roadmap
            </Link>
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
                href="/generate"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>The Open Full-Stack AI Workspace</span>
            </div>

            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              Generate. Integrate.
              <span className="text-primary"> Ship.</span>
            </h1>

            <p className="text-xl text-muted-foreground">
              From idea to production with zero lock-in. AI-powered UI generation, backend wiring,
              and deployment — all in one open-source workspace you own.
            </p>

            <div className="flex items-center justify-center gap-4">
              {!user ? (
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Start Building Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/generate"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <Link
                href="https://github.com/Forge-Space/siza"
                className="inline-flex items-center gap-2 rounded-md border px-6 py-3 text-base font-medium hover:bg-accent"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                View on GitHub
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t bg-gradient-to-b from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 py-24">
          <div className="container mx-auto px-4">
            <h2 className="mb-4 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Why Siza
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-muted-foreground">
              Every AI code tool generates beautiful frontends. Then you spend days wiring auth,
              database, APIs, and deployment. Siza owns the full-stack integration layer.
            </p>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-4 rounded-lg border bg-card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Puzzle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">MCP-Native</h3>
                <p className="text-sm text-muted-foreground">
                  Composable AI tools via Model Context Protocol. Swap providers, chain tools,
                  extend with custom servers.
                </p>
              </div>

              <div className="space-y-4 rounded-lg border bg-card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">True Zero-Cost</h3>
                <p className="text-sm text-muted-foreground">
                  Not a free trial. Cloudflare Workers, Supabase, and Gemini free tiers support ~50K
                  users at $0/month.
                </p>
              </div>

              <div className="space-y-4 rounded-lg border bg-card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <KeyRound className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Privacy-First BYOK</h3>
                <p className="text-sm text-muted-foreground">
                  Bring Your Own Key with client-side AES-256 encryption. We cannot read your keys.
                  Your code stays yours.
                </p>
              </div>

              <div className="space-y-4 rounded-lg border bg-card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Server className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Self-Hostable</h3>
                <p className="text-sm text-muted-foreground">
                  Run everything locally with Docker. Full control over your data and
                  infrastructure. MIT licensed.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              The Forge Space Ecosystem
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground">
              Five open-source repositories working together. Use one, use all &mdash; no lock-in,
              no dependencies you don&apos;t want.
            </p>
            <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: 'Siza',
                  desc: 'AI workspace — generate, preview, export',
                },
                {
                  name: 'siza-mcp',
                  desc: '12 MCP tools for UI generation',
                },
                {
                  name: 'mcp-gateway',
                  desc: 'AI-powered tool routing hub',
                },
                {
                  name: 'forge-patterns',
                  desc: 'Shared configs and standards',
                },
                {
                  name: 'branding-mcp',
                  desc: 'Brand identity generation',
                },
              ].map((repo) => (
                <Link
                  key={repo.name}
                  href={`https://github.com/Forge-Space/${repo.name === 'Siza' ? 'siza' : repo.name === 'forge-patterns' ? 'core' : repo.name === 'siza-mcp' ? 'ui-mcp' : repo.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{repo.name}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{repo.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto flex items-center justify-between px-4 text-sm text-muted-foreground">
          <p>&copy; 2026 Siza. Open source, MIT licensed.</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
            <Link href="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
            <Link href="/roadmap" className="hover:text-foreground">
              Roadmap
            </Link>
            <Link
              href="https://github.com/Forge-Space"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
