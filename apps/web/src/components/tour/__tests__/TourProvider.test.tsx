import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { TourProvider, useTour } from '../TourProvider';

jest.useFakeTimers();

function TourConsumer() {
  const { startTour } = useTour();
  return (
    <button onClick={startTour} data-testid="start-tour">
      Start
    </button>
  );
}

describe('TourProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  it('renders children', () => {
    render(
      <TourProvider tourCompleted={true}>
        <div data-testid="child">Hello</div>
      </TourProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('does not show tour when already completed', () => {
    render(
      <TourProvider tourCompleted={true}>
        <div>Content</div>
      </TourProvider>
    );
    act(() => jest.advanceTimersByTime(2000));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('provides startTour via context', () => {
    render(
      <TourProvider tourCompleted={true}>
        <TourConsumer />
      </TourProvider>
    );
    expect(screen.getByTestId('start-tour')).toBeInTheDocument();
  });

  it('auto-shows tour after delay when not completed', () => {
    render(
      <TourProvider tourCompleted={false}>
        <div>Content</div>
      </TourProvider>
    );
    act(() => jest.advanceTimersByTime(1500));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
