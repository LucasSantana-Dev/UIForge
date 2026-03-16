import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('@siza/ui', () => ({
  LivePreview: ({ code, framework }: { code: string; framework: string }) => (
    <div data-testid="live-preview-stub" data-framework={framework}>
      {code ? `Preview: ${code}` : 'LivePreview'}
    </div>
  ),
}));

import LivePreview from '@/components/generator/LivePreview';

describe('LivePreview (re-export stub)', () => {
  it('renders without crashing', () => {
    render(<LivePreview code="" framework="react" />);
    expect(screen.getByTestId('live-preview-stub')).toBeInTheDocument();
  });

  it('passes framework prop through to the underlying component', () => {
    render(<LivePreview code="" framework="vue" />);
    const el = screen.getByTestId('live-preview-stub');
    expect(el.getAttribute('data-framework')).toBe('vue');
  });

  it('renders code content when code prop is provided', () => {
    const sampleCode = 'export default function Btn() {}';
    render(<LivePreview code={sampleCode} framework="react" />);
    expect(screen.getByText(`Preview: ${sampleCode}`)).toBeInTheDocument();
  });
});
