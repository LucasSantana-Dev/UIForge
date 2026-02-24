import { PLANS, getPlan } from '@/lib/stripe/plans';
import type { PlanDefinition } from '@/lib/stripe/plans';

describe('Stripe Plans', () => {
  describe('PLANS', () => {
    it('should define free, pro, and enterprise plans', () => {
      expect(PLANS.free).toBeDefined();
      expect(PLANS.pro).toBeDefined();
      expect(PLANS.enterprise).toBeDefined();
    });

    it('should have correct free plan limits', () => {
      const free = PLANS.free;
      expect(free.id).toBe('free');
      expect(free.priceMonthly).toBe(0);
      expect(free.stripePriceId).toBeNull();
      expect(free.limits.generationsPerMonth).toBe(10);
      expect(free.limits.maxProjects).toBe(2);
      expect(free.limits.maxComponentsPerProject).toBe(50);
    });

    it('should have correct pro plan limits', () => {
      const pro = PLANS.pro;
      expect(pro.id).toBe('pro');
      expect(pro.priceMonthly).toBe(19);
      expect(pro.limits.generationsPerMonth).toBe(500);
      expect(pro.limits.maxProjects).toBe(-1);
      expect(pro.limits.maxComponentsPerProject).toBe(-1);
    });

    it('should have correct enterprise plan limits', () => {
      const enterprise = PLANS.enterprise;
      expect(enterprise.id).toBe('enterprise');
      expect(enterprise.priceMonthly).toBe(-1);
      expect(enterprise.limits.generationsPerMonth).toBe(-1);
      expect(enterprise.limits.maxProjects).toBe(-1);
    });

    it('should have features array on each plan', () => {
      for (const plan of Object.values(PLANS)) {
        expect(Array.isArray(plan.features)).toBe(true);
        expect(plan.features.length).toBeGreaterThan(0);
      }
    });

    it('should have required fields on each plan', () => {
      for (const plan of Object.values(PLANS)) {
        expect(plan).toHaveProperty('id');
        expect(plan).toHaveProperty('name');
        expect(plan).toHaveProperty('description');
        expect(plan).toHaveProperty('priceMonthly');
        expect(plan).toHaveProperty('features');
        expect(plan).toHaveProperty('limits');
      }
    });
  });

  describe('getPlan', () => {
    it('should return correct plan by id', () => {
      expect(getPlan('free').id).toBe('free');
      expect(getPlan('pro').id).toBe('pro');
      expect(getPlan('enterprise').id).toBe('enterprise');
    });

    it('should fall back to free plan for unknown id', () => {
      const plan = getPlan('nonexistent');
      expect(plan.id).toBe('free');
    });

    it('should fall back to free for empty string', () => {
      expect(getPlan('').id).toBe('free');
    });
  });
});
