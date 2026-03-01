'use client';

import Link from 'next/link';
import { ArrowRight, Github } from 'lucide-react';
import { FadeIn } from './FadeIn';

interface CTASectionProps {
  user: { id: string } | null;
}

export function CTASection({ user }: CTASectionProps) {
  return (
    <section className="relative border-t border-[#27272A] overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.20), transparent 70%)',
        }}
      />

      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-20 py-20 sm:py-24 lg:py-32">
        <FadeIn>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-6">
              Start building{' '}
              <span className="bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#6366F1] bg-clip-text text-transparent">
                the right way
              </span>
            </h2>

            <p className="text-lg text-[#A1A1AA] text-center max-w-xl mx-auto mb-10">
              Full-stack generation with architecture, security, and quality built in. Open source,
              MIT licensed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={user ? '/generate' : '/signup'}
                className="bg-[#7C3AED] hover:bg-[#8B5CF6] text-white rounded-lg px-8 py-3 text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors"
              >
                {user ? 'Go to Dashboard' : 'Get Started Free'}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="https://github.com/Forge-Space"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#27272A] rounded-lg px-8 py-3 text-sm font-medium text-[#FAFAFA] hover:bg-[#27272A]/50 inline-flex items-center justify-center gap-2 transition-colors"
              >
                <Github className="w-4 h-4" />
                View on GitHub
              </Link>
            </div>

            <p className="text-sm text-[#71717A] text-center mt-6">
              Open source. MIT License. No credit card required.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
