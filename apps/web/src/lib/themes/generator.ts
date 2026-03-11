import type {
  AnimationLevel,
  BorderRadiusLevel,
  ColorMode,
  DesignContextValues,
  SpacingLevel,
  TypographyStyle,
} from '@/components/generator/DesignContext';

export type ThemeGeneratorPreset = 'balanced' | 'vibrant' | 'professional' | 'midnight' | 'earthy';

export interface ThemeGeneratorInput {
  preset: ThemeGeneratorPreset;
  seedColor: string;
  mood?: string;
}

export const THEME_GENERATOR_PRESETS: Array<{ value: ThemeGeneratorPreset; label: string }> = [
  { value: 'balanced', label: 'Balanced' },
  { value: 'vibrant', label: 'Vibrant' },
  { value: 'professional', label: 'Professional' },
  { value: 'midnight', label: 'Midnight' },
  { value: 'earthy', label: 'Earthy' },
];

interface PresetConfig {
  mode: ColorMode;
  hueShiftSecondary: number;
  hueShiftAccent: number;
  saturationBoost: number;
  lightnessBoost: number;
  borderRadius: BorderRadiusLevel;
  spacing: SpacingLevel;
  typography: TypographyStyle;
  animation: AnimationLevel;
}

const PRESET_CONFIG: Record<ThemeGeneratorPreset, PresetConfig> = {
  balanced: {
    mode: 'dark',
    hueShiftSecondary: 25,
    hueShiftAccent: 145,
    saturationBoost: 6,
    lightnessBoost: 4,
    borderRadius: 'medium',
    spacing: 'default',
    typography: 'sans',
    animation: 'subtle',
  },
  vibrant: {
    mode: 'dark',
    hueShiftSecondary: 42,
    hueShiftAccent: 185,
    saturationBoost: 18,
    lightnessBoost: 8,
    borderRadius: 'large',
    spacing: 'spacious',
    typography: 'sans',
    animation: 'rich',
  },
  professional: {
    mode: 'light',
    hueShiftSecondary: 14,
    hueShiftAccent: 165,
    saturationBoost: -4,
    lightnessBoost: -6,
    borderRadius: 'small',
    spacing: 'default',
    typography: 'sans',
    animation: 'none',
  },
  midnight: {
    mode: 'dark',
    hueShiftSecondary: -18,
    hueShiftAccent: 110,
    saturationBoost: -8,
    lightnessBoost: -16,
    borderRadius: 'medium',
    spacing: 'compact',
    typography: 'mono',
    animation: 'subtle',
  },
  earthy: {
    mode: 'light',
    hueShiftSecondary: -38,
    hueShiftAccent: 98,
    saturationBoost: -2,
    lightnessBoost: -2,
    borderRadius: 'large',
    spacing: 'spacious',
    typography: 'serif',
    animation: 'subtle',
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeHex(hex: string): string {
  const value = hex.trim().replace('#', '');
  if (/^[a-f0-9]{3}$/i.test(value)) {
    return `#${value
      .split('')
      .map((char) => char + char)
      .join('')
      .toUpperCase()}`;
  }
  if (/^[a-f0-9]{6}$/i.test(value)) {
    return `#${value.toUpperCase()}`;
  }
  return '#8B5CF6';
}

function hueToRgb(p: number, q: number, t: number): number {
  let value = t;
  if (value < 0) value += 1;
  if (value > 1) value -= 1;
  if (value < 1 / 6) return p + (q - p) * 6 * value;
  if (value < 1 / 2) return q;
  if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;
  return p;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = normalizeHex(hex).slice(1);
  const r = Number.parseInt(clean.slice(0, 2), 16) / 255;
  const g = Number.parseInt(clean.slice(2, 4), 16) / 255;
  const b = Number.parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360;
  const sat = clamp(s, 0, 100) / 100;
  const lig = clamp(l, 0, 100) / 100;
  let r = lig;
  let g = lig;
  let b = lig;
  if (sat !== 0) {
    const q = lig < 0.5 ? lig * (1 + sat) : lig + sat - lig * sat;
    const p = 2 * lig - q;
    r = hueToRgb(p, q, hue / 360 + 1 / 3);
    g = hueToRgb(p, q, hue / 360);
    b = hueToRgb(p, q, hue / 360 - 1 / 3);
  }
  const toHex = (channel: number) =>
    Math.round(channel * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function hashText(input: string): number {
  let hash = 0;
  for (const char of input) {
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) % 2147483647;
  }
  return hash;
}

function deriveMoodAdjustments(moodText: string): {
  typography?: TypographyStyle;
  animation?: AnimationLevel;
  spacing?: SpacingLevel;
  mode?: ColorMode;
} {
  const mood = moodText.toLowerCase();
  if (!mood) return {};
  if (/(calm|minimal|clean|quiet)/.test(mood)) {
    return { animation: 'subtle', spacing: 'spacious' };
  }
  if (/(energetic|bold|playful|loud)/.test(mood)) {
    return { animation: 'rich', spacing: 'default' };
  }
  if (/(enterprise|corporate|professional|serious)/.test(mood)) {
    return { animation: 'none', typography: 'sans', spacing: 'default' };
  }
  if (/(classic|editorial|elegant)/.test(mood)) {
    return { typography: 'serif' };
  }
  if (/(developer|terminal|technical|code)/.test(mood)) {
    return { typography: 'mono', mode: 'dark' };
  }
  if (/(light|bright|airy)/.test(mood)) {
    return { mode: 'light' };
  }
  if (/(dark|noir|night)/.test(mood)) {
    return { mode: 'dark' };
  }
  return {};
}

export function generateThemeFromInput(input: ThemeGeneratorInput): DesignContextValues {
  const preset = PRESET_CONFIG[input.preset];
  const seed = hexToHsl(input.seedColor);
  const mood = (input.mood ?? '').trim().toLowerCase();
  const moodHash = hashText(mood);
  const hueNudge = mood ? (moodHash % 17) - 8 : 0;
  const saturationNudge = mood ? ((moodHash >> 4) % 13) - 6 : 0;
  const lightnessNudge = mood ? ((moodHash >> 8) % 11) - 5 : 0;
  const moodAdjustments = deriveMoodAdjustments(mood);

  const baseSaturation = clamp(seed.s + preset.saturationBoost + saturationNudge, 30, 90);
  const baseLightness = clamp(seed.l + preset.lightnessBoost + lightnessNudge, 22, 72);

  return {
    colorMode: moodAdjustments.mode ?? preset.mode,
    primaryColor: hslToHex(seed.h + hueNudge, baseSaturation, baseLightness),
    secondaryColor: hslToHex(
      seed.h + preset.hueShiftSecondary + hueNudge,
      clamp(baseSaturation - 4, 25, 90),
      clamp(baseLightness + 4, 20, 84)
    ),
    accentColor: hslToHex(
      seed.h + preset.hueShiftAccent + hueNudge,
      clamp(baseSaturation + 10, 35, 95),
      clamp(baseLightness + 6, 24, 86)
    ),
    animation: moodAdjustments.animation ?? preset.animation,
    spacing: moodAdjustments.spacing ?? preset.spacing,
    borderRadius: preset.borderRadius,
    typography: moodAdjustments.typography ?? preset.typography,
  };
}
