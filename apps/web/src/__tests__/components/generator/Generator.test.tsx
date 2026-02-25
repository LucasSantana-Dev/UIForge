/**
 * ComponentGenerator Tests
 * Tests the integration component that delegates to sub-components
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ComponentGenerator from '@/components/generator/ComponentGenerator';
import { useProject } from '@/hooks/use-projects';
import { useGeneration } from '@/hooks/use-generation';

jest.mock('@/hooks/use-projects');
jest.mock('@/hooks/use-generation');
jest.mock('@/components/generator/GeneratorForm', () => {
  return function MockGeneratorForm(props: any) {
    return <div data-testid="generator-form" data-project-id={props.projectId} />;
  };
});
jest.mock('@/components/generator/CodeEditor', () => {
  return function MockCodeEditor(props: any) {
    return <div data-testid="code-editor">{props.code}</div>;
  };
});
jest.mock('@/components/generator/LivePreview', () => {
  return function MockLivePreview(props: any) {
    return <div data-testid="live-preview" data-framework={props.framework} />;
  };
});
jest.mock('@/components/generator/GenerationHistory', () => {
  return function MockGenerationHistory() {
    return <div data-testid="generation-history" />;
  };
});
jest.mock('@/components/generator/SaveToProject', () => {
  return function MockSaveToProject(props: any) {
    return <div data-testid="save-to-project" data-code={props.code} />;
  };
});
jest.mock('lucide-react', () => ({
  SparklesIcon: () => <span data-testid="sparkles-icon" />,
}));

const mockUseProject = useProject as jest.MockedFunction<typeof useProject>;
const mockUseGeneration = useGeneration as jest.MockedFunction<typeof useGeneration>;

const defaultGeneration = {
  isGenerating: false,
  progress: 0,
  code: '',
  error: null,
  events: [],
  startGeneration: jest.fn(),
  stopGeneration: jest.fn(),
  reset: jest.fn(),
};

describe('ComponentGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGeneration.mockReturnValue(defaultGeneration);
  });

  it('should show loading state while project loads', () => {
    mockUseProject.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);
    render(<ComponentGenerator projectId="test-project" />);
    expect(screen.getByText('Loading project...')).toBeInTheDocument();
  });

  it('should show error when project not found', () => {
    mockUseProject.mockReturnValue({
      data: null,
      isLoading: false,
    } as any);
    render(<ComponentGenerator projectId="test-project" />);
    expect(screen.getByText('Project not found')).toBeInTheDocument();
  });

  it('should render sub-components when project loads', () => {
    mockUseProject.mockReturnValue({
      data: { id: 'test-project', framework: 'react', name: 'Test' },
      isLoading: false,
    } as any);
    render(<ComponentGenerator projectId="test-project" />);
    expect(screen.getByTestId('generator-form')).toBeInTheDocument();
    expect(screen.getByTestId('code-editor')).toBeInTheDocument();
    expect(screen.getByTestId('live-preview')).toBeInTheDocument();
    expect(screen.getByTestId('generation-history')).toBeInTheDocument();
  });

  it('should render header with component title', () => {
    mockUseProject.mockReturnValue({
      data: { id: 'test-project', framework: 'react', name: 'Test' },
      isLoading: false,
    } as any);
    render(<ComponentGenerator projectId="test-project" />);
    expect(screen.getByText('Component Generator')).toBeInTheDocument();
    expect(screen.getByText(/Generate react components with AI/i)).toBeInTheDocument();
  });

  it('should pass projectId to GeneratorForm', () => {
    mockUseProject.mockReturnValue({
      data: { id: 'test-project', framework: 'react', name: 'Test' },
      isLoading: false,
    } as any);
    render(<ComponentGenerator projectId="test-project" />);
    const form = screen.getByTestId('generator-form');
    expect(form).toHaveAttribute('data-project-id', 'test-project');
  });

  it('should pass framework to LivePreview', () => {
    mockUseProject.mockReturnValue({
      data: { id: 'test-project', framework: 'vue', name: 'Test' },
      isLoading: false,
    } as any);
    render(<ComponentGenerator projectId="test-project" />);
    const preview = screen.getByTestId('live-preview');
    expect(preview).toHaveAttribute('data-framework', 'vue');
  });

  it('should show SaveToProject when code is generated', () => {
    mockUseGeneration.mockReturnValue({
      ...defaultGeneration,
      code: 'export default function Button() {}',
    });
    mockUseProject.mockReturnValue({
      data: { id: 'test-project', framework: 'react', name: 'Test' },
      isLoading: false,
    } as any);
    render(<ComponentGenerator projectId="test-project" />);
    expect(screen.getByTestId('save-to-project')).toBeInTheDocument();
  });

  it('should not show SaveToProject when no code', () => {
    mockUseProject.mockReturnValue({
      data: { id: 'test-project', framework: 'react', name: 'Test' },
      isLoading: false,
    } as any);
    render(<ComponentGenerator projectId="test-project" />);
    expect(screen.queryByTestId('save-to-project')).not.toBeInTheDocument();
  });
});
