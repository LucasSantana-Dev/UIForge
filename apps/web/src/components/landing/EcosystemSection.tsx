'use client';

import { CONTAINER, SECTION_PADDING } from './constants';
import { FadeIn } from './FadeIn';

const repos = [
  {
    name: 'siza',
    badge: 'Web App',
    desc: 'Full-stack Next.js workspace with AI generation, auth, and billing',
    href: 'https://github.com/Forge-Space/siza',
  },
  {
    name: 'siza-gen',
    badge: 'Engine',
    desc: 'Multi-framework code generation engine with 502-snippet registry',
    href: 'https://github.com/Forge-Space/siza-gen',
  },
  {
    name: 'siza-mcp',
    badge: 'MCP Server',
    desc: '21 AI-powered tools for full-stack generation via Model Context Protocol',
    href: 'https://github.com/Forge-Space/ui-mcp',
  },
  {
    name: 'mcp-gateway',
    badge: 'Gateway',
    desc: 'Intelligent routing hub for 12+ AI providers with failover',
    href: 'https://github.com/Forge-Space/mcp-gateway',
  },
  {
    name: 'branding-mcp',
    badge: 'Branding',
    desc: 'AI-powered brand identity generation with 9 MCP tools',
    href: 'https://github.com/Forge-Space/branding-mcp',
  },
  {
    name: 'forge-patterns',
    badge: 'Library',
    desc: 'Shared configurations, standards, and MCP context server',
    href: 'https://github.com/Forge-Space/core',
  },
  {
    name: 'brand-guide',
    badge: 'Brand',
    desc: 'Design tokens, typography, color system, and brand identity site',
    href: 'https://github.com/Forge-Space/brand-guide',
  },
];

export function EcosystemSection() {
  return (
    <section id="ecosystem" className={`${SECTION_PADDING} border-t border-[#27272A]`}>
      <div className={CONTAINER}>
        <div className="text-center">
          <FadeIn>
            <p className="text-sm font-mono text-brand tracking-wider uppercase mb-4">Ecosystem</p>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#FAFAFA] mb-4">
              Seven repos. One vision.
            </h2>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="text-lg text-[#A1A1AA] max-w-2xl mx-auto">
              Each repository is independent and MIT-licensed. Use one or compose them all.
            </p>
          </FadeIn>
        </div>

        <div className="hidden lg:block relative h-20 w-full mt-12">
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {[16.7, 50, 83.3].map((x) => (
              <line
                key={x}
                x1={`${x}%`}
                y1="0"
                x2={`${x}%`}
                y2="100%"
                stroke="rgba(124,58,237,0.3)"
                strokeWidth="1"
                strokeDasharray="4 4"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="-8"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </line>
            ))}
          </svg>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
          {repos.map((repo, i) => (
            <FadeIn key={repo.name} delay={0.24 + i * 0.08}>
              <a
                href={repo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-[#27272A] bg-[#18181B] p-6 transition-all duration-200 ease-siza hover:border-[var(--border-hover)] hover:shadow-card-hover hover:-translate-y-0.5 group"
              >
                <span className="inline-flex items-center rounded-md bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand-light mb-3">
                  {repo.badge}
                </span>
                <h3 className="text-base font-semibold text-[#FAFAFA] mb-2 group-hover:text-brand-light transition-colors">
                  {repo.name}
                </h3>
                <p className="text-sm text-[#A1A1AA] leading-relaxed">{repo.desc}</p>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
