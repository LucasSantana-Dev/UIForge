'use client';

import { useState, useRef, useEffect } from 'react';
import { SparklesIcon, PlusCircleIcon, SendIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RefinementInputProps {
  onRefine: (prompt: string) => void;
  onNewGeneration: () => void;
  isGenerating: boolean;
  conversationTurn: number;
  maxTurns: number;
}

export default function RefinementInput({
  onRefine,
  onNewGeneration,
  isGenerating,
  conversationTurn,
  maxTurns,
}: RefinementInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const atLimit = conversationTurn >= maxTurns;

  useEffect(() => {
    if (!isGenerating && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isGenerating]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isGenerating || atLimit) return;
    onRefine(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-3 rounded-lg border bg-card space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-4 w-4 text-brand" />
          <span className="text-sm font-medium text-text-primary">Refine Component</span>
          <Badge variant="secondary" className="text-xs">
            Turn {conversationTurn}/{maxTurns}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onNewGeneration} className="text-xs">
          <PlusCircleIcon className="h-3.5 w-3.5 mr-1" />
          New Generation
        </Button>
      </div>

      {atLimit ? (
        <p className="text-xs text-amber-500">
          Conversation limit reached. Start a new generation to continue.
        </p>
      ) : (
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            rows={1}
            className="flex-1 px-3 py-2 text-sm bg-surface-1 text-text-primary border border-surface-3 rounded-md resize-none focus:ring-brand focus:border-brand disabled:opacity-50"
            placeholder="How would you like to refine this? (e.g., make it darker, add hover states)"
          />
          <Button
            onClick={handleSubmit}
            disabled={!value.trim() || isGenerating}
            size="sm"
            className="self-end"
          >
            <SendIcon className="h-4 w-4 mr-1" />
            Refine
          </Button>
        </div>
      )}
    </div>
  );
}
