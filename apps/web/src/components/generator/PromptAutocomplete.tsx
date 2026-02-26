'use client';

import { useState, useRef, useEffect } from 'react';
import { HistoryIcon, LayoutTemplateIcon } from 'lucide-react';
import {
  useSuggestions,
  type Suggestion,
} from '@/hooks/use-suggestions';

interface PromptAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  framework?: string;
  id?: string;
  rows?: number;
  placeholder?: string;
  className?: string;
}

export function PromptAutocomplete({
  value,
  onChange,
  framework,
  id,
  rows = 6,
  placeholder,
  className = '',
}: PromptAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { suggestions, isLoading } = useSuggestions({
    query: value,
    framework,
  });

  useEffect(() => {
    setIsOpen(suggestions.length > 0);
    setSelectedIndex(0);
  }, [suggestions]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectSuggestion = (suggestion: Suggestion) => {
    onChange(suggestion.text);
    setIsOpen(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(
          (i) => (i + 1) % suggestions.length
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(
          (i) =>
            (i - 1 + suggestions.length) % suggestions.length
        );
        break;
      case 'Enter':
        if (e.shiftKey) return;
        e.preventDefault();
        selectSuggestion(suggestions[selectedIndex]);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <textarea
        ref={textareaRef}
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() =>
          suggestions.length > 0 && setIsOpen(true)
        }
        className={className}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls="prompt-suggestions"
      />

      {isOpen && suggestions.length > 0 && (
        <ul
          id="prompt-suggestions"
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-md border border-surface-3 bg-surface-0 shadow-lg"
        >
          {suggestions.map((s, i) => (
            <li
              key={`${s.source}-${i}`}
              role="option"
              aria-selected={i === selectedIndex}
              onMouseDown={() => selectSuggestion(s)}
              onMouseEnter={() => setSelectedIndex(i)}
              className={`flex items-start gap-2 px-3 py-2 cursor-pointer text-sm ${
                i === selectedIndex
                  ? 'bg-brand/10 text-text-primary'
                  : 'text-text-secondary hover:bg-surface-1'
              }`}
            >
              {s.source === 'history' ? (
                <HistoryIcon className="h-4 w-4 mt-0.5 shrink-0 text-text-muted" />
              ) : (
                <LayoutTemplateIcon className="h-4 w-4 mt-0.5 shrink-0 text-brand-light" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate">{s.text}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-text-muted">
                    {s.source === 'history'
                      ? 'History'
                      : 'Template'}
                  </span>
                  {s.framework && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-surface-2 text-text-muted">
                      {s.framework}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
          {isLoading && (
            <li className="px-3 py-2 text-xs text-text-muted text-center">
              Loading...
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
