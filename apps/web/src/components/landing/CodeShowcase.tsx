'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { CONTAINER, SECTION_PADDING } from './constants';

interface TreeLine {
  prefix: string;
  name: string;
  comment?: string;
  highlight?: string;
}

const TREE_LINES: TreeLine[] = [
  { prefix: '', name: 'my-saas/', highlight: 'violet' },
  { prefix: '├── ', name: 'src/', highlight: 'blue' },
  { prefix: '│   ├── ', name: 'app/', comment: '# Next.js App Router', highlight: 'blue' },
  { prefix: '│   ├── ', name: 'services/', comment: '# Business logic layer', highlight: 'blue' },
  { prefix: '│   ├── ', name: 'repositories/', comment: '# Data access layer', highlight: 'blue' },
  {
    prefix: '│   ├── ',
    name: 'middleware/',
    comment: '# Auth, rate-limit, logging',
    highlight: 'blue',
  },
  { prefix: '│   └── ', name: 'lib/', highlight: 'blue' },
  {
    prefix: '│       ├── ',
    name: 'security/',
    comment: '# BYOK, input validation',
    highlight: 'emerald',
  },
  {
    prefix: '│       └── ',
    name: 'quality/',
    comment: '# Anti-generic, a11y',
    highlight: 'emerald',
  },
  { prefix: '├── ', name: 'tests/', comment: '# 80%+ coverage target', highlight: 'amber' },
  { prefix: '├── ', name: 'supabase/', comment: '# Migrations, RLS policies', highlight: 'blue' },
  { prefix: '└── ', name: '.github/', comment: '# CI/CD, security scan', highlight: 'blue' },
];

const CODE_TEXT = TREE_LINES.map((l) =>
  [l.prefix + l.name, l.comment].filter(Boolean).join('   ')
).join('\n');

const highlightClasses: Record<string, string> = {
  violet: 'bg-violet-500/10 text-violet-300',
  blue: 'bg-blue-500/10 text-blue-300',
  emerald: 'bg-emerald-500/10 text-emerald-300',
  amber: 'bg-amber-500/10 text-amber-300',
};

const defaultDirClass = 'text-[#60A5FA]';
const highlightDirClass: Record<string, string> = {
  violet: 'text-violet-300',
  blue: 'text-blue-300',
  emerald: 'text-emerald-300',
  amber: 'text-amber-300',
};

const FEATURES = [
  'Architecture patterns baked in — service layers, repositories, middleware',
  'Security from line one — BYOK encryption, RLS policies, input validation',
  'Quality gates included — anti-generic detection, accessibility audit',
  'Full CI/CD pipeline — lint, build, test, security scan, deploy',
];

export function CodeShowcase() {
  const [copied, setCopied] = useState(false);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(CODE_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className={`${SECTION_PADDING} border-t border-[#27272A]`}>
      <div className={`${CONTAINER} grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`}>
        <div>
          <div className="text-sm font-mono text-violet-400 mb-4">{'// npx create-siza-app'}</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#FAFAFA] mb-6">
            Your next project.
            <br />
            Properly structured.
          </h2>
          <div>
            {FEATURES.map((feature) => (
              <div key={feature} className="flex items-start gap-3 mb-4">
                <Check className="w-5 h-5 text-[#22C55E] mt-0.5 flex-shrink-0" />
                <p className="text-[#A1A1AA] text-sm leading-relaxed">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#27272A] bg-[#18181B] overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272A]">
            <span className="text-[13px] font-mono text-[#A1A1AA]">project structure</span>
            <button
              onClick={handleCopy}
              className="text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors p-1 rounded hover:bg-[#27272A]"
              aria-label={copied ? 'Copied' : 'Copy code'}
            >
              {copied ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="p-5 overflow-x-auto">
            <pre className="font-mono text-[13px] leading-[1.65] select-none">
              {TREE_LINES.map((line, i) => {
                const isRoot = i === 0;
                const isHovered = hoveredLine === i;
                const hl = line.highlight ?? 'blue';
                const rowBg = isHovered ? highlightClasses[hl] : '';
                const dirColor = isHovered
                  ? (highlightDirClass[hl] ?? defaultDirClass)
                  : defaultDirClass;
                const rootColor = isHovered ? 'text-violet-300' : 'text-[#a78bfa]';

                return (
                  <span
                    key={i}
                    role="presentation"
                    className={`flex items-baseline rounded px-1 -mx-1 cursor-default transition-colors duration-100 ${rowBg}`}
                    onMouseEnter={() => setHoveredLine(i)}
                    onMouseLeave={() => setHoveredLine(null)}
                  >
                    {!isRoot && (
                      <span className="text-[#A1A1AA] whitespace-pre">{line.prefix}</span>
                    )}
                    <span className={isRoot ? rootColor : dirColor}>{line.name}</span>
                    {line.comment && (
                      <span className="text-[#52525B] ml-1 whitespace-pre">
                        {'   '}
                        {line.comment}
                      </span>
                    )}
                    {'\n'}
                  </span>
                );
              })}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
