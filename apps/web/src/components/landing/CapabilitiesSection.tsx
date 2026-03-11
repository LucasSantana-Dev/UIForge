import { Layers, GitFork, ShieldCheck, CheckSquare, Boxes, Brain } from 'lucide-react';
import { CONTAINER, SECTION_PADDING } from './constants';

const capabilities = [
  {
    icon: Layers,
    title: 'Architecture-First',
    description:
      'Service layers, middleware, proper separation of concerns. Every scaffold follows patterns that scale.',
  },
  {
    icon: ShieldCheck,
    title: 'Security by Default',
    description:
      'BYOK encryption, RLS policies, input validation, and SOC 2-ready patterns baked into every project.',
  },
  {
    icon: CheckSquare,
    title: 'Quality Gates',
    description:
      'Anti-generic detection, accessibility audit, diversity tracking. Five validation layers before code ships.',
  },
  {
    icon: Boxes,
    title: 'Full-Stack Scaffolds',
    description:
      'SaaS, API, monorepo templates with auth, billing, database, and tests included. Not just components.',
  },
  {
    icon: Brain,
    title: 'Context-Aware Generation',
    description:
      'MCP-native tools that understand your codebase, brand identity, and design system. No generic output.',
  },
  {
    icon: GitFork,
    title: 'Multi-Provider AI',
    description:
      '12+ AI providers, single API. Swap models without changing code. Automatic failover built in.',
  },
];

const iconColors: Record<string, string> = {
  'Architecture-First': 'text-purple-400',
  'Security by Default': 'text-emerald-400',
  'Quality Gates': 'text-blue-400',
  'Full-Stack Scaffolds': 'text-amber-400',
  'Context-Aware Generation': 'text-indigo-400',
  'Multi-Provider AI': 'text-rose-400',
};

const iconBgs: Record<string, string> = {
  'Architecture-First': 'bg-purple-500/20',
  'Security by Default': 'bg-emerald-500/20',
  'Quality Gates': 'bg-blue-500/20',
  'Full-Stack Scaffolds': 'bg-amber-500/20',
  'Context-Aware Generation': 'bg-indigo-500/20',
  'Multi-Provider AI': 'bg-rose-500/20',
};

export function CapabilitiesSection() {
  return (
    <section id="capabilities" className={SECTION_PADDING}>
      <div className={CONTAINER}>
        <div className="text-center">
          <p className="text-sm font-mono text-violet-400 tracking-wider uppercase mb-4">
            Capabilities
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#FAFAFA] mb-4">
            What makes it different
          </h2>
          <p className="text-lg text-[#A1A1AA] max-w-2xl mx-auto">
            AI generators produce code fast. We produce code that lasts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="group bg-[#18181B] border border-[#27272A] rounded-xl p-6 transition-all duration-200 ease-siza hover:border-violet-500/30 hover:shadow-card-hover"
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-lg ${iconBgs[cap.title] || 'bg-brand/10'} mb-4 transition-transform duration-200 group-hover:scale-110`}
                >
                  <Icon className={`w-5 h-5 ${iconColors[cap.title] || 'text-brand-light'}`} />
                </div>
                <h3 className="text-base font-semibold text-[#FAFAFA] mb-2">{cap.title}</h3>
                <p className="text-sm text-[#A1A1AA] leading-relaxed">{cap.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
