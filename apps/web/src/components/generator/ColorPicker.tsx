'use client';

import { useCallback } from 'react';

const PRESET_COLORS = [
  '#7C3AED',
  '#6366F1',
  '#3B82F6',
  '#22C55E',
  '#EF4444',
  '#F59E0B',
  '#EC4899',
  '#6B7280',
];

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const handleHexChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let hex = e.target.value;
      if (!hex.startsWith('#')) hex = '#' + hex;
      if (/^#[0-9A-Fa-f]{0,6}$/.test(hex)) {
        onChange(hex);
      }
    },
    [onChange]
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-primary">{label}</label>
      <div className="flex items-center gap-2">
        <div
          className="h-8 w-8 rounded-md border border-surface-3 shrink-0"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={value}
          onChange={handleHexChange}
          maxLength={7}
          className="w-24 px-2 py-1.5 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-md font-mono focus:ring-brand focus:border-brand"
          placeholder="#7C3AED"
        />
      </div>
      <div className="flex gap-1.5">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
              value.toUpperCase() === color.toUpperCase()
                ? 'border-white scale-110'
                : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}
