import { act, renderHook } from '@testing-library/react';
import { useThemeStore, parseBrandIdentity } from '@/stores/theme-store';
import { BUILT_IN_THEMES } from '@/lib/themes/defaults';

describe('Theme Store', () => {
  beforeEach(() => {
    act(() => {
      useThemeStore.setState({
        themes: [],
        activeThemeIds: {},
      });
    });
  });

  describe('getThemes', () => {
    it('returns built-in themes when no user themes exist', () => {
      const { result } = renderHook(() => useThemeStore());
      const themes = result.current.getThemes();
      expect(themes).toHaveLength(BUILT_IN_THEMES.length);
      expect(themes.every((t) => t.builtIn)).toBe(true);
    });

    it('returns built-in themes followed by user themes', () => {
      const { result } = renderHook(() => useThemeStore());

      act(() => {
        result.current.createTheme({
          name: 'Custom Theme',
          colorMode: 'dark',
          primaryColor: '#FF0000',
          secondaryColor: '#00FF00',
          accentColor: '#0000FF',
          animation: 'subtle',
          spacing: 'default',
          borderRadius: 'medium',
          typography: 'sans',
        });
      });

      const themes = result.current.getThemes();
      expect(themes).toHaveLength(BUILT_IN_THEMES.length + 1);
      expect(themes[themes.length - 1].name).toBe('Custom Theme');
      expect(themes[themes.length - 1].builtIn).toBe(false);
    });
  });

  describe('getActiveTheme', () => {
    it('returns first built-in theme when no active theme is set', () => {
      const { result } = renderHook(() => useThemeStore());
      const active = result.current.getActiveTheme('project-1');
      expect(active).toEqual(BUILT_IN_THEMES[0]);
    });

    it('returns the set active theme for a project', () => {
      const { result } = renderHook(() => useThemeStore());

      act(() => {
        result.current.setActiveTheme('project-1', 'clean-light');
      });

      const active = result.current.getActiveTheme('project-1');
      expect(active?.id).toBe('clean-light');
    });

    it('returns default theme when active theme id is invalid', () => {
      const { result } = renderHook(() => useThemeStore());

      act(() => {
        result.current.setActiveTheme('project-1', 'nonexistent');
      });

      const active = result.current.getActiveTheme('project-1');
      expect(active).toEqual(BUILT_IN_THEMES[0]);
    });

    it('tracks different active themes per project', () => {
      const { result } = renderHook(() => useThemeStore());

      act(() => {
        result.current.setActiveTheme('project-1', 'clean-light');
        result.current.setActiveTheme('project-2', 'bold-contrast');
      });

      expect(result.current.getActiveTheme('project-1')?.id).toBe('clean-light');
      expect(result.current.getActiveTheme('project-2')?.id).toBe('bold-contrast');
    });
  });

  describe('createTheme', () => {
    it('creates a theme with generated id and timestamps', () => {
      const { result } = renderHook(() => useThemeStore());

      let id: string;
      act(() => {
        id = result.current.createTheme({
          name: 'Test Theme',
          colorMode: 'light',
          primaryColor: '#123456',
          secondaryColor: '#654321',
          accentColor: '#ABCDEF',
          animation: 'rich',
          spacing: 'compact',
          borderRadius: 'large',
          typography: 'mono',
        });
      });

      expect(id!).toBeDefined();
      expect(typeof id!).toBe('string');

      const themes = result.current.getThemes();
      const created = themes.find((t) => t.id === id!);
      expect(created).toBeDefined();
      expect(created!.name).toBe('Test Theme');
      expect(created!.builtIn).toBe(false);
      expect(created!.createdAt).toBeDefined();
      expect(created!.updatedAt).toBeDefined();
    });
  });

  describe('updateTheme', () => {
    it('updates a user theme', () => {
      const { result } = renderHook(() => useThemeStore());

      let id: string;
      act(() => {
        id = result.current.createTheme({
          name: 'Original',
          colorMode: 'dark',
          primaryColor: '#000000',
          secondaryColor: '#111111',
          accentColor: '#222222',
          animation: 'none',
          spacing: 'default',
          borderRadius: 'none',
          typography: 'system',
        });
      });

      act(() => {
        result.current.updateTheme(id!, { name: 'Updated' });
      });

      const updated = result.current.getThemes().find((t) => t.id === id!);
      expect(updated!.name).toBe('Updated');
    });
  });

  describe('deleteTheme', () => {
    it('deletes a user theme', () => {
      const { result } = renderHook(() => useThemeStore());

      let id: string;
      act(() => {
        id = result.current.createTheme({
          name: 'To Delete',
          colorMode: 'dark',
          primaryColor: '#000',
          secondaryColor: '#111',
          accentColor: '#222',
          animation: 'none',
          spacing: 'default',
          borderRadius: 'none',
          typography: 'system',
        });
      });

      let deleted: boolean;
      act(() => {
        deleted = result.current.deleteTheme(id!);
      });

      expect(deleted!).toBe(true);
      expect(result.current.getThemes().find((t) => t.id === id!)).toBeUndefined();
    });

    it('refuses to delete a built-in theme', () => {
      const { result } = renderHook(() => useThemeStore());

      let deleted: boolean;
      act(() => {
        deleted = result.current.deleteTheme('siza-default');
      });

      expect(deleted!).toBe(false);
      expect(result.current.getThemes().find((t) => t.id === 'siza-default')).toBeDefined();
    });

    it('returns false for nonexistent theme', () => {
      const { result } = renderHook(() => useThemeStore());

      let deleted: boolean;
      act(() => {
        deleted = result.current.deleteTheme('nonexistent');
      });

      expect(deleted!).toBe(false);
    });
  });

  describe('duplicateTheme', () => {
    it('duplicates a built-in theme', () => {
      const { result } = renderHook(() => useThemeStore());

      let newId: string | null;
      act(() => {
        newId = result.current.duplicateTheme('siza-default', 'My Copy');
      });

      expect(newId!).toBeDefined();
      const copy = result.current.getThemes().find((t) => t.id === newId!);
      expect(copy!.name).toBe('My Copy');
      expect(copy!.builtIn).toBe(false);
      expect(copy!.primaryColor).toBe(
        BUILT_IN_THEMES.find((t) => t.id === 'siza-default')!.primaryColor
      );
    });

    it('returns null for nonexistent source', () => {
      const { result } = renderHook(() => useThemeStore());

      let newId: string | null;
      act(() => {
        newId = result.current.duplicateTheme('nonexistent', 'Copy');
      });

      expect(newId!).toBeNull();
    });
  });

  describe('exportTheme', () => {
    it('exports a theme as JSON without internal fields', () => {
      const { result } = renderHook(() => useThemeStore());
      const json = result.current.exportTheme('siza-default');

      expect(json).toBeDefined();
      const parsed = JSON.parse(json!);
      expect(parsed.name).toBe('Siza Default');
      expect(parsed.primaryColor).toBe('#7C3AED');
      expect(parsed.id).toBeUndefined();
      expect(parsed.builtIn).toBeUndefined();
      expect(parsed.createdAt).toBeUndefined();
      expect(parsed.updatedAt).toBeUndefined();
    });

    it('returns null for nonexistent theme', () => {
      const { result } = renderHook(() => useThemeStore());
      expect(result.current.exportTheme('nonexistent')).toBeNull();
    });
  });

  describe('importTheme', () => {
    it('imports valid theme JSON', () => {
      const { result } = renderHook(() => useThemeStore());
      const json = JSON.stringify({
        name: 'Imported',
        primaryColor: '#FF0000',
        secondaryColor: '#00FF00',
        accentColor: '#0000FF',
        colorMode: 'light',
        animation: 'rich',
        spacing: 'compact',
        borderRadius: 'full',
        typography: 'serif',
      });

      let id: string | null;
      act(() => {
        id = result.current.importTheme(json);
      });

      expect(id!).toBeDefined();
      const imported = result.current.getThemes().find((t) => t.id === id!);
      expect(imported!.name).toBe('Imported');
      expect(imported!.primaryColor).toBe('#FF0000');
    });

    it('rejects invalid JSON', () => {
      const { result } = renderHook(() => useThemeStore());

      let id: string | null;
      act(() => {
        id = result.current.importTheme('not json');
      });

      expect(id!).toBeNull();
    });

    it('rejects JSON missing required fields', () => {
      const { result } = renderHook(() => useThemeStore());

      let id: string | null;
      act(() => {
        id = result.current.importTheme(JSON.stringify({ foo: 'bar' }));
      });

      expect(id!).toBeNull();
    });

    it('applies defaults for missing optional fields', () => {
      const { result } = renderHook(() => useThemeStore());

      let id: string | null;
      act(() => {
        id = result.current.importTheme(JSON.stringify({ name: 'Minimal', primaryColor: '#999' }));
      });

      expect(id!).toBeDefined();
      const imported = result.current.getThemes().find((t) => t.id === id!);
      expect(imported!.colorMode).toBe('dark');
      expect(imported!.animation).toBe('subtle');
      expect(imported!.spacing).toBe('default');
    });

    it('truncates long names to 50 characters', () => {
      const { result } = renderHook(() => useThemeStore());
      const longName = 'A'.repeat(100);

      let id: string | null;
      act(() => {
        id = result.current.importTheme(JSON.stringify({ name: longName, primaryColor: '#000' }));
      });

      const imported = result.current.getThemes().find((t) => t.id === id!);
      expect(imported!.name).toHaveLength(50);
    });
  });

  describe('parseBrandIdentity', () => {
    const validBrand = {
      brandName: 'Acme Corp',
      colors: {
        primary: { hex: '#E11D48' },
        secondary: { hex: '#7C3AED' },
        accent: { hex: '#F59E0B' },
        success: { hex: '#10B981' },
        warning: { hex: '#F59E0B' },
        error: { hex: '#EF4444' },
        info: { hex: '#3B82F6' },
        neutrals: { 50: { hex: '#FAFAFA' }, 900: { hex: '#171717' } },
      },
      typography: {
        headingFont: 'Playfair Display',
        bodyFont: 'Inter',
      },
      spacing: { unit: 8 },
      borders: { radii: { md: 6 } },
    };

    it('parses valid brand identity JSON', () => {
      const result = parseBrandIdentity(JSON.stringify(validBrand));
      expect(result).not.toBeNull();
      expect(result!.name).toBe('Acme Corp');
      expect(result!.primaryColor).toBe('#E11D48');
      expect(result!.secondaryColor).toBe('#7C3AED');
      expect(result!.accentColor).toBe('#F59E0B');
      expect(result!.typography).toBe('sans');
      expect(result!.spacing).toBe('default');
      expect(result!.borderRadius).toBe('medium');
    });

    it('returns null for invalid JSON string', () => {
      expect(parseBrandIdentity('not json')).toBeNull();
    });

    it('returns null when colors.primary.hex is missing', () => {
      expect(parseBrandIdentity(JSON.stringify({ name: 'test' }))).toBeNull();
      expect(parseBrandIdentity(JSON.stringify({ colors: {} }))).toBeNull();
      expect(parseBrandIdentity(JSON.stringify({ colors: { primary: {} } }))).toBeNull();
    });

    it('populates brandMeta with font names and semantic colors', () => {
      const result = parseBrandIdentity(JSON.stringify(validBrand));
      expect(result!.brandMeta).toBeDefined();
      expect(result!.brandMeta!.headingFont).toBe('Playfair Display');
      expect(result!.brandMeta!.bodyFont).toBe('Inter');
      expect(result!.brandMeta!.semanticColors.success).toBe('#10B981');
      expect(result!.brandMeta!.neutrals).toHaveLength(2);
    });

    it('maps mono font to mono typography', () => {
      const brand = {
        ...validBrand,
        typography: { headingFont: 'Fira Code', bodyFont: 'JetBrains Mono' },
      };
      const result = parseBrandIdentity(JSON.stringify(brand));
      expect(result!.typography).toBe('mono');
    });

    it('maps serif font to serif typography', () => {
      const brand = {
        ...validBrand,
        typography: { headingFont: 'Merriweather', bodyFont: 'Georgia Serif' },
      };
      const result = parseBrandIdentity(JSON.stringify(brand));
      expect(result!.typography).toBe('serif');
    });

    it('maps compact spacing for small units', () => {
      const brand = { ...validBrand, spacing: { unit: 4 } };
      const result = parseBrandIdentity(JSON.stringify(brand));
      expect(result!.spacing).toBe('compact');
    });

    it('maps spacious spacing for large units', () => {
      const brand = { ...validBrand, spacing: { unit: 16 } };
      const result = parseBrandIdentity(JSON.stringify(brand));
      expect(result!.spacing).toBe('spacious');
    });

    it('maps border radius levels correctly', () => {
      const none = { ...validBrand, borders: { radii: { md: 0 } } };
      expect(parseBrandIdentity(JSON.stringify(none))!.borderRadius).toBe('none');

      const small = { ...validBrand, borders: { radii: { md: 4 } } };
      expect(parseBrandIdentity(JSON.stringify(small))!.borderRadius).toBe('small');

      const large = { ...validBrand, borders: { radii: { md: 16 } } };
      expect(parseBrandIdentity(JSON.stringify(large))!.borderRadius).toBe('large');

      const full = { ...validBrand, borders: { radii: { md: 20 } } };
      expect(parseBrandIdentity(JSON.stringify(full))!.borderRadius).toBe('full');
    });

    it('falls back to defaults for missing optional fields', () => {
      const minimal = { colors: { primary: { hex: '#FF0000' } } };
      const result = parseBrandIdentity(JSON.stringify(minimal));
      expect(result).not.toBeNull();
      expect(result!.name).toBe('Imported Brand');
      expect(result!.secondaryColor).toBe('#FF0000');
      expect(result!.brandMeta!.headingFont).toBe('System');
    });
  });

  describe('importBrand', () => {
    const validBrand = JSON.stringify({
      brandName: 'Test Brand',
      colors: {
        primary: { hex: '#FF6600' },
        secondary: { hex: '#0066FF' },
      },
      typography: { headingFont: 'Roboto', bodyFont: 'Open Sans' },
      spacing: { unit: 8 },
      borders: { radii: { md: 8 } },
    });

    it('creates a theme from valid brand identity JSON', () => {
      const { result } = renderHook(() => useThemeStore());

      let id: string | null;
      act(() => {
        id = result.current.importBrand(validBrand);
      });

      expect(id!).toBeDefined();
      const theme = result.current.getThemes().find((t) => t.id === id!);
      expect(theme!.name).toBe('Test Brand');
      expect(theme!.primaryColor).toBe('#FF6600');
      expect(theme!.brandMeta).toBeDefined();
      expect(theme!.brandMeta!.headingFont).toBe('Roboto');
    });

    it('returns null for non-brand JSON', () => {
      const { result } = renderHook(() => useThemeStore());

      let id: string | null;
      act(() => {
        id = result.current.importBrand(JSON.stringify({ name: 'theme', primaryColor: '#000' }));
      });

      expect(id!).toBeNull();
    });

    it('returns null for invalid JSON', () => {
      const { result } = renderHook(() => useThemeStore());

      let id: string | null;
      act(() => {
        id = result.current.importBrand('garbage');
      });

      expect(id!).toBeNull();
    });
  });
});
