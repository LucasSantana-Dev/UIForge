import { render, screen } from '@testing-library/react';
import { CapabilitiesSection } from '@/components/landing/CapabilitiesSection';

describe('CapabilitiesSection', () => {
  it('renders the section heading', () => {
    render(<CapabilitiesSection />);
    expect(screen.getByText('What makes it different')).toBeInTheDocument();
  });

  it('renders the Capabilities label', () => {
    render(<CapabilitiesSection />);
    expect(screen.getByText('Capabilities')).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    render(<CapabilitiesSection />);
    expect(screen.getByText(/AI generators produce code fast/)).toBeInTheDocument();
  });

  it('renders all 6 capability card titles', () => {
    render(<CapabilitiesSection />);
    expect(screen.getByText('Architecture-First')).toBeInTheDocument();
    expect(screen.getByText('Security by Default')).toBeInTheDocument();
    expect(screen.getByText('Quality Gates')).toBeInTheDocument();
    expect(screen.getByText('Full-Stack Scaffolds')).toBeInTheDocument();
    expect(screen.getByText('Context-Aware Generation')).toBeInTheDocument();
    expect(screen.getByText('Multi-Provider AI')).toBeInTheDocument();
  });

  it('renders capability descriptions', () => {
    render(<CapabilitiesSection />);
    expect(screen.getByText(/Service layers, middleware/)).toBeInTheDocument();
    expect(screen.getByText(/BYOK encryption/)).toBeInTheDocument();
  });

  it('renders within a section element', () => {
    const { container } = render(<CapabilitiesSection />);
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('id', 'capabilities');
  });
});
