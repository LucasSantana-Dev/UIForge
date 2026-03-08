'use client';

import { useState, useCallback, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { TOUR_STEPS } from './tour-steps';

interface TourOverlayProps {
  onComplete: () => void;
  onDismiss: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function subscribe(callback: () => void) {
  window.addEventListener('resize', callback);
  window.addEventListener('scroll', callback, true);
  return () => {
    window.removeEventListener('resize', callback);
    window.removeEventListener('scroll', callback, true);
  };
}

function getTooltipPosition(rect: Rect, placement: string): { top: number; left: number } {
  const gap = 12;
  switch (placement) {
    case 'right':
      return { top: rect.top + rect.height / 2, left: rect.left + rect.width + gap };
    case 'left':
      return { top: rect.top + rect.height / 2, left: rect.left - gap };
    case 'bottom':
      return { top: rect.top + rect.height + gap, left: rect.left + rect.width / 2 };
    case 'top':
      return { top: rect.top - gap, left: rect.left + rect.width / 2 };
    default:
      return { top: rect.top + rect.height + gap, left: rect.left };
  }
}

function useTargetRect(selector: string | undefined): Rect | null {
  const getSnapshot = useCallback((): string => {
    if (!selector) return '';
    const el = document.querySelector(selector);
    if (!el) return '';
    const r = el.getBoundingClientRect();
    return `${r.top},${r.left},${r.width},${r.height}`;
  }, [selector]);

  const raw = useSyncExternalStore(subscribe, getSnapshot, () => '');
  if (!raw) return null;
  const [top, left, width, height] = raw.split(',').map(Number);
  return { top, left, width, height };
}

export function TourOverlay({ onComplete, onDismiss }: TourOverlayProps) {
  const [step, setStep] = useState(0);

  const currentStep = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;
  const targetRect = useTargetRect(currentStep?.target);

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleBackdropKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Enter') onDismiss();
  };

  if (!currentStep) return null;

  const pos = targetRect
    ? getTooltipPosition(targetRect, currentStep.placement)
    : { top: 0, left: 0 };

  const translateClass =
    currentStep.placement === 'right'
      ? '-translate-y-1/2'
      : currentStep.placement === 'left'
        ? '-translate-y-1/2 -translate-x-full'
        : currentStep.placement === 'bottom'
          ? '-translate-x-1/2'
          : '-translate-x-1/2 -translate-y-full';

  return createPortal(
    <div className="fixed inset-0 z-[9999]" aria-modal="true" role="dialog">
      <div
        className="absolute inset-0 bg-black/60 transition-opacity"
        role="button"
        tabIndex={-1}
        onClick={onDismiss}
        onKeyDown={handleBackdropKeyDown}
        aria-label="Dismiss tour"
      />

      {targetRect && (
        <div
          className="absolute rounded-lg ring-2 ring-violet-500 ring-offset-2 ring-offset-transparent transition-all duration-300"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
            zIndex: 10000,
            pointerEvents: 'none',
          }}
        />
      )}

      <div
        className={`absolute z-[10001] w-80 rounded-lg border border-surface-3 bg-surface-1 p-4 shadow-xl transition-all duration-300 ${translateClass}`}
        style={{ top: pos.top, left: pos.left }}
      >
        <div className="mb-3 flex items-start justify-between">
          <h3 className="text-sm font-semibold text-foreground">{currentStep.title}</h3>
          <button
            onClick={onDismiss}
            className="rounded-md p-0.5 text-muted-foreground hover:text-foreground"
            aria-label="Dismiss tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          {currentStep.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {step + 1} of {TOUR_STEPS.length}
          </span>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={handlePrev}
                className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-3 w-3" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1 rounded-md bg-violet-600 px-3 py-1 text-xs text-white hover:bg-violet-500"
            >
              {isLast ? 'Done' : 'Next'}
              {!isLast && <ChevronRight className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
