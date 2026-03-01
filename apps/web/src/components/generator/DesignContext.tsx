'use client';

import { PaletteIcon } from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import { ThemeSelector } from './ThemeSelector';
import { useThemeStore } from '@/stores/theme-store';

export type ColorMode = 'dark' | 'light' | 'both';
export type AnimationLevel = 'none' | 'subtle' | 'standard' | 'rich';
export type SpacingLevel = 'compact' | 'default' | 'spacious';
export type BorderRadiusLevel = 'none' | 'small' | 'medium' | 'large' | 'full';
export type TypographyStyle = 'system' | 'sans' | 'serif' | 'mono';

export interface DesignContextValues {
  colorMode: ColorMode;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  animation: AnimationLevel;
  spacing: SpacingLevel;
  borderRadius: BorderRadiusLevel;
  typography: TypographyStyle;
}

export const DESIGN_DEFAULTS: DesignContextValues = {
  colorMode: 'dark',
  primaryColor: '#7C3AED',
  secondaryColor: '#6366F1',
  accentColor: '#22C55E',
  animation: 'subtle',
  spacing: 'default',
  borderRadius: 'medium',
  typography: 'system',
};

interface DesignContextProps {
  projectId: string;
  values: DesignContextValues;
  onChange: (values: DesignContextValues) => void;
}

const COLOR_MODE_OPTIONS: { value: ColorMode; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'both', label: 'Both' },
];

const ANIMATION_OPTIONS: { value: AnimationLevel; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'subtle', label: 'Subtle' },
  { value: 'standard', label: 'Standard' },
  { value: 'rich', label: 'Rich' },
];

const SPACING_OPTIONS: { value: SpacingLevel; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'default', label: 'Default' },
  { value: 'spacious', label: 'Spacious' },
];

const BORDER_RADIUS_OPTIONS: {
  value: BorderRadiusLevel;
  label: string;
  px: string;
}[] = [
  { value: 'none', label: 'None', px: '0' },
  { value: 'small', label: 'Small', px: '4px' },
  { value: 'medium', label: 'Medium', px: '8px' },
  { value: 'large', label: 'Large', px: '12px' },
  { value: 'full', label: 'Full', px: '9999px' },
];

const TYPOGRAPHY_OPTIONS: { value: TypographyStyle; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'sans', label: 'Sans-serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'mono', label: 'Monospace' },
];

function BrandInfo({ projectId }: { projectId: string }) {
  const activeTheme = useThemeStore((s) => s.getActiveTheme)(projectId);
  if (!activeTheme?.brandMeta) return null;
  const { brandName, headingFont, bodyFont } = activeTheme.brandMeta;
  return (
    <p className="text-xs text-text-secondary">
      Brand: {brandName} &middot; {headingFont} / {bodyFont}
    </p>
  );
}

export function DesignContext({ projectId, values, onChange }: DesignContextProps) {
  const update = (partial: Partial<DesignContextValues>) => {
    onChange({ ...values, ...partial });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
          <PaletteIcon className="h-4 w-4 text-brand" />
          Design Settings
        </span>
        <div className="flex gap-1">
          <span
            className="h-3 w-3 rounded-full border border-surface-3"
            style={{ backgroundColor: values.primaryColor }}
          />
          <span
            className="h-3 w-3 rounded-full border border-surface-3"
            style={{ backgroundColor: values.secondaryColor }}
          />
          <span
            className="h-3 w-3 rounded-full border border-surface-3"
            style={{ backgroundColor: values.accentColor }}
          />
        </div>
      </div>

      <ThemeSelector projectId={projectId} currentValues={values} onSelectTheme={onChange} />

      <BrandInfo projectId={projectId} />

      <fieldset>
        <legend className="block text-sm font-medium text-text-primary mb-2">Color Mode</legend>
        <div className="grid grid-cols-3 gap-1.5" role="radiogroup">
          {COLOR_MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={values.colorMode === opt.value}
              onClick={() => update({ colorMode: opt.value })}
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                values.colorMode === opt.value
                  ? 'border-brand bg-brand/10 text-brand-light'
                  : 'border-surface-3 text-text-secondary hover:text-text-primary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ColorPicker
          label="Primary"
          value={values.primaryColor}
          onChange={(c) => update({ primaryColor: c })}
        />
        <ColorPicker
          label="Secondary"
          value={values.secondaryColor}
          onChange={(c) => update({ secondaryColor: c })}
        />
      </div>
      <ColorPicker
        label="Accent"
        value={values.accentColor}
        onChange={(c) => update({ accentColor: c })}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="design-animation"
            className="block text-sm font-medium text-text-primary mb-2"
          >
            Animation
          </label>
          <select
            id="design-animation"
            value={values.animation}
            onChange={(e) => update({ animation: e.target.value as AnimationLevel })}
            className="w-full px-3 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
          >
            {ANIMATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="design-spacing"
            className="block text-sm font-medium text-text-primary mb-2"
          >
            Spacing
          </label>
          <select
            id="design-spacing"
            value={values.spacing}
            onChange={(e) => update({ spacing: e.target.value as SpacingLevel })}
            className="w-full px-3 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
          >
            {SPACING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="design-border-radius"
            className="block text-sm font-medium text-text-primary mb-2"
          >
            Border Radius
          </label>
          <select
            id="design-border-radius"
            value={values.borderRadius}
            onChange={(e) =>
              update({
                borderRadius: e.target.value as BorderRadiusLevel,
              })
            }
            className="w-full px-3 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
          >
            {BORDER_RADIUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} ({opt.px})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="design-typography"
            className="block text-sm font-medium text-text-primary mb-2"
          >
            Typography
          </label>
          <select
            id="design-typography"
            value={values.typography}
            onChange={(e) =>
              update({
                typography: e.target.value as TypographyStyle,
              })
            }
            className="w-full px-3 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
          >
            {TYPOGRAPHY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
