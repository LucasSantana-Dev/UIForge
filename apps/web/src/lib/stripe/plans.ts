export type PlanId = 'free' | 'pro' | 'enterprise';

export interface PlanDefinition {
  id: PlanId;
  name: string;
  description: string;
  priceMonthly: number;
  stripePriceId: string | null;
  features: string[];
  limits: {
    generationsPerMonth: number;
    maxProjects: number;
    maxComponentsPerProject: number;
  };
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Get started with AI-powered UI generation',
    priceMonthly: 0,
    stripePriceId: null,
    features: [
      '10 AI generations per month',
      '2 projects',
      '50 components per project',
      'Community support',
    ],
    limits: {
      generationsPerMonth: 10,
      maxProjects: 2,
      maxComponentsPerProject: 50,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For professional developers and teams',
    priceMonthly: 19,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
    features: [
      '500 AI generations per month',
      'Unlimited projects',
      'Unlimited components',
      'Multi-LLM support',
      'Analytics dashboard',
      'Priority support',
    ],
    limits: {
      generationsPerMonth: 500,
      maxProjects: -1,
      maxComponentsPerProject: -1,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large teams',
    priceMonthly: -1,
    stripePriceId: null,
    features: [
      'Unlimited generations',
      'Unlimited everything',
      'SSO integration',
      'Audit logging',
      'Dedicated support',
      'Custom SLAs',
    ],
    limits: {
      generationsPerMonth: -1,
      maxProjects: -1,
      maxComponentsPerProject: -1,
    },
  },
};

export function getPlan(planId: string): PlanDefinition {
  return PLANS[planId as PlanId] ?? PLANS.free;
}
