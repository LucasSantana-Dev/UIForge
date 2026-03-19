import {
  DEFAULT_DESIGN_CONTEXT,
  generateComponent as generateWithSizaGen,
} from '@forgespace/siza-gen';

type SupportedFramework = 'react' | 'vue' | 'angular' | 'svelte';

const COMPONENT_HINTS = [
  'card',
  'button',
  'form',
  'navbar',
  'modal',
  'table',
  'list',
  'hero',
  'pricing',
  'dashboard',
];

function resolveComponentType(prompt: string): string {
  const normalized = prompt.toLowerCase();
  for (const hint of COMPONENT_HINTS) {
    if (normalized.includes(hint)) {
      return hint;
    }
  }
  return 'component';
}

function resolveLibrary(
  input?: string
): 'shadcn' | 'radix' | 'headlessui' | 'primevue' | 'material' | 'none' {
  if (input === 'shadcn') {
    return 'shadcn';
  }
  if (input === 'mui' || input === 'chakra') {
    return 'material';
  }
  if (input === 'tailwind') {
    return 'none';
  }
  return 'none';
}

function resolveFramework(framework: string): SupportedFramework {
  if (
    framework === 'react' ||
    framework === 'vue' ||
    framework === 'angular' ||
    framework === 'svelte'
  ) {
    return framework;
  }
  return 'react';
}

export function isSizaLocalFallbackEnabled(): boolean {
  return process.env.SIZA_AGENT_LOCAL_FALLBACK === 'true';
}

export function generateWithSizaLocalAgent(options: {
  prompt: string;
  framework: string;
  componentLibrary?: string;
}): string {
  const framework = resolveFramework(options.framework);
  const componentType = resolveComponentType(options.prompt);
  const componentLibrary = resolveLibrary(options.componentLibrary);
  const files = generateWithSizaGen(
    framework,
    componentType,
    {},
    DEFAULT_DESIGN_CONTEXT,
    componentLibrary
  );
  const preferred = files.find((file) => file.path.includes('/components/')) ?? files[0];
  if (!preferred?.content) {
    throw new Error('Siza local agent generated an empty response.');
  }
  return preferred.content;
}
