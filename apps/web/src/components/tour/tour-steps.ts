export interface TourStep {
  target: string;
  title: string;
  description: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="generate"]',
    title: 'Generate Components',
    description:
      'Describe what you need and Siza generates production-ready UI code with AI. Try it — type a prompt and hit Generate.',
    placement: 'right',
  },
  {
    target: '[data-tour="projects"]',
    title: 'Organize Projects',
    description:
      'Group your generations into projects. Track progress, manage versions, and collaborate with your team.',
    placement: 'right',
  },
  {
    target: '[data-tour="templates"]',
    title: 'Templates & Scaffolding',
    description:
      'Start new projects from battle-tested templates. Each one comes with governance, testing, and CI pre-configured.',
    placement: 'right',
  },
  {
    target: '[data-tour="catalog"]',
    title: 'Software Catalog',
    description:
      'Track all your services, their health, and compliance. Your internal developer platform starts here.',
    placement: 'right',
  },
  {
    target: '[data-tour="golden-paths"]',
    title: 'Golden Path Templates',
    description:
      'Scaffold new projects with built-in governance. Five official templates with security, testing, and CI baked in.',
    placement: 'right',
  },
  {
    target: '[data-tour="settings"]',
    title: 'Settings & Shortcuts',
    description:
      'Customize your workspace. Pro tip: press Cmd+K for the command palette, Cmd+N for a new generation, or Cmd+? for all shortcuts.',
    placement: 'right',
  },
];
