import { ArrowRight, Github } from 'lucide-react';

export function CTASection() {
  return (
    <section className="relative border-t border-[#27272A] overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.20), transparent 70%)',
        }}
      />

      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-20 py-20 sm:py-24 lg:py-32">
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-6">
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
              className="bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-8 py-3 text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors shadow-[0_0_24px_rgba(139,92,246,0.25)] hover:shadow-[0_0_32px_rgba(139,92,246,0.35)]"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/Forge-Space"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#27272A] rounded-lg px-8 py-3 text-sm font-medium text-[#FAFAFA] hover:bg-[#27272A]/50 inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Github className="w-4 h-4" />
              View on GitHub
            </a>
          </div>

          <p className="text-sm text-[#A1A1AA] text-center mt-6">
            Open source. MIT License. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}
