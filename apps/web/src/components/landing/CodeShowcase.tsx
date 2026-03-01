'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { FadeIn } from './FadeIn';
import { CONTAINER, SECTION_PADDING } from './constants';

const CODE_TEXT = `my-saas/
├── src/
│   ├── app/             # Next.js App Router
│   ├── services/        # Business logic layer
│   ├── repositories/    # Data access layer
│   ├── middleware/       # Auth, rate-limit, logging
│   └── lib/
│       ├── security/    # BYOK, input validation
│       └── quality/     # Anti-generic, a11y
├── tests/               # 80%+ coverage target
├── supabase/            # Migrations, RLS policies
└── .github/             # CI/CD, security scan`;

const dir = 'color:#60A5FA';
const comment = 'color:#71717A';
const tree = 'color:#A1A1AA';
const root = 'color:var(--brand-light)';

const CODE_HTML = [
  `<span style="${root}">my-saas/</span>`,
  '\n',
  `<span style="${tree}">├── </span><span style="${dir}">src/</span>`,
  '\n',
  `<span style="${tree}">│   ├── </span><span style="${dir}">app/</span><span style="${comment}">             # Next.js App Router</span>`,
  '\n',
  `<span style="${tree}">│   ├── </span><span style="${dir}">services/</span><span style="${comment}">        # Business logic layer</span>`,
  '\n',
  `<span style="${tree}">│   ├── </span><span style="${dir}">repositories/</span><span style="${comment}">    # Data access layer</span>`,
  '\n',
  `<span style="${tree}">│   ├── </span><span style="${dir}">middleware/</span><span style="${comment}">       # Auth, rate-limit, logging</span>`,
  '\n',
  `<span style="${tree}">│   └── </span><span style="${dir}">lib/</span>`,
  '\n',
  `<span style="${tree}">│       ├── </span><span style="${dir}">security/</span><span style="${comment}">    # BYOK, input validation</span>`,
  '\n',
  `<span style="${tree}">│       └── </span><span style="${dir}">quality/</span><span style="${comment}">     # Anti-generic, a11y</span>`,
  '\n',
  `<span style="${tree}">├── </span><span style="${dir}">tests/</span><span style="${comment}">               # 80%+ coverage target</span>`,
  '\n',
  `<span style="${tree}">├── </span><span style="${dir}">supabase/</span><span style="${comment}">            # Migrations, RLS policies</span>`,
  '\n',
  `<span style="${tree}">└── </span><span style="${dir}">.github/</span><span style="${comment}">             # CI/CD, security scan</span>`,
].join('');

const FEATURES = [
  'Architecture patterns baked in — service layers, repositories, middleware',
  'Security from line one — BYOK encryption, RLS policies, input validation',
  'Quality gates included — anti-generic detection, accessibility audit',
  'Full CI/CD pipeline — lint, build, test, security scan, deploy',
];

export function CodeShowcase() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(CODE_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className={`${SECTION_PADDING} border-t border-[#27272A]`}>
      <div className={`${CONTAINER} grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`}>
        <FadeIn delay={0}>
          <div>
            <div className="text-sm font-mono text-brand mb-4">{'// npx create-siza-app'}</div>
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
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="rounded-xl border border-[#27272A] bg-[#18181B] overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272A]">
              <span className="text-[13px] font-mono text-[#71717A]">project structure</span>
              <button
                onClick={handleCopy}
                className="text-[#71717A] hover:text-[#FAFAFA] transition-colors p-1 rounded hover:bg-[#27272A]"
                aria-label={copied ? 'Copied' : 'Copy code'}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-[#22C55E]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="p-5 overflow-x-auto">
              <pre>
                <code
                  className="font-mono text-[13px] leading-[1.65]"
                  dangerouslySetInnerHTML={{
                    __html: CODE_HTML,
                  }}
                />
              </pre>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
