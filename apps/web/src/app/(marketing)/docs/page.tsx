import Link from 'next/link';
import {
  Search,
  Code,
  BookOpen,
  Lock,
  Bot,
  Workflow,
  SlidersHorizontal,
  CreditCard,
} from 'lucide-react';
import { FadeIn } from '@/components/landing/FadeIn';
import { getMarketingPageMetadata, getMarketingWebPageJsonLd } from '@/lib/marketing/seo';

const DOCS_BASE = 'https://docs.forgespace.co/docs';

export const metadata = getMarketingPageMetadata('docs');

const mainCards = [
  {
    title: 'Getting Started',
    description: 'A step-by-step guide to integrating Siza into your existing workflow in minutes.',
    href: `${DOCS_BASE}/getting-started`,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    hoverColor: 'group-hover:text-primary',
    icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 64 64"
        fill="none"
      >
        <path d="M4 20 L18 14 H56 a3 3 0 0 1 3 3 v6 a3 3 0 0 1-3 3 H18 L4 24 V20Z" fill="#A78BFA" />
        <rect x="20" y="32" width="30" height="10" rx="3" fill="#8B5CF6" />
        <rect x="14" y="48" width="40" height="14" rx="4" fill="#6D28D9" />
      </svg>
    ),
  },
  {
    title: 'API Reference',
    description: 'Comprehensive details on every endpoint, parameter, and response code.',
    href: `${DOCS_BASE}/api-reference`,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    hoverColor: 'group-hover:text-blue-400',
    icon: Code,
  },
  {
    title: 'Templates Guide',
    description: 'Kickstart your project with production-ready templates for common use cases.',
    href: `${DOCS_BASE}/guides/templates`,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    hoverColor: 'group-hover:text-emerald-400',
    icon: BookOpen,
  },
];

const popularTopics = [
  { label: 'Authentication', icon: Lock, href: `${DOCS_BASE}/guides/authentication` },
  { label: 'Component Generation', icon: Bot, href: `${DOCS_BASE}/guides/first-component` },
  { label: 'AI Provider Setup', icon: Workflow, href: `${DOCS_BASE}/guides/ai-providers` },
  {
    label: 'Template Customization',
    icon: SlidersHorizontal,
    href: `${DOCS_BASE}/guides/templates`,
  },
  {
    label: 'Deployment',
    icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 64 64"
        fill="none"
        className="opacity-50"
      >
        <path d="M4 20 L18 14 H56 a3 3 0 0 1 3 3 v6 a3 3 0 0 1-3 3 H18 L4 24 V20Z" fill="#A78BFA" />
        <rect x="20" y="32" width="30" height="10" rx="3" fill="#8B5CF6" />
        <rect x="14" y="48" width="40" height="14" rx="4" fill="#6D28D9" />
      </svg>
    ),
    href: `${DOCS_BASE}/getting-started/deployment`,
  },
  { label: 'Billing', icon: CreditCard, href: `${DOCS_BASE}/guides/billing` },
];

export default function DocsPage() {
  const webPageJsonLd = getMarketingWebPageJsonLd('docs');

  return (
    <div className="min-h-screen">
      <script
        id="ld-json-docs-webpage"
        key="ld-json-docs-webpage"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <section className="relative overflow-hidden pb-16 pt-20 px-6">
        <div className="pointer-events-none absolute inset-0 bg-primary/5 blur-[100px] opacity-50" />
        <div className="relative z-10 mx-auto max-w-[800px] text-center">
          <FadeIn>
            <h1 className="font-display text-5xl font-bold tracking-tight text-foreground mb-4">
              Documentation
            </h1>
          </FadeIn>
          <FadeIn delay={0.05}>
            <p className="text-lg text-muted-foreground font-display mb-10">
              Everything you need to build with Siza
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="relative mx-auto max-w-[600px] group">
              <div className="absolute inset-0 -z-10 rounded-lg bg-primary/20 opacity-0 blur-xl transition-opacity duration-500 group-focus-within:opacity-100" />
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                className="h-12 w-full rounded-lg border border-border bg-surface py-3 pl-12 pr-14 text-base text-foreground placeholder-muted-foreground shadow-lg transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Search documentation..."
                type="text"
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center rounded border border-border bg-background px-2 py-1 text-xs font-medium text-muted-foreground">
                ⌘K
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] space-y-16 px-6 pb-20">
        <section>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {mainCards.map((card, i) => {
              const IconComponent = card.icon;
              return (
                <FadeIn key={card.title} delay={i * 0.08}>
                  <Link
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex min-h-[180px] flex-col rounded-lg border border-border bg-surface p-6 transition-all hover:border-primary/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.25)]"
                  >
                    <div
                      className={`mb-4 flex h-10 w-10 items-center justify-center rounded-md ${card.iconBg} transition-transform group-hover:scale-110`}
                    >
                      <IconComponent className={`h-5 w-5 ${card.iconColor}`} />
                    </div>
                    <h3
                      className={`mb-2 font-display text-lg font-semibold text-foreground transition-colors ${card.hoverColor}`}
                    >
                      {card.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {card.description}
                    </p>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </section>

        <section>
          <FadeIn>
            <h2 className="mb-6 font-display text-xl font-bold text-foreground">Popular Topics</h2>
          </FadeIn>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularTopics.map((topic, i) => {
              const TopicIcon = topic.icon;
              return (
                <FadeIn key={topic.label} delay={i * 0.05}>
                  <Link
                    href={topic.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-white/5"
                  >
                    <TopicIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{topic.label}</span>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </section>

        <section>
          <FadeIn className="mb-8 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Seamless Integration
            </h2>
            <p className="mt-2 text-muted-foreground">
              Connect to the Siza API with just a few lines of code.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="mx-auto max-w-[800px] overflow-hidden rounded-lg border border-border bg-surface shadow-2xl">
              <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                    <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                    <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <span className="ml-3 font-mono text-xs text-muted-foreground">
                    generate_component.js
                  </span>
                </div>
                <span className="font-mono text-xs text-muted-foreground">JavaScript</span>
              </div>
              <div className="overflow-x-auto p-6">
                <pre className="font-mono text-sm leading-relaxed text-foreground">
                  <code>
                    <span className="text-purple-400">import</span>
                    {' { SizaClient } '}
                    <span className="text-purple-400">from</span>{' '}
                    <span className="text-green-400">{`'@siza-ai/sdk'`}</span>
                    {`;`}
                    {'\n\n'}
                    <span className="text-purple-400">const</span>
                    {' client = '}
                    <span className="text-purple-400">new</span>{' '}
                    <span className="text-yellow-300">SizaClient</span>
                    {'({\n  apiKey: process.env.'}
                    <span className="text-blue-400">SIZA_API_KEY</span>
                    {'\n});'}
                    {'\n\n'}
                    <span className="text-purple-400">async function</span>{' '}
                    <span className="text-yellow-300">generateUI</span>
                    {'() {\n  '}
                    <span className="text-purple-400">const</span>
                    {' response = '}
                    <span className="text-purple-400">await</span>
                    {' client.components.'}
                    <span className="text-yellow-300">create</span>
                    {'({\n    prompt: '}
                    <span className="text-green-400">{`"A dashboard card showing monthly revenue"`}</span>
                    {',\n    framework: '}
                    <span className="text-green-400">{`"react"`}</span>
                    {',\n    styling: '}
                    <span className="text-green-400">{`"tailwind"`}</span>
                    {'\n  });\n\n  '}
                    <span className="text-purple-400">return</span>
                    {' response.code;\n}'}
                  </code>
                </pre>
              </div>
            </div>
          </FadeIn>
        </section>
      </div>
    </div>
  );
}
