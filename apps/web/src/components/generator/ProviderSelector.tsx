'use client';

import { useMemo } from 'react';
import { CpuIcon, KeyIcon } from 'lucide-react';
import { useHasApiKey } from '@/stores/ai-keys';
import { PROVIDER_MODELS } from '@/lib/services/generation';
import type { AIProvider } from '@/lib/encryption';

const PROVIDER_LABELS: Record<AIProvider, string> = {
  google: 'Google Gemini',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
};

interface ProviderSelectorProps {
  selectedProvider: AIProvider;
  selectedModel: string;
  onProviderChange: (provider: AIProvider) => void;
  onModelChange: (model: string) => void;
  multiLlmEnabled: boolean;
}

export function ProviderSelector({
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
  multiLlmEnabled,
}: ProviderSelectorProps) {
  const hasProviderKey = useHasApiKey(selectedProvider);
  const models = useMemo(() => PROVIDER_MODELS[selectedProvider] || [], [selectedProvider]);

  return (
    <>
      {multiLlmEnabled && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <CpuIcon className="h-4 w-4" />
            AI Provider
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(PROVIDER_LABELS) as AIProvider[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onProviderChange(p)}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  selectedProvider === p
                    ? 'border-brand bg-brand/10 text-brand-light'
                    : 'border-surface-3 text-text-secondary hover:border-surface-3 hover:text-text-primary'
                }`}
              >
                {PROVIDER_LABELS[p]}
              </button>
            ))}
          </div>
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full px-3 py-2 border border-surface-3 rounded-md text-sm focus:ring-brand focus:border-brand"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-md border">
        <KeyIcon className="h-3.5 w-3.5" />
        {hasProviderKey ? (
          <span className="text-green-700">
            Using your {PROVIDER_LABELS[selectedProvider]} API key
          </span>
        ) : selectedProvider === 'google' ? (
          <span className="text-amber-700">
            Using server API key &mdash;{' '}
            <a href="/ai-keys" className="underline">
              add your own
            </a>
          </span>
        ) : (
          <span className="text-red-700">
            API key required &mdash;{' '}
            <a href="/ai-keys" className="underline">
              add your {PROVIDER_LABELS[selectedProvider]} key
            </a>
          </span>
        )}
      </div>
    </>
  );
}

export { PROVIDER_LABELS };
