export function buildComponentPrompt(
  framework: string,
  description: string,
  componentName: string,
  registryExamples?: string
): { system: string; user: string } {
  const frameworkGuide: Record<string, string> = {
    react: 'React with TypeScript and Tailwind CSS. Use functional components with hooks.',
    vue: 'Vue 3 with Composition API (<script setup lang="ts">) and Tailwind CSS.',
    angular: 'Angular with TypeScript, standalone components, and Tailwind CSS.',
    svelte: 'Svelte with TypeScript and Tailwind CSS.',
    html: 'Plain HTML with Tailwind CSS CDN.',
  };

  const guide = frameworkGuide[framework] || frameworkGuide.react;

  const system = [
    'You are a senior UI engineer. Generate production-quality components.',
    `Framework: ${guide}`,
    'Rules:',
    '- Output ONLY the component code, no markdown fences or explanations',
    '- Use semantic HTML elements',
    '- Include proper TypeScript types for all props',
    '- Use Tailwind utility classes (no custom CSS)',
    '- Prefer semantic color tokens: bg-surface-1, text-text-primary, border-surface-3, text-brand',
    '- Support dark backgrounds (the app is dark-only)',
    '- Add hover/focus states for interactive elements',
    '- Make components responsive with mobile-first approach',
    '- Include aria attributes for accessibility',
    registryExamples
      ? `\nHere are similar components for reference style and patterns:\n${registryExamples}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  const user = `Create a ${framework} component named "${componentName}": ${description}`;

  return { system, user };
}
