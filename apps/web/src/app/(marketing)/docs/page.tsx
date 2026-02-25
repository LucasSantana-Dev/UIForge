import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Code,
  Zap,
  Shield,
  Rocket,
  Terminal,
  Monitor,
  Cloud,
  ArrowRight,
  Github,
  ExternalLink,
} from 'lucide-react';
import { FadeIn } from '@/components/landing/FadeIn';
import { CopyButton } from '@/components/docs/CopyButton';

const DOCS_BASE = 'https://docs.siza.dev/docs';

const categories = [
  {
    title: 'Getting Started',
    icon: Rocket,
    links: [
      {
        label: 'Quick Start',
        href: `${DOCS_BASE}/getting-started/quick-start`,
      },
      {
        label: 'Configuration',
        href: `${DOCS_BASE}/getting-started/configuration`,
      },
      {
        label: 'Deployment',
        href: `${DOCS_BASE}/getting-started/deployment`,
      },
      {
        label: 'Self-Hosting',
        href: `${DOCS_BASE}/getting-started/self-hosting`,
      },
    ],
  },
  {
    title: 'Guides',
    icon: BookOpen,
    links: [
      {
        label: 'First Component',
        href: `${DOCS_BASE}/guides/first-component`,
      },
      {
        label: 'Components',
        href: `${DOCS_BASE}/guides/components`,
      },
      {
        label: 'Desktop App',
        href: `${DOCS_BASE}/guides/desktop-app`,
      },
      {
        label: 'MCP Integration',
        href: `${DOCS_BASE}/guides/mcp-integration`,
      },
      {
        label: 'GitHub Export',
        href: `${DOCS_BASE}/guides/github-export`,
      },
      {
        label: 'Troubleshooting',
        href: `${DOCS_BASE}/guides/troubleshooting`,
      },
    ],
  },
  {
    title: 'API Reference',
    icon: Code,
    links: [
      {
        label: 'REST API',
        href: `${DOCS_BASE}/api-reference/rest-api`,
      },
      {
        label: 'MCP Tools',
        href: `${DOCS_BASE}/api-reference/mcp-tools`,
      },
      {
        label: 'Webhooks',
        href: `${DOCS_BASE}/api-reference/webhooks`,
      },
    ],
  },
  {
    title: 'Ecosystem',
    icon: Zap,
    links: [
      {
        label: 'Architecture',
        href: `${DOCS_BASE}/ecosystem/architecture`,
      },
      {
        label: 'Contributing',
        href: `${DOCS_BASE}/ecosystem/contributing`,
      },
    ],
  },
];

const concepts = [
  {
    icon: Shield,
    title: 'MCP Protocol',
    text: 'Connect Siza to any IDE via the Model Context Protocol.',
  },
  {
    icon: Monitor,
    title: 'Desktop + Web',
    text: 'Same generation engine, local or cloud.',
  },
  {
    icon: Cloud,
    title: 'Deploy Anywhere',
    text: 'Cloudflare Workers, Vercel, or self-hosted.',
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <Badge
              variant="outline"
              className="mb-8 px-4 py-1.5 text-xs font-mono
                border-border text-muted-foreground"
            >
              Documentation
            </Badge>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1
              className="text-4xl sm:text-5xl font-bold
                tracking-tight mb-6"
            >
              <span
                className="bg-gradient-to-r from-primary
                  via-[#8B5CF6] to-[#6366F1] bg-clip-text
                  text-transparent"
              >
                Build with Siza
              </span>
            </h1>
            <p
              className="text-lg text-muted-foreground
                max-w-xl mx-auto mb-10"
            >
              Guides, API references, and examples for AI-powered component generation.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div
              className="rounded-xl border border-[#27272A]
                bg-[#18181B] overflow-hidden max-w-md mx-auto"
            >
              <div
                className="flex items-center justify-between
                  px-4 py-3 border-b border-border/50"
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full
                        bg-red-500/60"
                    />
                    <div
                      className="w-2.5 h-2.5 rounded-full
                        bg-yellow-500/60"
                    />
                    <div
                      className="w-2.5 h-2.5 rounded-full
                        bg-green-500/60"
                    />
                  </div>
                  <span
                    className="text-xs text-muted-foreground
                      ml-2 font-mono"
                  >
                    terminal
                  </span>
                </div>
                <CopyButton text="npx create-siza-app my-app" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <Terminal
                    className="w-4 h-4 text-primary
                      flex-shrink-0"
                  />
                  <code
                    className="text-sm font-mono
                      text-foreground/90"
                  >
                    npx create-siza-app my-app
                  </code>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Documentation</h2>
            <p
              className="text-muted-foreground
                max-w-md mx-auto"
            >
              Everything you need, organized by topic.
            </p>
          </FadeIn>

          <div
            className="grid grid-cols-1 md:grid-cols-2
              lg:grid-cols-4 gap-5"
          >
            {categories.map((cat, i) => (
              <FadeIn key={cat.title} delay={i * 0.08}>
                <Card
                  className="p-6 h-full bg-card border-border
                    hover:border-primary/30 transition-all
                    duration-300 group"
                >
                  <cat.icon
                    className="w-5 h-5 text-primary mb-4
                      group-hover:text-[#8B5CF6]
                      transition-colors"
                  />
                  <h3 className="font-semibold mb-3">{cat.title}</h3>
                  <ul className="space-y-2">
                    {cat.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm
                            text-muted-foreground
                            hover:text-foreground
                            transition-colors flex
                            items-center gap-1 group/link"
                        >
                          {link.label}
                          <ExternalLink
                            className="w-3 h-3 opacity-0
                              group-hover/link:opacity-100
                              transition-opacity"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Quick Example</h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div
              className="rounded-xl border border-[#27272A]
                bg-[#18181B] overflow-hidden"
            >
              <div
                className="flex items-center justify-between
                  px-4 py-3 border-b border-border/50"
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full
                        bg-red-500/60"
                    />
                    <div
                      className="w-2.5 h-2.5 rounded-full
                        bg-yellow-500/60"
                    />
                    <div
                      className="w-2.5 h-2.5 rounded-full
                        bg-green-500/60"
                    />
                  </div>
                  <span
                    className="text-xs text-muted-foreground
                      ml-2 font-mono"
                  >
                    generate.ts
                  </span>
                </div>
                <CopyButton
                  text={`const res = await fetch("/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    description: "A pricing card with toggle",
    framework: "react",
    cssFramework: "tailwind",
  }),
});

const { code } = await res.json();`}
                />
              </div>
              <div className="p-5 overflow-x-auto">
                <pre className="text-sm font-mono leading-relaxed">
                  <code>
                    <span className="text-[#C586C0]">const</span>
                    <span className="text-foreground/90"> res = </span>
                    <span className="text-[#C586C0]">await</span>
                    <span className="text-[#DCDCAA]"> fetch</span>
                    <span className="text-[#CE9178]">(&quot;/api/generate&quot;</span>
                    <span className="text-foreground/90">, {'{'}</span>
                    {`
`}
                    <span className="text-foreground/90">{'  '}method: </span>
                    <span className="text-[#CE9178]">&quot;POST&quot;</span>
                    <span className="text-foreground/90">,</span>
                    {`
`}
                    <span className="text-foreground/90">
                      {'  '}headers: {'{'}{' '}
                    </span>
                    <span className="text-[#CE9178]">&quot;Content-Type&quot;</span>
                    <span className="text-foreground/90">: </span>
                    <span className="text-[#CE9178]">&quot;application/json&quot;</span>
                    <span className="text-foreground/90"> {'}'},</span>
                    {`
`}
                    <span className="text-foreground/90">{'  '}body: JSON.</span>
                    <span className="text-[#DCDCAA]">stringify</span>
                    <span className="text-foreground/90">({'{'})</span>
                    {`
`}
                    <span className="text-foreground/90">{'    '}description: </span>
                    <span className="text-[#CE9178]">&quot;A pricing card with toggle&quot;</span>
                    <span className="text-foreground/90">,</span>
                    {`
`}
                    <span className="text-foreground/90">{'    '}framework: </span>
                    <span className="text-[#CE9178]">&quot;react&quot;</span>
                    <span className="text-foreground/90">,</span>
                    {`
`}
                    <span className="text-foreground/90">{'    '}cssFramework: </span>
                    <span className="text-[#CE9178]">&quot;tailwind&quot;</span>
                    <span className="text-foreground/90">,</span>
                    {`
`}
                    <span className="text-foreground/90">
                      {'  '}
                      {'}'}),
                    </span>
                    {`
`}
                    <span className="text-foreground/90">{'}'});</span>
                    {`

`}
                    <span className="text-[#C586C0]">const</span>
                    <span className="text-foreground/90">
                      {' '}
                      {'{'} code {'}'} ={' '}
                    </span>
                    <span className="text-[#C586C0]">await</span>
                    <span className="text-foreground/90"> res.</span>
                    <span className="text-[#DCDCAA]">json</span>
                    <span className="text-foreground/90">();</span>
                  </code>
                </pre>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Key Concepts</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {concepts.map((c, i) => (
              <FadeIn key={c.title} delay={i * 0.1}>
                <Card
                  className="p-6 h-full bg-card border-border
                    hover:border-primary/30 transition-all
                    duration-300 group"
                >
                  <c.icon
                    className="w-5 h-5 text-primary mb-4
                      group-hover:text-[#8B5CF6]
                      transition-colors"
                  />
                  <h3 className="font-semibold mb-1.5">{c.title}</h3>
                  <p
                    className="text-sm text-muted-foreground
                      leading-relaxed"
                  >
                    {c.text}
                  </p>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 px-6 border-t border-border/50">
        <FadeIn className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            Open source.
            <br />
            <span className="text-muted-foreground">Community driven.</span>
          </h2>
          <p
            className="text-muted-foreground mb-8
              max-w-md mx-auto"
          >
            Siza is free to use with generous limits. Read the docs, explore the code, start
            building.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" asChild>
              <a
                href="https://github.com/Forge-Space/siza"
                target="_blank"
                rel="noopener noreferrer"
              >
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
    </div>
  );
}
