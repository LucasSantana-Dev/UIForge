'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Github } from 'lucide-react';
import { EASE_SIZA, CONTAINER } from './constants';

interface HeroSectionProps {
  user: { id: string } | null;
}

export function HeroSection({ user }: HeroSectionProps) {
  const particles = useMemo(() => {
    const seed = (i: number) => {
      const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      top: `${seed(i * 7) * 100}%`,
      left: `${seed(i * 13) * 100}%`,
      size: seed(i * 19) > 0.5 ? 2 : 3,
      opacity: 0.15 + seed(i * 23) * 0.15,
      duration: 15 + seed(i * 29) * 15,
      delay: seed(i * 31) * 10,
    }));
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute w-[800px] h-[800px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            'conic-gradient(from 0deg, rgba(124,58,237,0.12), rgba(99,102,241,0.08), rgba(124,58,237,0.12))',
          filter: 'blur(80px)',
          animation: 'mesh-rotate 75s linear infinite',
          opacity: 0.15,
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.6]"
        style={{
          backgroundImage: 'radial-gradient(circle, #27272A 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-[#7C3AED]"
          style={
            {
              width: `${p.size}px`,
              height: `${p.size}px`,
              top: p.top,
              left: p.left,
              opacity: p.opacity,
              animation: `particle-drift ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
              '--drift-x': `${(p.id % 2 === 0 ? 1 : -1) * 20}px`,
              '--drift-y': `${(p.id % 3 === 0 ? 1 : -1) * 15}px`,
              '--particle-opacity': `${p.opacity}`,
            } as React.CSSProperties
          }
        />
      ))}

      <div
        className="absolute w-[600px] h-[400px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.20), transparent 70%)',
          animation: 'pulse-glow 4s ease-in-out infinite',
        }}
      />

      <div className={`${CONTAINER} relative z-10 text-center`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_SIZA }}
          className="inline-flex items-center gap-2 rounded-full border border-[#27272A] bg-[#18181B]/80 px-4 py-1.5 text-xs font-mono text-[#A1A1AA]"
        >
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Open Source &middot; MIT License
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: EASE_SIZA,
            delay: 0.1,
          }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mt-6"
        >
          Vibe code{' '}
          <span className="bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#6366F1] bg-clip-text text-transparent">
            the right way
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: EASE_SIZA,
            delay: 0.2,
          }}
          className="text-lg text-[#A1A1AA] max-w-xl mx-auto mt-6"
        >
          AI-powered full-stack generation with real architecture, security by default, and quality
          gates that catch what linters miss.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: EASE_SIZA,
            delay: 0.3,
          }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-10"
        >
          <Link
            href={user ? '/generate' : '/signin'}
            className="group relative inline-flex items-center gap-2 bg-[#7C3AED] text-white rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200 hover:bg-[#8B5CF6] hover:shadow-[0_8px_24px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative">{user ? 'Go to Dashboard' : 'Get Started Free'}</span>
            <ArrowRight className="relative w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="https://github.com/Forge-Space"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-[#27272A] rounded-lg px-6 py-3 text-sm font-medium text-[#FAFAFA] hover:bg-[#27272A]/50 hover:border-[var(--border-hover)] transition-all duration-200"
          >
            <Github className="w-4 h-4" />
            View on GitHub
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: EASE_SIZA,
            delay: 0.5,
          }}
          className="max-w-2xl mx-auto rounded-xl border border-[#27272A] bg-[#18181B] overflow-hidden mt-16 shadow-card hover:shadow-card-hover transition-all duration-300"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272A]">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-60" />
          </div>
          <div className="p-5 font-mono text-[13px] leading-relaxed">
            <div>
              <span className="text-[#71717A]">$</span>{' '}
              <span className="text-[#FAFAFA]">npx create-siza-app my-saas</span>
            </div>
            <div>
              <span className="text-[#22C55E]">&#10003;</span>{' '}
              <span className="text-[#A1A1AA]">
                Architecture scaffolded (service layers, middleware)
              </span>
            </div>
            <div>
              <span className="text-[#22C55E]">&#10003;</span>{' '}
              <span className="text-[#A1A1AA]">
                Security configured (BYOK, RLS, input validation)
              </span>
            </div>
            <div>
              <span className="text-[#22C55E]">&#10003;</span>{' '}
              <span className="text-[#A1A1AA]">Quality gates enabled (5 validation layers)</span>
            </div>
            <div>
              <span className="text-[#22C55E]">&#10003;</span>{' '}
              <span className="text-[#A1A1AA]">
                CI/CD pipeline ready (lint, test, security scan)
              </span>
            </div>
            <div>
              <span
                className="inline-block w-2 h-4 bg-[#7C3AED]"
                style={{
                  animation: 'cursor-blink 1s step-end infinite',
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
