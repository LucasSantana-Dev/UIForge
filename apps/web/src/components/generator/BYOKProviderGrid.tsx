'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AI_PROVIDERS, type AIProvider } from '@/lib/encryption';
import { PROVIDER_MODELS } from '@/lib/services/generation';

interface BYOKProviderGridProps {
  selectedProvider: AIProvider | null;
  selectedModel: string;
  onProviderChange: (provider: AIProvider) => void;
  onModelChange: (model: string) => void;
  hasKey: (provider: AIProvider) => boolean;
}

const BYOK_PROVIDERS: AIProvider[] = ['openai', 'anthropic', 'google'];

export function BYOKProviderGrid({
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
  hasKey,
}: BYOKProviderGridProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-surface-3 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between p-3 text-sm text-text-secondary hover:text-text-primary"
      >
        <span>Advanced: Use Your Own Key</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
      </button>

      {expanded && (
        <div className="p-3 pt-0 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {BYOK_PROVIDERS.map((provider) => (
              <button
                key={provider}
                type="button"
                onClick={() => {
                  onProviderChange(provider);
                  const models = PROVIDER_MODELS[provider];
                  if (models?.[0]) onModelChange(models[0].id);
                }}
                className={cn(
                  'rounded-md border p-2 text-xs text-center transition-all',
                  selectedProvider === provider
                    ? 'border-violet-500 bg-violet-500/10 text-text-primary'
                    : 'border-surface-3 text-text-secondary hover:border-surface-4',
                  !hasKey(provider) && 'opacity-50'
                )}
              >
                {AI_PROVIDERS[provider].name}
                {!hasKey(provider) && (
                  <span className="block text-[10px] text-text-muted mt-0.5">No key</span>
                )}
              </button>
            ))}
          </div>

          {selectedProvider && PROVIDER_MODELS[selectedProvider] && (
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="w-full rounded-md border border-surface-3 bg-surface-1 px-2 py-1.5 text-xs text-text-primary"
            >
              {PROVIDER_MODELS[selectedProvider].map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
}
