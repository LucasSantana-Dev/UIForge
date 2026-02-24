export type PlanId = 'free' | 'pro' | 'team' | 'enterprise';

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
    seats: number;
  };
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'For individual developers and students',
    priceMonthly: 0,
    stripePriceId: null,
    features: [
      '10 AI generations per month',
      '2 projects',
      '50 components per project',
      'BYOK unlimited (bring your own key)',
      'Self-hostable',
      'Community support',
    ],
    limits: {
      generationsPerMonth: 10,
      maxProjects: 2,
      maxComponentsPerProject: 50,
      seats: 1,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For professional developers',
    priceMonthly: 19,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
    features: [
      '500 AI generations per month',
      'Unlimited projects',
      'Unlimited components',
      'Multi-LLM support (Gemini, Claude, GPT)',
      'Analytics dashboard',
      'Priority support',
    ],
    limits: {
      generationsPerMonth: 500,
      maxProjects: -1,
      maxComponentsPerProject: -1,
      seats: 1,
    },
  },
  team: {
    id: 'team',
    name: 'Team',
    description: 'For small teams and agencies',
    priceMonthly: 49,
    stripePriceId: process.env.STRIPE_TEAM_PRICE_ID ?? null,
    features: [
      '2,500 AI generations per month',
      'Unlimited projects',
      'Unlimited components',
      '5 team seats included',
      'Shared projects and templates',
      'Usage dashboard',
      'Priority support',
    ],
    limits: {
      generationsPerMonth: 2500,
      maxProjects: -1,
      maxComponentsPerProject: -1,
      seats: 5,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For companies with custom requirements',
    priceMonthly: -1,
    stripePriceId: null,
    features: [
      'Unlimited generations',
      'Unlimited everything',
      'SSO integration',
      'Audit logging',
      'Dedicated support',
      'Custom SLAs',
      'On-premise deployment',
      'Custom MCP servers',
    ],
    limits: {
      generationsPerMonth: -1,
      maxProjects: -1,
      maxComponentsPerProject: -1,
      seats: -1,
    },
  },
};

export function getPlan(planId: string): PlanDefinition {
  return PLANS[planId as PlanId] ?? PLANS.free;
}
