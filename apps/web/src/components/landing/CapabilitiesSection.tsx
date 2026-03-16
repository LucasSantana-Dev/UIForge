import { Layers, GitFork, ShieldCheck, CheckSquare, Boxes, Brain } from 'lucide-react';
import { CONTAINER, SECTION_PADDING } from './constants';

const capabilities = [
  {
    icon: Layers,
    title: 'Architecture-First',
    description:
      'Service layers, repositories, middleware — every scaffold follows patterns that scale.',
    artifact: (
      <pre className="font-mono text-[11px] leading-relaxed text-[#A1A1AA] mt-3 border border-[#27272A] rounded-lg p-3 bg-[#121214] overflow-hidden">
        <span className="text-violet-400">src/</span>
        {'\n'}
        {'├── '}
        <span className="text-blue-400">services/</span>
        <span className="text-[#52525B]"> # Business logic</span>
        {'\n'}
        {'├── '}
        <span className="text-blue-400">repositories/</span>
        <span className="text-[#52525B]"> # Data access</span>
        {'\n'}
        {'└── '}
        <span className="text-blue-400">middleware/</span>
        <span className="text-[#52525B]"> # Auth, rate-limit</span>
      </pre>
    ),
  },
  {
    icon: ShieldCheck,
    title: 'Security by Default',
    description: 'BYOK encryption, RLS policies, input validation built into every project.',
    artifact: (
      <pre className="font-mono text-[11px] leading-relaxed mt-3 border border-[#27272A] rounded-lg p-3 bg-[#121214] overflow-hidden">
        <span className="text-[#52525B]">{'// BYOK — your key never leaves your infra'}</span>
        {'\n'}
        <span className="text-violet-400">const</span>
        <span className="text-[#FAFAFA]"> client</span>
        {' = '}
        <span className="text-violet-400">new</span>{' '}
        <span className="text-emerald-400">Anthropic</span>
        {'({'}
        {'\n'}
        {'  '}
        <span className="text-[#FAFAFA]">apiKey</span>
        {': '}
        <span className="text-amber-300">process.env.USER_API_KEY</span>
        {'\n'}
        {' });'}
      </pre>
    ),
  },
  {
    icon: CheckSquare,
    title: 'Quality Gates',
    description:
      'Five validation layers before code ships — anti-generic, a11y, coverage, lint, security.',
    artifact: (
      <div className="flex flex-col gap-1.5 mt-3">
        {[
          'Anti-generic detection',
          'Accessibility audit',
          'Diversity tracking',
          '80%+ test coverage',
          'Security scan',
        ].map((label) => (
          <div key={label} className="flex items-center gap-2 text-[11px] font-mono">
            <span className="w-4 h-4 rounded-sm flex items-center justify-center text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
              ✓
            </span>
            <span className="text-[#A1A1AA]">{label}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Boxes,
    title: 'Full-Stack Scaffolds',
    description: 'SaaS, API, monorepo templates with auth, billing, database, and tests.',
    artifact: (
      <div className="flex flex-wrap gap-1.5 mt-3">
        {['SaaS', 'API', 'Monorepo', 'E-commerce', 'Dashboard', 'Landing'].map((t) => (
          <span
            key={t}
            className="inline-flex items-center rounded-md bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-[11px] font-mono text-violet-300"
          >
            {t}
          </span>
        ))}
        {['+ auth', '+ billing', '+ tests'].map((t) => (
          <span
            key={t}
            className="inline-flex items-center rounded-md bg-[#27272A] px-2 py-0.5 text-[11px] font-mono text-[#71717A]"
          >
            {t}
          </span>
        ))}
      </div>
    ),
  },
  {
    icon: Brain,
    title: 'Context-Aware Generation',
    description:
      'MCP-native tools that understand your codebase, brand identity, and design system.',
    artifact: (
      <div className="flex flex-col gap-1.5 mt-3 font-mono text-[11px]">
        <div className="flex items-center gap-2 text-[#A1A1AA]">
          <span className="text-violet-400">▶</span>
          <span className="text-[#71717A]">Reading</span>
          <span className="text-violet-300">design-tokens.json</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400">✓</span>
          <span className="text-[#71717A]">Brand</span>
          <span className="text-[#FAFAFA]">#6D28D9</span>
          <span className="text-[#71717A]">detected</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400">✓</span>
          <span className="text-[#71717A]">Stack</span>
          <span className="text-[#FAFAFA]">Next.js + Tailwind</span>
        </div>
      </div>
    ),
  },
  {
    icon: GitFork,
    title: 'Multi-Provider AI',
    description: '12+ AI providers, single API. Swap models without changing code.',
    artifact: (
      <div className="flex flex-col gap-1.5 mt-3">
        {[
          { name: 'claude-3-5-sonnet', active: true },
          { name: 'gpt-4o', active: false },
          { name: 'gemini-1.5-pro', active: false },
        ].map((m) => (
          <div
            key={m.name}
            className={`flex items-center justify-between rounded-md px-2.5 py-1 text-[11px] font-mono border ${
              m.active
                ? 'border-violet-500/40 bg-violet-500/10 text-violet-300'
                : 'border-[#27272A] bg-[#121214] text-[#52525B]'
            }`}
          >
            <span>{m.name}</span>
            {m.active && (
              <span className="text-[9px] text-violet-400 uppercase tracking-wider">active</span>
            )}
          </div>
        ))}
      </div>
    ),
  },
];

export function CapabilitiesSection() {
  return (
    <section id="capabilities" className={SECTION_PADDING}>
      <div className={CONTAINER}>
        <div className="text-center">
          <p className="text-sm font-mono text-violet-400 tracking-[0.15em] uppercase mb-4">
            Capabilities
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.02em] text-[#FAFAFA] mb-4">
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
                className="group bg-[#18181B] border border-[#27272A] rounded-xl p-5 transition-all duration-200 ease-siza hover:border-violet-500/30 hover:shadow-card-hover flex flex-col"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-violet-500/15 transition-transform duration-200 group-hover:scale-110">
                    <Icon className="w-4 h-4 text-violet-400" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#FAFAFA]">{cap.title}</h3>
                </div>
                <p className="text-xs text-[#71717A] leading-relaxed">{cap.description}</p>
                {cap.artifact}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
