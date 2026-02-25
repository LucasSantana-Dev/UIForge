'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { FadeIn } from './FadeIn';
import { CONTAINER, SECTION_PADDING } from './constants';

const CODE_TEXT = `import { Gateway } from '@siza/gateway'

export const gateway = new Gateway({
  providers: {
    anthropic: { model: 'claude-sonnet-4-20250514' },
    openai: { model: 'gpt-4o' },
    google: { model: 'gemini-2.0-flash' },
  },
  routing: {
    strategy: 'cost-optimized',
    fallback: true,
  },
})`;

const kw = 'color:#8B5CF6';
const str = 'color:#22C55E';
const prop = 'color:#60A5FA';
const def = 'color:#FAFAFA';

const CODE_HTML = [
  `<span style="${kw}">import</span>`,
  `<span style="${def}"> { Gateway } </span>`,
  `<span style="${kw}">from</span>`,
  `<span style="${str}"> '@siza/gateway'</span>`,
  '\n\n',
  `<span style="${kw}">export const</span>`,
  `<span style="${def}"> gateway = </span>`,
  `<span style="${kw}">new</span>`,
  `<span style="${def}"> Gateway({</span>`,
  '\n',
  `<span style="${def}">  </span>`,
  `<span style="${prop}">providers</span>`,
  `<span style="${def}">: {</span>`,
  '\n',
  `<span style="${def}">    </span>`,
  `<span style="${prop}">anthropic</span>`,
  `<span style="${def}">: { </span>`,
  `<span style="${prop}">model</span>`,
  `<span style="${def}">: </span>`,
  `<span style="${str}">'claude-sonnet-4-20250514'</span>`,
  `<span style="${def}"> },</span>`,
  '\n',
  `<span style="${def}">    </span>`,
  `<span style="${prop}">openai</span>`,
  `<span style="${def}">: { </span>`,
  `<span style="${prop}">model</span>`,
  `<span style="${def}">: </span>`,
  `<span style="${str}">'gpt-4o'</span>`,
  `<span style="${def}"> },</span>`,
  '\n',
  `<span style="${def}">    </span>`,
  `<span style="${prop}">google</span>`,
  `<span style="${def}">: { </span>`,
  `<span style="${prop}">model</span>`,
  `<span style="${def}">: </span>`,
  `<span style="${str}">'gemini-2.0-flash'</span>`,
  `<span style="${def}"> },</span>`,
  '\n',
  `<span style="${def}">  },</span>`,
  '\n',
  `<span style="${def}">  </span>`,
  `<span style="${prop}">routing</span>`,
  `<span style="${def}">: {</span>`,
  '\n',
  `<span style="${def}">    </span>`,
  `<span style="${prop}">strategy</span>`,
  `<span style="${def}">: </span>`,
  `<span style="${str}">'cost-optimized'</span>`,
  `<span style="${def}">,</span>`,
  '\n',
  `<span style="${def}">    </span>`,
  `<span style="${prop}">fallback</span>`,
  `<span style="${def}">: </span>`,
  `<span style="${kw}">true</span>`,
  `<span style="${def}">,</span>`,
  '\n',
  `<span style="${def}">  },</span>`,
  '\n',
  `<span style="${def}">})</span>`,
].join('');

const FEATURES = [
  'Unified API across OpenAI, Anthropic, Google, and 9 more',
  'Automatic failover with intelligent load balancing',
  'Built-in rate limiting and usage tracking',
  'Type-safe TypeScript SDK with full IntelliSense',
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
            <div className="text-sm font-mono text-[#7C3AED] mb-4">{'// TypeScript SDK'}</div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#FAFAFA] mb-6">
              One gateway.
              <br />
              Every AI provider.
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
          <div className="rounded-xl border border-[#27272A] bg-[#18181B] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272A]">
              <span className="text-[13px] font-mono text-[#71717A]">gateway.config.ts</span>
              <button
                onClick={handleCopy}
                className="text-[#71717A] hover:text-[#FAFAFA] transition-colors p-1"
                aria-label={copied ? 'Copied' : 'Copy code'}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="p-5 overflow-x-auto">
              <pre>
                <code
                  className="font-mono text-[13px] leading-[1.65]"
                  dangerouslySetInnerHTML={{ __html: CODE_HTML }}
                />
              </pre>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
