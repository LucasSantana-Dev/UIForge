/**
 * ComponentGenerator Component Tests
 * Tests for the main component generation interface (delegation pattern)
 */

import { render, screen } from '@testing-library/react';
import ComponentGenerator from '@/components/generator/ComponentGenerator';
import { useProject } from '@/hooks/use-projects';
import { useGeneration } from '@/hooks/use-generation';

jest.mock('@/hooks/use-projects');
jest.mock('@/hooks/use-generation');

function MockGeneratorForm(props: any) {
  return (
    <div data-testid="generator-form" data-pid={props.projectId}>
      GeneratorForm
    </div>
  );
}
jest.mock('@/components/generator/GeneratorForm', () => MockGeneratorForm);

function MockCodeEditor(props: any) {
  return <div data-testid="code-editor">{props.code || 'No code'}</div>;
}
jest.mock('@/components/generator/CodeEditor', () => MockCodeEditor);

function MockLivePreview(props: any) {
  return (
    <div data-testid="live-preview" data-framework={props.framework}>
      Preview
    </div>
  );
}
jest.mock('@/components/generator/LivePreview', () => MockLivePreview);

function MockGenerationHistory(_props: any) {
  return <div data-testid="generation-history">History</div>;
}
jest.mock('@/components/generator/GenerationHistory', () => MockGenerationHistory);

function MockSaveToProject(_props: any) {
  return <div data-testid="save-to-project">Save</div>;
}
jest.mock('@/components/generator/SaveToProject', () => MockSaveToProject);

const mockUseProject = useProject as jest.MockedFunction<typeof useProject>;
const mockUseGeneration = useGeneration as jest.MockedFunction<typeof useGeneration>;

describe('ComponentGenerator Component', () => {
  const mockProject = {
    id: 'test-project',
    name: 'Test Project',
    framework: 'react',
    component_library: 'shadcn',
    created_at: '2026-02-17T00:00:00.000Z',
    updated_at: '2026-02-17T00:00:00.000Z',
    user_id: 'user-123',
  };

  const mockGeneration = {
    isGenerating: false,
    progress: 0,
    code: '',
    error: null,
    events: [],
    qualityReport: null,
    startGeneration: jest.fn(),
    startRefinement: jest.fn(),
    stopGeneration: jest.fn(),
    reset: jest.fn(),
    parentGenerationId: null,
    conversationTurn: 0,
    maxConversationTurns: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseProject.mockReturnValue({
      data: mockProject,
      isLoading: false,
    } as any);
    mockUseGeneration.mockReturnValue(mockGeneration);
  });

  it('should render loading state', () => {
    mockUseProject.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    const { container } = render(<ComponentGenerator projectId="test-project" />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should render project not found', () => {
    mockUseProject.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    render(<ComponentGenerator projectId="test-project" />);
    expect(screen.getByText('Project not found')).toBeInTheDocument();
  });

  it('should render Component Generator heading', () => {
    render(<ComponentGenerator projectId="test-project" />);
    expect(screen.getByText('Component Generator')).toBeInTheDocument();
  });

  it('should render sub-components', () => {
    render(<ComponentGenerator projectId="test-project" />);
    expect(screen.getByTestId('generator-form')).toBeInTheDocument();
    expect(screen.getByTestId('code-editor')).toBeInTheDocument();
    expect(screen.getByTestId('live-preview')).toBeInTheDocument();
    expect(screen.getByTestId('generation-history')).toBeInTheDocument();
  });

  it('should pass projectId to GeneratorForm', () => {
    render(<ComponentGenerator projectId="test-project" />);
    expect(screen.getByTestId('generator-form')).toHaveAttribute('data-pid', 'test-project');
  });

  it('should pass framework to LivePreview', () => {
    render(<ComponentGenerator projectId="test-project" />);
    expect(screen.getByTestId('live-preview')).toHaveAttribute('data-framework', 'react');
  });

  it('should show SaveToProject when code is generated', () => {
    mockUseGeneration.mockReturnValue({
      ...mockGeneration,
      code: 'export default function Button() { return <button>Click</button>; }',
    });

    render(<ComponentGenerator projectId="test-project" />);
    expect(screen.getByTestId('save-to-project')).toBeInTheDocument();
  });

  it('should not show SaveToProject when no code', () => {
    render(<ComponentGenerator projectId="test-project" />);
    expect(screen.queryByTestId('save-to-project')).not.toBeInTheDocument();
  });
});
