'use client';

import { Sparkles, Layers, FolderOpen, LayoutGrid, Settings, CreditCard } from 'lucide-react';
import { FadeIn } from './FadeIn';
import { CONTAINER, SECTION_PADDING } from './constants';

export function DashboardPreview() {
  return (
    <section className={`${SECTION_PADDING} border-t border-[#27272A]`}>
      <div className={CONTAINER}>
        <div className="text-center">
          <div className="text-sm font-mono text-[#7C3AED] tracking-wider uppercase mb-4">
            Preview
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#FAFAFA] mb-4">
            Your AI workspace
          </h2>
          <p className="text-lg text-[#A1A1AA] max-w-2xl mx-auto mb-14">
            A clean, focused interface designed for speed and precision.
          </p>
        </div>

        <FadeIn>
          <div
            className="max-w-4xl mx-auto rounded-xl border border-[#27272A] overflow-hidden"
            style={{
              boxShadow: '0 0 60px rgba(124,58,237,0.08)',
            }}
          >
            <div className="flex items-center gap-2 px-4 py-3 bg-[#18181B] border-b border-[#27272A]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#3F3F46]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#3F3F46]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#3F3F46]" />
              </div>
              <div className="text-xs text-[#71717A] font-mono mx-auto">siza.dev/generate</div>
            </div>

            <div className="flex min-h-[400px] bg-[#121214]">
              <div className="w-[200px] border-r border-[#27272A] p-4 hidden sm:block">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#71717A]">
                  <Sparkles className="w-4 h-4" />
                  <span>Generate</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-[rgba(124,58,237,0.1)] text-[#8B5CF6] border-l-2 border-[#7C3AED]">
                  <Layers className="w-4 h-4" />
                  <span>Components</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#71717A]">
                  <FolderOpen className="w-4 h-4" />
                  <span>Projects</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#71717A]">
                  <LayoutGrid className="w-4 h-4" />
                  <span>Templates</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#71717A]">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#71717A]">
                  <CreditCard className="w-4 h-4" />
                  <span>Billing</span>
                </div>
              </div>

              <div className="flex-1 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-[#FAFAFA]">Components</h3>
                  <span className="text-xs bg-[rgba(124,58,237,0.1)] text-[#8B5CF6] rounded-md px-2 py-0.5">
                    24 items
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-lg border border-[#27272A] bg-[#18181B] p-4">
                    <div className="text-sm font-medium text-[#FAFAFA] mb-3">Button</div>
                    <div className="flex gap-2">
                      <div className="h-7 w-16 rounded bg-[#7C3AED]" />
                      <div className="h-7 w-16 rounded border border-[#27272A]" />
                    </div>
                  </div>
                  <div className="rounded-lg border border-[#27272A] bg-[#18181B] p-4">
                    <div className="text-sm font-medium text-[#FAFAFA] mb-3">Badge</div>
                    <div className="flex gap-2">
                      <div className="h-5 w-12 rounded-full bg-[#3F3F46]" />
                      <div className="h-5 w-12 rounded-full bg-[#3F3F46]" />
                      <div className="h-5 w-12 rounded-full bg-[#3F3F46]" />
                    </div>
                  </div>
                  <div className="rounded-lg border border-[#27272A] bg-[#18181B] p-4">
                    <div className="text-sm font-medium text-[#FAFAFA] mb-3">Input</div>
                    <div className="h-9 rounded border border-[#27272A] bg-[#121214]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
