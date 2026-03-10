import type { Phase } from './types';

export function buildPhases(repoCount: number): Phase[] {
  return [
    {
      number: 1,
      title: 'Foundation',
      subtitle: 'Core generation, governance, and platform operations now in production',
      status: 'active',
      estimatedDate: 'Live now',
      items: [
        { label: 'Authentication, billing, and project workspace flows', status: 'done' },
        { label: 'AI generation with streaming and live preview', status: 'done' },
        { label: 'Software catalog, relationships, and CI visibility panels', status: 'done' },
        { label: 'Post-generation scorecards with governance quality gates', status: 'done' },
        { label: 'Golden Path templates and migration planning toolkit', status: 'done' },
        {
          label: `${repoCount} product repositories aligned with shared governance standards`,
          status: 'done',
          githubUrl: 'https://github.com/Forge-Space',
        },
      ],
    },
    {
      number: 2,
      title: 'Adoption',
      subtitle: 'Improve onboarding, discoverability, and operating clarity for teams',
      status: 'planned',
      estimatedDate: 'In progress',
      items: [
        { label: 'Live ecosystem metadata sync across marketing surfaces', status: 'in-progress' },
        { label: 'Expanded docs for governance and migration workflows', status: 'in-progress' },
        { label: 'Contributor onboarding and examples for faster team setup', status: 'planned' },
        { label: 'Community showcase and reusable prompt patterns', status: 'planned' },
        { label: 'Cross-repo release narrative and changelog curation', status: 'planned' },
      ],
    },
    {
      number: 3,
      title: 'Scale',
      subtitle: 'Extend collaboration and enterprise controls while preserving open architecture',
      status: 'future',
      estimatedDate: 'Next horizon',
      items: [
        { label: 'Collaborative multi-agent workflows', status: 'planned' },
        { label: 'Cross-product auth and policy unification', status: 'planned' },
        { label: 'Enterprise SSO and compliance controls', status: 'planned' },
        { label: 'Organization-level quality trend analytics', status: 'planned' },
        { label: 'Extension ecosystem for plugins and IDE integrations', status: 'planned' },
      ],
    },
  ];
}
