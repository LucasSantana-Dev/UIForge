import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WireframePreview } from '@/components/wireframe/WireframePreview';

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="properties-panel">{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: ({ orientation }: any) => <hr data-orientation={orientation} />,
}));

jest.mock('lucide-react', () => ({
  ZoomIn: () => <svg data-testid="icon-zoom-in" />,
  ZoomOut: () => <svg data-testid="icon-zoom-out" />,
  RotateCcw: () => <svg data-testid="icon-reset" />,
  Download: () => <svg data-testid="icon-download" />,
  Share2: () => <svg data-testid="icon-share" />,
}));

const mockWireframe = {
  wireframe: {
    type: 'landing',
    width: 1440,
    height: 900,
    elements: [
      { id: 'el1', type: 'container', name: 'Hero', x: 0, y: 0, width: 1440, height: 400 },
      {
        id: 'el2',
        type: 'text',
        name: 'Title',
        x: 100,
        y: 100,
        textContent: 'Hello World',
        fontSize: 32,
      },
    ],
  },
  metadata: {
    framework: 'react',
    componentType: 'LandingPage',
    generatedAt: '2026-03-15T12:00:00Z',
    outputFormat: 'json',
  },
};

const mockWireframeNoMeta = {
  wireframe: {
    type: 'card',
    width: 400,
    height: 300,
    elements: [{ id: 'el1', type: 'rectangle', x: 0, y: 0, width: 400, height: 300 }],
  },
};

describe('WireframePreview', () => {
  it('renders dimensions badge', () => {
    render(<WireframePreview wireframe={mockWireframe} />);
    expect(screen.getByText('1440 × 900')).toBeInTheDocument();
  });

  it('shows componentType badge when metadata present', () => {
    render(<WireframePreview wireframe={mockWireframe} />);
    expect(screen.getByText('LandingPage')).toBeInTheDocument();
  });

  it('does not show componentType badge without metadata', () => {
    render(<WireframePreview wireframe={mockWireframeNoMeta} />);
    expect(screen.queryByText('LandingPage')).not.toBeInTheDocument();
  });

  it('shows initial scale as 100%', () => {
    render(<WireframePreview wireframe={mockWireframe} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('zoom in increases scale', () => {
    render(<WireframePreview wireframe={mockWireframe} />);
    const buttons = screen.getAllByRole('button');
    // buttons: ZoomOut, ZoomIn, Reset, Export, Share
    const zoomInBtn = buttons[1];
    fireEvent.click(zoomInBtn);
    expect(screen.getByText('110%')).toBeInTheDocument();
  });

  it('zoom out decreases scale', () => {
    render(<WireframePreview wireframe={mockWireframe} />);
    const buttons = screen.getAllByRole('button');
    const zoomOutBtn = buttons[0];
    fireEvent.click(zoomOutBtn);
    expect(screen.getByText('90%')).toBeInTheDocument();
  });

  it('reset button restores 100%', () => {
    render(<WireframePreview wireframe={mockWireframe} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]); // zoom in to 110%
    fireEvent.click(buttons[2]); // reset
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('shows metadata footer when metadata present', () => {
    render(<WireframePreview wireframe={mockWireframe} />);
    expect(screen.getByText(/Framework: react/)).toBeInTheDocument();
    expect(screen.getByText('json')).toBeInTheDocument();
  });

  it('does not show metadata footer without metadata', () => {
    render(<WireframePreview wireframe={mockWireframeNoMeta} />);
    expect(screen.queryByText(/Framework:/)).not.toBeInTheDocument();
  });

  it('clicking SVG element shows properties panel', () => {
    render(<WireframePreview wireframe={mockWireframe} />);
    // Properties panel should not exist initially
    expect(screen.queryByText('Element Properties')).not.toBeInTheDocument();

    // Click the rect element (first SVG child)
    const svgEl = document.querySelector('rect');
    if (svgEl) fireEvent.click(svgEl);

    expect(screen.getByText('Element Properties')).toBeInTheDocument();
    expect(screen.getByText('Hero')).toBeInTheDocument();
  });
});
