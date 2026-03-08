import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GalleryCard } from '../gallery-card';

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

const mockGeneration = {
  id: 'g1',
  prompt: 'Build a login form with email and password',
  component_name: 'LoginForm',
  generated_code: 'export function LoginForm() { return <form>...</form>; }',
  framework: 'react',
  component_library: 'shadcn',
  ai_provider: 'anthropic',
  generation_time_ms: 2500,
  quality_score: 0.92,
  created_at: '2026-03-08T10:00:00Z',
};

describe('GalleryCard', () => {
  it('renders component name', () => {
    render(<GalleryCard generation={mockGeneration} />);
    expect(screen.getByText('LoginForm')).toBeInTheDocument();
  });

  it('renders framework badge', () => {
    render(<GalleryCard generation={mockGeneration} />);
    expect(screen.getByText('react')).toBeInTheDocument();
  });

  it('renders prompt text', () => {
    render(<GalleryCard generation={mockGeneration} />);
    expect(screen.getByText('Build a login form with email and password')).toBeInTheDocument();
  });

  it('renders code preview', () => {
    render(<GalleryCard generation={mockGeneration} />);
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('renders AI provider label', () => {
    render(<GalleryCard generation={mockGeneration} />);
    expect(screen.getByText('Claude')).toBeInTheDocument();
  });

  it('renders component library', () => {
    render(<GalleryCard generation={mockGeneration} />);
    expect(screen.getByText('shadcn')).toBeInTheDocument();
  });

  it('renders generation time', () => {
    render(<GalleryCard generation={mockGeneration} />);
    expect(screen.getByText('2.5s')).toBeInTheDocument();
  });

  it('renders quality grade badge', () => {
    render(<GalleryCard generation={mockGeneration} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders Copy Code button', () => {
    render(<GalleryCard generation={mockGeneration} />);
    expect(screen.getByText('Copy Code')).toBeInTheDocument();
  });

  it('renders Try This Prompt link', () => {
    render(<GalleryCard generation={mockGeneration} />);
    const link = screen.getByText('Try This Prompt');
    expect(link.closest('a')).toHaveAttribute('href', expect.stringContaining('/generate?prompt='));
  });

  it('copies code on click', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });

    render(<GalleryCard generation={mockGeneration} />);
    fireEvent.click(screen.getByText('Copy Code'));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockGeneration.generated_code);
  });

  it('renders Untitled when no component name', () => {
    render(<GalleryCard generation={{ ...mockGeneration, component_name: '' }} />);
    expect(screen.getByText('Untitled')).toBeInTheDocument();
  });
});
