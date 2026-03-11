'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { AmbientVideoBackground } from '@/components/migration/ambient-video-background';
import { EASE_SIZA, CONTAINER } from './constants';

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const particles = useMemo(() => {
    const seed = (i: number) => {
      const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      top: `${seed(i * 7) * 100}%`,
      left: `${seed(i * 13) * 100}%`,
      size: seed(i * 19) > 0.5 ? 2 : 3,
      opacity: 0.15 + seed(i * 23) * 0.15,
      duration: 15 + seed(i * 29) * 15,
      delay: seed(i * 31) * 10,
    }));
  }, []);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <AmbientVideoBackground />
      <div
        className="absolute w-[1000px] h-[1000px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            'conic-gradient(from 0deg, rgba(139,92,246,0.20), rgba(6,182,212,0.10), rgba(99,102,241,0.16), rgba(139,92,246,0.20))',
          filter: 'blur(90px)',
          animation: 'mesh-rotate 60s linear infinite',
        }}
      />

      <div
        className="absolute w-[600px] h-[600px] left-[20%] top-[30%] -translate-x-1/2 -translate-y-1/2"
        style={{
          background: 'radial-gradient(ellipse, rgba(6,182,212,0.12), transparent 70%)',
          filter: 'blur(60px)',
          animation: 'mesh-rotate 90s linear infinite reverse',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.18) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {mounted &&
        particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-violet-500"
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
        className="absolute w-[700px] h-[500px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.25), transparent 65%)',
          animation: 'pulse-glow 4s ease-in-out infinite',
        }}
      />

      <div className={`${CONTAINER} relative z-10 text-center`}>
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: EASE_SIZA }}
          className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-mono text-violet-300"
        >
          <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          Now in Public Beta
        </motion.div>

        <motion.h1
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: EASE_SIZA, delay: 0.1 }
          }
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mt-6"
        >
          Generate <span className="shimmer-text">production-grade</span>
          <br />
          UI code with AI
        </motion.h1>

        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: EASE_SIZA, delay: 0.2 }
          }
          className="text-lg text-muted-foreground max-w-2xl mx-auto mt-6"
        >
          Siza generates quality React, Next.js, and Vue components, not generic AI slop. Bring your
          own API key, choose your model, and ship faster.
        </motion.p>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: EASE_SIZA, delay: 0.3 }
          }
          className="flex flex-col sm:flex-row gap-4 justify-center mt-10"
        >
          <motion.div
            whileHover={prefersReducedMotion ? undefined : { y: -2 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            className="inline-flex"
          >
            <Link
              href="/signup"
              className="group relative inline-flex items-center gap-2 bg-violet-600 text-white rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200 hover:bg-violet-500 shadow-[0_0_24px_rgba(139,92,246,0.3)] hover:shadow-[0_0_32px_rgba(139,92,246,0.45)] overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative">Start Generating Free</span>
              <ArrowRight className="relative w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
          <motion.div
            whileHover={prefersReducedMotion ? undefined : { y: -2 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            className="inline-flex"
          >
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 border border-border rounded-lg px-6 py-3 text-sm font-medium text-foreground hover:bg-violet-500/5 hover:border-violet-500/40 transition-all duration-200"
            >
              <BookOpen className="w-4 h-4" />
              Read the Docs
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: EASE_SIZA, delay: 0.5 }
          }
          whileHover={prefersReducedMotion ? undefined : { y: -2 }}
          className="max-w-4xl mx-auto rounded-xl border border-border bg-surface overflow-hidden mt-16 shadow-card hover:shadow-card-hover transition-all duration-300"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-60" />
            <span className="ml-3 text-xs text-subtle font-mono">
              siza generate --component ProductCard
            </span>
          </div>
          <div className="p-5 font-mono text-[13px] leading-relaxed">
            <div>
              <span className="text-subtle">{'// Generated by Siza AI — Claude 3.5 Sonnet'}</span>
            </div>
            <div>
              <span className="text-violet-400">export function</span>{' '}
              <span className="text-info">ProductCard</span>{' '}
              <span className="text-subtle">{'({ product }: Props) {'}</span>
            </div>
            <div>
              <span className="text-violet-400">return</span>{' '}
              <span className="text-subtle">
                {'(<Card className="group hover:shadow-lg transition-all">)'}
              </span>
            </div>
            <div>
              <span className="text-subtle">
                {'<Badge variant="secondary">{product.category}</Badge>'}
              </span>
            </div>
            <div>
              <span className="text-subtle">{'<h3>{product.name}</h3>'}</span>
            </div>
            <div>
              <span
                className="inline-block w-2 h-4 bg-violet-500"
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
