/**
 * GenerationCard Component Tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GenerationCard } from '@/components/history/GenerationCard';

const makeGeneration = (overrides = {}) => ({
  id: 'gen-1',
  prompt: 'Build a button component',
  component_name: 'PrimaryButton',
  generated_code: 'export function Button() { return <button>Click</button>; }',
  framework: 'react',
  component_library: undefined,
  style: undefined,
  ai_provider: 'google',
  model_used: undefined,
  generation_time_ms: 1200,
  quality_score: 0.9,
  created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
  status: 'completed',
  ...overrides,
});

describe('GenerationCard', () => {
  it('renders component_name', () => {
    render(
      <GenerationCard
        generation={makeGeneration()}
        onReusePrompt={jest.fn()}
        onCopyCode={jest.fn()}
      />
    );
    expect(screen.getByText('PrimaryButton')).toBeInTheDocument();
  });

  it('renders prompt text', () => {
    render(
      <GenerationCard
        generation={makeGeneration()}
        onReusePrompt={jest.fn()}
        onCopyCode={jest.fn()}
      />
    );
    expect(screen.getByText('Build a button component')).toBeInTheDocument();
  });

  it('renders framework badge', () => {
    render(
      <GenerationCard
        generation={makeGeneration()}
        onReusePrompt={jest.fn()}
        onCopyCode={jest.fn()}
      />
    );
    expect(screen.getByText('react')).toBeInTheDocument();
  });

  it('shows Gemini for google provider', () => {
    render(
      <GenerationCard
        generation={makeGeneration({ ai_provider: 'google' })}
        onReusePrompt={jest.fn()}
        onCopyCode={jest.fn()}
      />
    );
    expect(screen.getByText('Gemini')).toBeInTheDocument();
  });

  it('shows Claude for anthropic provider', () => {
    render(
      <GenerationCard
        generation={makeGeneration({ ai_provider: 'anthropic' })}
        onReusePrompt={jest.fn()}
        onCopyCode={jest.fn()}
      />
    );
    expect(screen.getByText('Claude')).toBeInTheDocument();
  });

  it('shows Good quality for score > 0.8', () => {
    render(
      <GenerationCard
        generation={makeGeneration({ quality_score: 0.9 })}
        onReusePrompt={jest.fn()}
        onCopyCode={jest.fn()}
      />
    );
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  it('shows Fair quality for score between 0.5 and 0.8', () => {
    render(
      <GenerationCard
        generation={makeGeneration({ quality_score: 0.6 })}
        onReusePrompt={jest.fn()}
        onCopyCode={jest.fn()}
      />
    );
    expect(screen.getByText('Fair')).toBeInTheDocument();
  });

  it('shows Poor quality for score < 0.5', () => {
    render(
      <GenerationCard
        generation={makeGeneration({ quality_score: 0.3 })}
        onReusePrompt={jest.fn()}
        onCopyCode={jest.fn()}
      />
    );
    expect(screen.getByText('Poor')).toBeInTheDocument();
  });

  it('calls onReusePrompt when Reuse Prompt clicked', async () => {
    const onReusePrompt = jest.fn();
    render(
      <GenerationCard
        generation={makeGeneration()}
        onReusePrompt={onReusePrompt}
        onCopyCode={jest.fn()}
      />
    );
    await userEvent.click(screen.getByText(/Reuse Prompt/));
    expect(onReusePrompt).toHaveBeenCalledTimes(1);
  });

  it('calls onCopyCode and shows Copied state when Copy Code clicked', async () => {
    const onCopyCode = jest.fn();
    render(
      <GenerationCard
        generation={makeGeneration()}
        onReusePrompt={jest.fn()}
        onCopyCode={onCopyCode}
      />
    );
    await userEvent.click(screen.getByText(/Copy Code/));
    expect(onCopyCode).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Copied')).toBeInTheDocument();
  });

  it('shows Untitled when component_name is empty', () => {
    render(
      <GenerationCard
        generation={makeGeneration({ component_name: '' })}
        onReusePrompt={jest.fn()}
        onCopyCode={jest.fn()}
      />
    );
    expect(screen.getByText('Untitled')).toBeInTheDocument();
  });

  it('shows code preview section', () => {
    render(
      <GenerationCard
        generation={makeGeneration()}
        onReusePrompt={jest.fn()}
        onCopyCode={jest.fn()}
      />
    );
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('shows generation time', () => {
    render(
      <GenerationCard
        generation={makeGeneration({ generation_time_ms: 2500 })}
        onReusePrompt={jest.fn()}
        onCopyCode={jest.fn()}
      />
    );
    expect(screen.getByText('2.5s')).toBeInTheDocument();
  });
});
