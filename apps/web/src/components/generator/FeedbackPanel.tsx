'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';

interface FeedbackPanelProps {
  generationId: string | null;
  ragEnriched?: boolean;
}

export default function FeedbackPanel({ generationId, ragEnriched }: FeedbackPanelProps) {
  const [feedback, setFeedback] = useState<'none' | 'positive' | 'negative' | 'submitted'>('none');

  if (!generationId) return null;

  const submitFeedback = async (score: number, text?: string) => {
    try {
      await fetch(`/api/generations/${generationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quality_score: score,
          user_feedback: text,
        }),
      });
      setFeedback('submitted');
    } catch {
      // Feedback is non-critical
    }
  };

  if (feedback === 'submitted') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Thanks for your feedback!</span>
        {ragEnriched && (
          <span className="flex items-center gap-1 text-xs">
            <Sparkles className="h-3 w-3" />
            RAG-enhanced
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Rate this generation:</span>
      <div className="flex gap-1">
        <Button
          variant={feedback === 'positive' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => {
            setFeedback('positive');
            submitFeedback(1.0, 'thumbs_up');
          }}
        >
          <ThumbsUp className="h-4 w-4" />
        </Button>
        <Button
          variant={feedback === 'negative' ? 'destructive' : 'ghost'}
          size="sm"
          onClick={() => {
            setFeedback('negative');
            submitFeedback(0.3, 'thumbs_down');
          }}
        >
          <ThumbsDown className="h-4 w-4" />
        </Button>
      </div>
      {ragEnriched && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          RAG-enhanced
        </span>
      )}
    </div>
  );
}
