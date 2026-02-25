'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ChevronDownIcon,
  PlusIcon,
  CopyIcon,
  TrashIcon,
  DownloadIcon,
  UploadIcon,
} from 'lucide-react';
import { useThemeStore, type SizaTheme } from '@/stores/theme-store';
import type { DesignContextValues } from './DesignContext';

interface ThemeSelectorProps {
  projectId: string;
  currentValues: DesignContextValues;
  onSelectTheme: (values: DesignContextValues) => void;
  onSaveAsTheme: () => void;
}

function themeToValues(theme: SizaTheme): DesignContextValues {
  return {
    colorMode: theme.colorMode,
    primaryColor: theme.primaryColor,
    secondaryColor: theme.secondaryColor,
    accentColor: theme.accentColor,
    animation: theme.animation,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    typography: theme.typography,
  };
}

export function ThemeSelector({
  projectId,
  currentValues,
  onSelectTheme,
  onSaveAsTheme,
}: ThemeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    getThemes,
    getActiveTheme,
    setActiveTheme,
    deleteTheme,
    duplicateTheme,
    exportTheme,
    importTheme,
  } = useThemeStore();

  const themes = getThemes();
  const activeTheme = getActiveTheme(projectId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (theme: SizaTheme) => {
    setActiveTheme(projectId, theme.id);
    onSelectTheme(themeToValues(theme));
    setOpen(false);
  };

  const handleDuplicate = (e: React.MouseEvent, theme: SizaTheme) => {
    e.stopPropagation();
    const newId = duplicateTheme(theme.id, theme.name + ' (Copy)');
    if (newId) {
      setActiveTheme(projectId, newId);
      const newTheme = getThemes().find((t) => t.id === newId);
      if (newTheme) onSelectTheme(themeToValues(newTheme));
    }
  };

  const handleDelete = (e: React.MouseEvent, theme: SizaTheme) => {
    e.stopPropagation();
    if (theme.builtIn) return;
    deleteTheme(theme.id);
    const def = themes[0];
    if (def) {
      setActiveTheme(projectId, def.id);
      onSelectTheme(themeToValues(def));
    }
  };

  const handleExport = (e: React.MouseEvent, theme: SizaTheme) => {
    e.stopPropagation();
    const json = exportTheme(theme.id);
    if (json) navigator.clipboard.writeText(json);
  };

  const handleImportSubmit = () => {
    setImportError('');
    const id = importTheme(importJson);
    if (id) {
      setImporting(false);
      setImportJson('');
      setActiveTheme(projectId, id);
      const newTheme = getThemes().find((t) => t.id === id);
      if (newTheme) onSelectTheme(themeToValues(newTheme));
    } else {
      setImportError('Invalid theme JSON');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm border border-surface-3 rounded-md hover:border-brand/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: activeTheme?.primaryColor }}
          />
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: activeTheme?.secondaryColor }}
          />
          <span className="text-text-primary truncate">{activeTheme?.name || 'Select Theme'}</span>
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-surface-1 border border-surface-3 rounded-lg shadow-lg overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {themes.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleSelect(theme)}
                className={`flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-surface-0 transition-colors ${
                  activeTheme?.id === theme.id ? 'bg-brand/10' : ''
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: theme.primaryColor }}
                  />
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: theme.secondaryColor }}
                  />
                  <span className="truncate text-text-primary">{theme.name}</span>
                  {theme.builtIn && (
                    <span className="text-xs text-text-muted shrink-0">built-in</span>
                  )}
                </span>
                <span className="flex items-center gap-1 shrink-0 ml-2">
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleExport(e, theme)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleExport(e as any, theme);
                    }}
                    className="p-1 hover:text-brand"
                    title="Export"
                  >
                    <DownloadIcon className="h-3 w-3" />
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleDuplicate(e, theme)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleDuplicate(e as any, theme);
                    }}
                    className="p-1 hover:text-brand"
                    title="Duplicate"
                  >
                    <CopyIcon className="h-3 w-3" />
                  </span>
                  {!theme.builtIn && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => handleDelete(e, theme)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleDelete(e as any, theme);
                      }}
                      className="p-1 hover:text-red-500"
                      title="Delete"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>

          <div className="border-t border-surface-3 p-2 space-y-1">
            <button
              type="button"
              onClick={() => {
                onSaveAsTheme();
                setOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-0 rounded-md"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Save Current as Theme
            </button>
            <button
              type="button"
              onClick={() => setImporting(!importing)}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-0 rounded-md"
            >
              <UploadIcon className="h-3.5 w-3.5" />
              Import Theme
            </button>
          </div>

          {importing && (
            <div className="border-t border-surface-3 p-3 space-y-2">
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder="Paste theme JSON here..."
                rows={4}
                className="w-full px-2 py-1.5 text-xs font-mono border border-surface-3 rounded-md focus:ring-brand focus:border-brand"
              />
              {importError && <p className="text-xs text-red-500">{importError}</p>}
              <button
                type="button"
                onClick={handleImportSubmit}
                className="w-full px-3 py-1.5 text-sm bg-brand text-white rounded-md hover:bg-brand/90"
              >
                Import
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
