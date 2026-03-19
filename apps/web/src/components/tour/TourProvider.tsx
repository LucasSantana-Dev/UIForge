'use client';

import { useState, useRef, useEffect, createContext, useContext } from 'react';
import { TourOverlay } from './TourOverlay';

interface TourContextValue {
  startTour: () => void;
}

const TourContext = createContext<TourContextValue>({
  startTour: () => {},
});

export function useTour() {
  return useContext(TourContext);
}

interface TourProviderProps {
  children: React.ReactNode;
  tourCompleted: boolean;
}

function isE2ETourDisabled(): boolean {
  return process.env.NEXT_PUBLIC_E2E_DISABLE_TOUR === 'true';
}

export function TourProvider({ children, tourCompleted: initialCompleted }: TourProviderProps) {
  const [active, setActive] = useState(false);
  const completedRef = useRef(initialCompleted);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    if (isE2ETourDisabled()) return;

    if (!completedRef.current) {
      const timer = setTimeout(() => {
        setActive(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = async () => {
    setActive(false);
    completedRef.current = true;
    await fetch('/api/tour/complete', { method: 'POST' });
  };

  const handleDismiss = async () => {
    setActive(false);
    completedRef.current = true;
    await fetch('/api/tour/complete', { method: 'POST' });
  };

  const startTour = () => {
    if (isE2ETourDisabled()) return;
    setActive(true);
  };

  return (
    <TourContext value={{ startTour }}>
      {children}
      {active && <TourOverlay onComplete={handleComplete} onDismiss={handleDismiss} />}
    </TourContext>
  );
}
