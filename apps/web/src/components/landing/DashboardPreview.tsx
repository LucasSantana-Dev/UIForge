import { Sparkles, Layers, FolderOpen, LayoutGrid, Settings, CreditCard } from 'lucide-react';
import { CONTAINER, SECTION_PADDING } from './constants';

export function DashboardPreview() {
  return (
    <section id="preview" className={`${SECTION_PADDING} border-t border-[#27272A]`}>
      <div className={CONTAINER}>
        <div className="text-center">
          <div className="text-sm font-mono text-violet-400 tracking-[0.15em] uppercase mb-4">
            Preview
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.02em] text-[#FAFAFA] mb-4">
            Your AI workspace
          </h2>
          <p className="text-lg text-[#A1A1AA] max-w-2xl mx-auto mb-14">
            A clean, focused interface designed for speed and precision.
          </p>
        </div>

        <div
          className="max-w-4xl mx-auto rounded-xl border border-[#27272A] overflow-hidden"
          style={{ boxShadow: '0 0 60px rgba(139,92,246,0.08)' }}
        >
          <div className="flex items-center gap-2 px-4 py-3 bg-[#18181B] border-b border-[#27272A]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <div className="text-xs text-[#A1A1AA] font-mono mx-auto">
              siza.forgespace.co/generate
            </div>
          </div>

          <div className="flex min-h-[400px] bg-[#121214]">
            <div className="w-[200px] border-r border-[#27272A] p-4 hidden sm:block">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#A1A1AA]">
                <Sparkles className="w-4 h-4" />
                <span>Generate</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-violet-500/15 text-violet-300 border-l-2 border-violet-500">
                <Layers className="w-4 h-4" />
                <span>Components</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#A1A1AA]">
                <FolderOpen className="w-4 h-4" />
                <span>Projects</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#A1A1AA]">
                <LayoutGrid className="w-4 h-4" />
                <span>Templates</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#A1A1AA]">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#A1A1AA]">
                <CreditCard className="w-4 h-4" />
                <span>Billing</span>
              </div>
            </div>

            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#FAFAFA]">Components</h3>
                <span className="text-xs bg-violet-500/15 text-violet-300 rounded-md px-2 py-0.5">
                  24 items
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Button card — real interactive buttons */}
                <div className="rounded-lg border border-[#27272A] bg-[#18181B] p-4">
                  <div className="text-xs font-mono text-[#71717A] mb-3">Button</div>
                  <div className="flex flex-wrap gap-2">
                    <button className="inline-flex items-center rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500 transition-colors">
                      Primary
                    </button>
                    <button className="inline-flex items-center rounded-md border border-[#27272A] px-3 py-1.5 text-xs font-medium text-[#A1A1AA] hover:border-violet-500/40 hover:text-[#FAFAFA] transition-colors">
                      Outline
                    </button>
                    <button className="inline-flex items-center rounded-md bg-[#27272A] px-3 py-1.5 text-xs font-medium text-[#A1A1AA] hover:bg-[#3F3F46] transition-colors">
                      Ghost
                    </button>
                  </div>
                </div>

                {/* Badge card — real text badges */}
                <div className="rounded-lg border border-[#27272A] bg-[#18181B] p-4">
                  <div className="text-xs font-mono text-[#71717A] mb-3">Badge</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-violet-500/15 border border-violet-500/25 px-2.5 py-0.5 text-[11px] font-medium text-violet-300">
                      New
                    </span>
                    <span className="inline-flex items-center rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                      Stable
                    </span>
                    <span className="inline-flex items-center rounded-full bg-amber-500/15 border border-amber-500/25 px-2.5 py-0.5 text-[11px] font-medium text-amber-300">
                      Beta
                    </span>
                    <span className="inline-flex items-center rounded-full bg-zinc-500/15 border border-zinc-500/25 px-2.5 py-0.5 text-[11px] font-medium text-zinc-400">
                      Deprecated
                    </span>
                  </div>
                </div>

                {/* Input card — real styled input */}
                <div className="rounded-lg border border-[#27272A] bg-[#18181B] p-4">
                  <div className="text-xs font-mono text-[#71717A] mb-3">Input</div>
                  <div className="space-y-2">
                    <input
                      readOnly
                      value=""
                      placeholder="Search components..."
                      className="w-full h-8 rounded-md border border-[#27272A] bg-[#121214] px-3 text-xs text-[#A1A1AA] placeholder:text-[#52525B] focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                    <div className="flex gap-1.5">
                      <input
                        readOnly
                        value=""
                        placeholder="Label"
                        className="flex-1 h-7 rounded border border-[#27272A] bg-[#121214] px-2 text-[11px] text-[#A1A1AA] placeholder:text-[#52525B]"
                      />
                      <input
                        readOnly
                        value=""
                        placeholder="Value"
                        className="flex-1 h-7 rounded border border-[#27272A] bg-[#121214] px-2 text-[11px] text-[#A1A1AA] placeholder:text-[#52525B]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
