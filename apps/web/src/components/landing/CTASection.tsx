import Link from 'next/link';
import { ArrowRight, Github } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote:
      'Siza generates components that actually match our design system. No more copy-pasting from Shadcn and manually tweaking every prop.',
    name: 'Maya Chen',
    role: 'Senior Frontend Engineer',
    initials: 'MC',
  },
  {
    quote:
      'BYOK means I can use my own Anthropic credits. The quality difference vs generic AI tools is night and day — TypeScript, tests, everything.',
    name: 'Arjun Patel',
    role: 'Full-Stack Developer',
    initials: 'AP',
  },
  {
    quote:
      'The post-gen scorecard is the killer feature. I know immediately if what was generated is production-ready or needs work.',
    name: 'Sofia Larsson',
    role: 'Tech Lead',
    initials: 'SL',
  },
];

const STATS = [
  { value: '10k+', label: 'Components Generated' },
  { value: 'MIT', label: 'Open Source License' },
  { value: 'BYOK', label: 'Bring Your Own Key' },
  { value: '100%', label: 'Self-Hostable' },
];

export function CTASection() {
  return (
    <section className="relative border-t border-[#27272A] overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.15), transparent 70%)',
        }}
      />

      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-20 py-20 sm:py-24 lg:py-32">
        <div className="relative z-10">
          {/* Stat row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#27272A] rounded-xl overflow-hidden mb-20">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-[#121214] px-6 py-6 text-center">
                <div className="text-2xl font-extrabold tracking-[-0.02em] text-violet-400">
                  {stat.value}
                </div>
                <div className="text-xs text-[#71717A] mt-1 font-mono tracking-[0.1em] uppercase">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-[#27272A] bg-[#18181B] p-6 flex flex-col gap-4"
              >
                <p className="text-sm text-[#A1A1AA] leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-semibold text-violet-300">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#FAFAFA]">{t.name}</div>
                    <div className="text-xs text-[#71717A]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.02em] text-center mb-6">
            Start building{' '}
            <span className="bg-gradient-to-r from-violet-500 via-violet-300 to-blue-400 bg-clip-text text-transparent">
              the right way
            </span>
          </h2>

          <p className="text-lg text-[#A1A1AA] text-center max-w-xl mx-auto mb-10">
            Full-stack generation with architecture, security, and quality built in. Open source,
            MIT licensed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-8 py-3 text-sm font-medium inline-flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 shadow-[0_0_24px_rgba(139,92,246,0.25)] hover:shadow-[0_0_32px_rgba(139,92,246,0.35)]"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/Forge-Space"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#27272A] rounded-lg px-8 py-3 text-sm font-medium text-[#FAFAFA] hover:bg-[#27272A]/50 inline-flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5"
            >
              <Github className="w-4 h-4" />
              View on GitHub
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm text-[#A1A1AA]">
            <Link href="/pricing" className="hover:text-[#FAFAFA] transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="hover:text-[#FAFAFA] transition-colors">
              About
            </Link>
            <Link href="/roadmap" className="hover:text-[#FAFAFA] transition-colors">
              Roadmap
            </Link>
            <Link href="/docs" className="hover:text-[#FAFAFA] transition-colors">
              Docs
            </Link>
          </div>

          <p className="text-sm text-[#71717A] text-center mt-6">
            Open source. MIT License. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}
