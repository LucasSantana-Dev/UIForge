import { TOUR_STEPS } from '../tour-steps';

describe('tour-steps', () => {
  it('has at least 5 steps', () => {
    expect(TOUR_STEPS.length).toBeGreaterThanOrEqual(5);
  });

  it('every step has required fields', () => {
    for (const step of TOUR_STEPS) {
      expect(step.target).toBeTruthy();
      expect(step.title).toBeTruthy();
      expect(step.description).toBeTruthy();
      expect(['top', 'bottom', 'left', 'right']).toContain(step.placement);
    }
  });

  it('targets use data-tour attribute selectors', () => {
    for (const step of TOUR_STEPS) {
      expect(step.target).toMatch(/^\[data-tour="[^"]+"\]$/);
    }
  });

  it('first step targets generate button', () => {
    expect(TOUR_STEPS[0].target).toBe('[data-tour="generate"]');
  });

  it('includes projects step', () => {
    const projectsStep = TOUR_STEPS.find((s) => s.target.includes('projects'));
    expect(projectsStep).toBeDefined();
  });

  it('descriptions are between 20-200 chars', () => {
    for (const step of TOUR_STEPS) {
      expect(step.description.length).toBeGreaterThan(20);
      expect(step.description.length).toBeLessThan(200);
    }
  });

  it('has no duplicate targets', () => {
    const targets = TOUR_STEPS.map((s) => s.target);
    const unique = new Set(targets);
    expect(unique.size).toBe(targets.length);
  });
});
