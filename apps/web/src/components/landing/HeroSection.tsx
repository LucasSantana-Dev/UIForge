'use client';

import { ArrowRight, BookOpen } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CONTAINER } from './constants';

const DEMO_STEPS = [
  {
    label: 'prompt',
    lines: ['$ siza generate --component ProductCard', '  > Analyzing context...'],
  },
  {
    label: 'generating',
    lines: [
      '  > Generating component...',
      '',
      'import { Badge } from "@/components/ui/badge";',
      'import { Card, CardContent } from "@/components/ui/card";',
      '',
      'export function ProductCard({ product }: Props) {',
      '  return (',
      '    <Card className="group hover:shadow-lg transition-all">',
      '      <CardContent className="p-4">',
      '        <Badge variant="secondary">{product.category}</Badge>',
      '        <h3 className="mt-2 font-semibold">{product.name}</h3>',
      '        <p className="text-sm text-muted-foreground">{product.price}</p>',
      '      </CardContent>',
      '    </Card>',
      '  );',
      '}',
    ],
  },
  {
    label: 'done',
    lines: [
      '',
      '  ✓ Component generated (847ms)',
      '  ✓ TypeScript types inferred',
      '  ✓ Tests scaffolded',
    ],
  },
];

function AnimatedCodeDemo() {
  const [stepIdx, setStepIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [displayed, setDisplayed] = useState<string[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const step = DEMO_STEPS[stepIdx];
    if (!step) return;

    const currentLine = step.lines[lineIdx] ?? '';
    const isLastLine = lineIdx >= step.lines.length - 1;
    const isLastStep = stepIdx >= DEMO_STEPS.length - 1;

    if (charIdx < currentLine.length) {
      timeoutRef.current = setTimeout(() => {
        setCharIdx((c) => c + 1);
      }, 18);
    } else {
      // line complete
      const newDisplayed = [...displayed, currentLine];
      timeoutRef.current = setTimeout(
        () => {
          setDisplayed(newDisplayed);
          if (isLastLine) {
            if (isLastStep) {
              // reset after pause
              timeoutRef.current = setTimeout(() => {
                setStepIdx(0);
                setLineIdx(0);
                setCharIdx(0);
                setDisplayed([]);
              }, 3200);
            } else {
              setStepIdx((s) => s + 1);
              setLineIdx(0);
              setCharIdx(0);
            }
          } else {
            setLineIdx((l) => l + 1);
            setCharIdx(0);
          }
        },
        isLastLine && isLastStep ? 0 : 60
      );
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx, lineIdx, charIdx]);

  const step = DEMO_STEPS[stepIdx];
  const currentLine = step?.lines[lineIdx] ?? '';
  const partialLine = currentLine.slice(0, charIdx);

  return (
    <div className="max-w-3xl mx-auto rounded-xl border border-[#27272A] bg-[#18181B] overflow-hidden mt-16 shadow-[0_8px_48px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272A]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <span className="ml-2 text-xs text-[#71717A] font-mono">Terminal</span>
      </div>
      <div className="p-5 font-mono text-[13px] leading-relaxed min-h-[220px]">
        {displayed.map((line, i) => (
          <div
            key={i}
            className={
              line.startsWith('  ✓')
                ? 'text-emerald-400'
                : line.startsWith('  >')
                  ? 'text-violet-400'
                  : line.startsWith('$')
                    ? 'text-[#FAFAFA]'
                    : 'text-[#A1A1AA]'
            }
          >
            {line || '\u00A0'}
          </div>
        ))}
        {partialLine !== undefined && (
          <div
            className={
              partialLine.startsWith('  ✓')
                ? 'text-emerald-400'
                : partialLine.startsWith('  >')
                  ? 'text-violet-400'
                  : partialLine.startsWith('$')
                    ? 'text-[#FAFAFA]'
                    : 'text-[#A1A1AA]'
            }
          >
            {partialLine}
            <span className="inline-block w-[2px] h-[14px] bg-violet-400 align-middle ml-[1px] animate-[cursor-blink_1s_step-end_infinite]" />
          </div>
        )}
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Sharp 1px dot grid — no blur */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Single static radial glow, no animation */}
      <div
        className="absolute w-[600px] h-[400px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.12), transparent 70%)',
        }}
      />

      <div className={`${CONTAINER} relative z-10 text-center`}>
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-mono text-violet-300">
          <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          1,200+ developers generating
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-[-0.02em] leading-[1.05] mt-6">
          Generate production-grade
          <br />
          <span className="text-violet-400">UI code</span> with AI
        </h1>

        <p className="text-lg text-[#A1A1AA] max-w-2xl mx-auto mt-6">
          Siza generates quality React, Next.js, and Vue components&nbsp;— not generic AI slop.
          Bring your own API key, choose your model, and ship faster.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <a
            href="/signup"
            className="inline-flex items-center gap-2 bg-violet-600 text-white rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200 hover:bg-violet-500 hover:-translate-y-0.5"
          >
            Start Generating Free
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="/docs"
            className="inline-flex items-center gap-2 border border-[#27272A] rounded-lg px-6 py-3 text-sm font-medium text-[#FAFAFA] hover:bg-violet-500/5 hover:border-violet-500/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            <BookOpen className="w-4 h-4" />
            Read the Docs
          </a>
        </div>

        <AnimatedCodeDemo />
      </div>
    </section>
  );
}
