import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  ColorMode,
  AnimationLevel,
  SpacingLevel,
  BorderRadiusLevel,
  TypographyStyle,
} from '@/components/generator/DesignContext';
import { BUILT_IN_THEMES } from '@/lib/themes/defaults';

export interface SizaTheme {
  id: string;
  name: string;
  builtIn: boolean;
  colorMode: ColorMode;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  animation: AnimationLevel;
  spacing: SpacingLevel;
  borderRadius: BorderRadiusLevel;
  typography: TypographyStyle;
  createdAt: string;
  updatedAt: string;
}

interface ThemeState {
  themes: SizaTheme[];
  activeThemeIds: Record<string, string>;
}

interface ThemeActions {
  getThemes: () => SizaTheme[];
  getActiveTheme: (projectId: string) => SizaTheme | undefined;
  setActiveTheme: (projectId: string, themeId: string) => void;
  createTheme: (theme: Omit<SizaTheme, 'id' | 'builtIn' | 'createdAt' | 'updatedAt'>) => string;
  updateTheme: (
    id: string,
    updates: Partial<Omit<SizaTheme, 'id' | 'builtIn' | 'createdAt' | 'updatedAt'>>
  ) => void;
  deleteTheme: (id: string) => boolean;
  duplicateTheme: (id: string, newName: string) => string | null;
  exportTheme: (id: string) => string | null;
  importTheme: (json: string) => string | null;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set, get) => ({
      themes: [],
      activeThemeIds: {},

      getThemes: () => {
        const userThemes = get().themes;
        return [...BUILT_IN_THEMES, ...userThemes];
      },

      getActiveTheme: (projectId: string) => {
        const themeId = get().activeThemeIds[projectId];
        if (!themeId) return BUILT_IN_THEMES[0];
        const all = get().getThemes();
        return all.find((t) => t.id === themeId) || BUILT_IN_THEMES[0];
      },

      setActiveTheme: (projectId: string, themeId: string) => {
        set((state) => ({
          activeThemeIds: { ...state.activeThemeIds, [projectId]: themeId },
        }));
      },

      createTheme: (theme) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newTheme: SizaTheme = {
          ...theme,
          id,
          builtIn: false,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ themes: [...state.themes, newTheme] }));
        return id;
      },

      updateTheme: (id, updates) => {
        set((state) => ({
          themes: state.themes.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      deleteTheme: (id) => {
        const theme = get()
          .getThemes()
          .find((t) => t.id === id);
        if (!theme || theme.builtIn) return false;
        set((state) => ({
          themes: state.themes.filter((t) => t.id !== id),
        }));
        return true;
      },

      duplicateTheme: (id, newName) => {
        const source = get()
          .getThemes()
          .find((t) => t.id === id);
        if (!source) return null;
        return get().createTheme({
          name: newName,
          colorMode: source.colorMode,
          primaryColor: source.primaryColor,
          secondaryColor: source.secondaryColor,
          accentColor: source.accentColor,
          animation: source.animation,
          spacing: source.spacing,
          borderRadius: source.borderRadius,
          typography: source.typography,
        });
      },

      exportTheme: (id) => {
        const theme = get()
          .getThemes()
          .find((t) => t.id === id);
        if (!theme) return null;
        const excludeKeys = new Set(['id', 'builtIn', 'createdAt', 'updatedAt']);
        const exportable = Object.fromEntries(
          Object.entries(theme).filter(([k]) => !excludeKeys.has(k))
        );
        return JSON.stringify(exportable, null, 2);
      },

      importTheme: (json) => {
        try {
          const parsed = JSON.parse(json);
          if (typeof parsed.name !== 'string' || typeof parsed.primaryColor !== 'string') {
            return null;
          }
          const safeTheme = {
            name: String(parsed.name).slice(0, 50),
            colorMode: parsed.colorMode || 'dark',
            primaryColor: parsed.primaryColor || '#7C3AED',
            secondaryColor: parsed.secondaryColor || '#6366F1',
            accentColor: parsed.accentColor || '#22C55E',
            animation: parsed.animation || 'subtle',
            spacing: parsed.spacing || 'default',
            borderRadius: parsed.borderRadius || 'medium',
            typography: parsed.typography || 'system',
          };
          return get().createTheme(safeTheme);
        } catch {
          return null;
        }
      },
    }),
    {
      name: 'siza-themes',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        themes: state.themes,
        activeThemeIds: state.activeThemeIds,
      }),
    }
  )
);
