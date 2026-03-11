import {
  generateThemeFromInput,
  THEME_GENERATOR_PRESETS,
  type ThemeGeneratorPreset,
} from '@/lib/themes/generator';

const HEX_COLOR = /^#[0-9A-F]{6}$/;

describe('theme generator', () => {
  it('is deterministic for the same input', () => {
    const input = {
      preset: 'balanced' as ThemeGeneratorPreset,
      seedColor: '#8b5cf6',
      mood: 'calm modern',
    };
    const first = generateThemeFromInput(input);
    const second = generateThemeFromInput(input);

    expect(first).toEqual(second);
  });

  it('returns valid design context values', () => {
    const generated = generateThemeFromInput({
      preset: 'vibrant',
      seedColor: '#336699',
      mood: 'playful and bold',
    });

    expect(HEX_COLOR.test(generated.primaryColor)).toBe(true);
    expect(HEX_COLOR.test(generated.secondaryColor)).toBe(true);
    expect(HEX_COLOR.test(generated.accentColor)).toBe(true);
    expect(['dark', 'light', 'both']).toContain(generated.colorMode);
    expect(['none', 'subtle', 'standard', 'rich']).toContain(generated.animation);
    expect(['compact', 'default', 'spacious']).toContain(generated.spacing);
    expect(['none', 'small', 'medium', 'large', 'full']).toContain(generated.borderRadius);
    expect(['system', 'sans', 'serif', 'mono']).toContain(generated.typography);
  });

  it('supports all configured presets', () => {
    for (const preset of THEME_GENERATOR_PRESETS) {
      const generated = generateThemeFromInput({
        preset: preset.value,
        seedColor: '#123456',
      });
      expect(HEX_COLOR.test(generated.primaryColor)).toBe(true);
    }
  });
});
