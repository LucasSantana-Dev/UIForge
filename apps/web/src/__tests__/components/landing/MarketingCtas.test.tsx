import { render, screen } from '@testing-library/react';
import { HeroSection } from '@/components/landing/HeroSection';
import { CTASection } from '@/components/landing/CTASection';

describe('Landing CTAs', () => {
  it('renders signup CTA in hero', () => {
    render(<HeroSection />);

    const link = screen.getByRole('link', { name: /start generating free/i });
    expect(link).toHaveAttribute('href', '/signup');
  });

  it('renders docs CTA in hero', () => {
    render(<HeroSection />);

    const docs = screen.getByRole('link', { name: /read the docs/i });
    expect(docs).toHaveAttribute('href', '/docs');
  });

  it('renders public CTA links in footer section', () => {
    render(<CTASection />);

    const signup = screen.getByRole('link', { name: /get started free/i });
    expect(signup).toHaveAttribute('href', '/signup');

    const github = screen.getByRole('link', { name: /view on github/i });
    expect(github).toHaveAttribute('href', 'https://github.com/Forge-Space');
  });
});
