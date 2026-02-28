import { describe, it, expect } from 'vitest';
import { buildComponentPrompt } from '../main/ollama-prompts';

describe('buildComponentPrompt', () => {
  it('builds React prompt with correct framework guide', () => {
    const { system, user } = buildComponentPrompt(
      'react',
      'A hero section with gradient background',
      'HeroSection'
    );

    expect(system).toContain('React with TypeScript and Tailwind CSS');
    expect(system).toContain('functional components with hooks');
    expect(system).toContain('ONLY the component code');
    expect(system).toContain('semantic color tokens');
    expect(user).toContain('react');
    expect(user).toContain('HeroSection');
    expect(user).toContain('hero section with gradient background');
  });

  it('builds Vue prompt correctly', () => {
    const { system, user } = buildComponentPrompt(
      'vue',
      'A data table',
      'DataTable'
    );

    expect(system).toContain('Vue 3 with Composition API');
    expect(user).toContain('vue');
    expect(user).toContain('DataTable');
  });

  it('includes registry examples when provided', () => {
    const examples = 'function ExampleButton() { return <button>Click</button> }';
    const { system } = buildComponentPrompt(
      'react',
      'A button',
      'FancyButton',
      examples
    );

    expect(system).toContain('similar components for reference');
    expect(system).toContain(examples);
  });

  it('excludes registry section when no examples', () => {
    const { system } = buildComponentPrompt(
      'react',
      'A card',
      'InfoCard'
    );

    expect(system).not.toContain('similar components for reference');
  });

  it('falls back to React for unknown framework', () => {
    const { system } = buildComponentPrompt(
      'unknown-fw',
      'A widget',
      'Widget'
    );

    expect(system).toContain('React with TypeScript and Tailwind CSS');
  });
});
