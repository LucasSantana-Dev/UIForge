'use client';

import { Layers, GitFork, Network, Shield, Zap, Terminal } from 'lucide-react';
import { FadeIn } from './FadeIn';
import { CONTAINER, SECTION_PADDING } from './constants';

const capabilities = [
  {
    icon: Layers,
    title: 'Component Architecture',
    description:
      'Atomic design system with 200+ composable primitives. From atoms to full page templates.',
  },
  {
    icon: GitFork,
    title: 'AI Provider Gateway',
    description:
      'Route to 12+ AI providers through a single API. Automatic failover and load balancing.',
  },
  {
    icon: Network,
    title: 'Repository Ecosystem',
    description:
      'Five interconnected open-source repositories. Use one or all \u2014 zero lock-in.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'AES-256 BYOK encryption, RLS policies, and SOC 2-ready architecture out of the box.',
  },
  {
    icon: Zap,
    title: 'Edge-First Performance',
    description: 'Deploy to Cloudflare Workers for sub-50ms response times at the edge, globally.',
  },
  {
    icon: Terminal,
    title: 'Developer Experience',
    description:
      'TypeScript-first SDK, MCP integration, and CLI tools. Built by developers, for developers.',
  },
];

export function CapabilitiesSection() {
  return (
    <section className={SECTION_PADDING}>
      <div className={CONTAINER}>
        <FadeIn>
          <div className="text-center">
            <p className="text-sm font-mono text-[#7C3AED] tracking-wider uppercase mb-4">
              Capabilities
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#FAFAFA] mb-4">
              Everything you need to ship
            </h2>
            <p className="text-lg text-[#A1A1AA] max-w-2xl mx-auto">
              A complete toolkit for modern UI development, from generation to deployment.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <FadeIn key={cap.title} delay={i * 0.06}>
                <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-6 transition-all duration-300 hover:border-[rgba(124,58,237,0.35)] hover:shadow-card-hover">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[rgba(124,58,237,0.1)] mb-4">
                    <Icon className="w-5 h-5 text-[#8B5CF6]" />
                  </div>
                  <h3 className="text-base font-semibold text-[#FAFAFA] mb-2">{cap.title}</h3>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">{cap.description}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
