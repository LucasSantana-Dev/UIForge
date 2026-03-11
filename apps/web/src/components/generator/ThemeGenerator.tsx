'use client';

import { useMemo, useState } from 'react';
import { SparklesIcon, SaveIcon, PaintbrushIcon } from 'lucide-react';
import type { DesignContextValues } from './DesignContext';
import {
  THEME_GENERATOR_PRESETS,
  generateThemeFromInput,
  type ThemeGeneratorPreset,
} from '@/lib/themes/generator';
import { useThemeStore } from '@/stores/theme-store';

interface ThemeGeneratorProps {
  readonly projectId: string;
  readonly values: DesignContextValues;
  readonly onApply: (values: DesignContextValues) => void;
}

function buildThemeName(preset: ThemeGeneratorPreset): string {
  const label = THEME_GENERATOR_PRESETS.find((item) => item.value === preset)?.label ?? 'Theme';
  const stamp = new Date().toISOString().slice(0, 10);
  return `${label} ${stamp}`;
}

export function ThemeGenerator({ projectId, values, onApply }: ThemeGeneratorProps) {
  const [preset, setPreset] = useState<ThemeGeneratorPreset>('balanced');
  const [seedColor, setSeedColor] = useState(values.primaryColor);
  const [mood, setMood] = useState('');
  const createTheme = useThemeStore((state) => state.createTheme);
  const setActiveTheme = useThemeStore((state) => state.setActiveTheme);

  const generated = useMemo(
    () =>
      generateThemeFromInput({
        preset,
        seedColor,
        mood,
      }),
    [preset, seedColor, mood]
  );

  const handleApply = () => {
    onApply(generated);
  };

  const handleSave = () => {
    const name = buildThemeName(preset);
    const themeId = createTheme({ name, ...generated });
    setActiveTheme(projectId, themeId);
    onApply(generated);
  };

  return (
    <div className="rounded-lg border border-surface-3 bg-surface-1 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text-primary">
          <PaintbrushIcon className="h-4 w-4 text-brand" />
          Theme Generator
        </span>
        <span className="text-xs text-text-muted">Deterministic</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label
            htmlFor="theme-generator-preset"
            className="block text-xs font-medium text-text-secondary mb-1"
          >
            Preset
          </label>
          <select
            id="theme-generator-preset"
            value={preset}
            onChange={(event) => setPreset(event.target.value as ThemeGeneratorPreset)}
            className="w-full px-2.5 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
          >
            {THEME_GENERATOR_PRESETS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="theme-generator-seed"
            className="block text-xs font-medium text-text-secondary mb-1"
          >
            Seed Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={seedColor}
              onChange={(event) => setSeedColor(event.target.value)}
              className="h-9 w-10 rounded border border-surface-3 bg-surface-1 p-0.5"
            />
            <input
              id="theme-generator-seed"
              value={seedColor}
              onChange={(event) => setSeedColor(event.target.value)}
              className="flex-1 px-2.5 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
            />
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="theme-generator-mood"
          className="block text-xs font-medium text-text-secondary mb-1"
        >
          Mood
        </label>
        <input
          id="theme-generator-mood"
          value={mood}
          onChange={(event) => setMood(event.target.value)}
          placeholder="calm, bold, professional, playful..."
          className="w-full px-2.5 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
        />
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <span
          className="h-7 rounded-md border border-surface-3"
          style={{ background: generated.primaryColor }}
        />
        <span
          className="h-7 rounded-md border border-surface-3"
          style={{ background: generated.secondaryColor }}
        />
        <span
          className="h-7 rounded-md border border-surface-3"
          style={{ background: generated.accentColor }}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleApply}
          className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-light transition-colors"
        >
          <SparklesIcon className="h-3.5 w-3.5" />
          Apply
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 rounded-md border border-surface-3 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-brand/50 transition-colors"
        >
          <SaveIcon className="h-3.5 w-3.5" />
          Save Theme
        </button>
      </div>
    </div>
  );
}
