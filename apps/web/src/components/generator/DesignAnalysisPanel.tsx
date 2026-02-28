'use client';

import { useState } from 'react';
import { Loader2, PaletteIcon, LayoutIcon, MousePointerClickIcon, WandIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DesignAnalysis } from '@/lib/services/image-analysis';

interface DesignAnalysisPanelProps {
  imageBase64: string;
  imageMimeType: string;
  userApiKey?: string;
  onApply: (analysis: DesignAnalysis) => void;
}

export default function DesignAnalysisPanel({
  imageBase64,
  imageMimeType,
  userApiKey,
  onApply,
}: DesignAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<DesignAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch('/api/generate/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, imageMimeType, userApiKey }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Analysis failed');
      }

      const data = await res.json();
      setAnalysis(data.analysis);
      setHasAnalyzed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!hasAnalyzed) {
    return (
      <div className="mt-3 p-3 rounded-lg border border-surface-3 bg-surface-0">
        <Button
          type="button"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing design...
            </>
          ) : (
            <>
              <WandIcon className="h-4 w-4 mr-2" />
              Analyze Design
            </>
          )}
        </Button>
        {error && (
          <p className="mt-2 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="mt-3 p-3 rounded-lg border border-brand/30 bg-brand/5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">Design Analysis</span>
        <Button
          type="button"
          onClick={() => onApply(analysis)}
          size="sm"
          variant="default"
        >
          <WandIcon className="h-3.5 w-3.5 mr-1" />
          Apply to Form
        </Button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <LayoutIcon className="h-3.5 w-3.5 mt-0.5 text-text-secondary shrink-0" />
          <span className="text-text-secondary">{analysis.layout}</span>
        </div>

        {analysis.colors.length > 0 && (
          <div className="flex items-center gap-2">
            <PaletteIcon className="h-3.5 w-3.5 text-text-secondary shrink-0" />
            <div className="flex gap-1">
              {analysis.colors.slice(0, 6).map((color, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded border border-surface-3"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}

        {analysis.components.length > 0 && (
          <div className="flex items-start gap-2">
            <MousePointerClickIcon className="h-3.5 w-3.5 mt-0.5 text-text-secondary shrink-0" />
            <span className="text-text-secondary">
              {analysis.components.slice(0, 5).join(', ')}
              {analysis.components.length > 5 && ` +${analysis.components.length - 5} more`}
            </span>
          </div>
        )}
      </div>

      {analysis.suggestedPrompt && (
        <p className="text-xs text-text-secondary italic border-t border-surface-3 pt-2">
          Suggested: {analysis.suggestedPrompt.substring(0, 120)}
          {analysis.suggestedPrompt.length > 120 && '...'}
        </p>
      )}
    </div>
  );
}
