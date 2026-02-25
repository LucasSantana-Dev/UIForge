import React from 'react';
import { render, screen } from '@testing-library/react';
import ComponentGenerator from '@/components/generator/ComponentGenerator';
import { useProject } from '@/hooks/use-projects';
import { useGeneration } from '@/hooks/use-generation';

jest.mock('@/hooks/use-projects');
jest.mock('@/hooks/use-generation');
jest.mock('@/components/generator/GeneratorForm', () => (props: any) =>
  <div data-testid="generator-form" data-pid={props.projectId} />);
jest.mock('@/components/generator/CodeEditor', () => (props: any) =>
  <div data-testid="code-editor">{props.code}</div>);
jest.mock('@/components/generator/LivePreview', () => (props: any) =>
  <div data-testid="live-preview" data-fw={props.framework} />);
jest.mock('@/components/generator/GenerationHistory', () => () =>
  <div data-testid="gen-history" />);
jest.mock('@/components/generator/SaveToProject', () => (props: any) =>
  <div data-testid="save-project" />);
jest.mock('lucide-react', () => ({ SparklesIcon: () => <span /> }));

const mockProject = useProject as jest.MockedFunction<typeof useProject>;
const mockGen = useGeneration as jest.MockedFunction<typeof useGeneration>;
const genDefault = {
  isGenerating: false, progress: 0, code: '', error: null, events: [],
  startGeneration: jest.fn(), stopGeneration: jest.fn(), reset: jest.fn(),
};

describe('ComponentGenerator', () => {
  beforeEach(() => { jest.clearAllMocks(); mockGen.mockReturnValue(genDefault); });

  it('should show loading', () => {
    mockProject.mockReturnValue({ data: undefined, isLoading: true } as any);
    render(<ComponentGenerator projectId="p1" />);
    expect(screen.getByText('Loading project...')).toBeInTheDocument();
  });

  it('should show not found', () => {
    mockProject.mockReturnValue({ data: null, isLoading: false } as any);
    render(<ComponentGenerator projectId="p1" />);
    expect(screen.getByText('Project not found')).toBeInTheDocument();
  });

  it('should render sub-components', () => {
    mockProject.mockReturnValue({ data: { id: 'p1', framework: 'react', name: 'T' }, isLoading: false } as any);
    render(<ComponentGenerator projectId="p1" />);
    expect(screen.getByTestId('generator-form')).toBeInTheDocument();
    expect(screen.getByTestId('code-editor')).toBeInTheDocument();
    expect(screen.getByTestId('live-preview')).toBeInTheDocument();
    expect(screen.getByTestId('gen-history')).toBeInTheDocument();
  });

  it('should show header', () => {
    mockProject.mockReturnValue({ data: { id: 'p1', framework: 'react', name: 'T' }, isLoading: false } as any);
    render(<ComponentGenerator projectId="p1" />);
    expect(screen.getByText('Component Generator')).toBeInTheDocument();
  });

  it('should pass projectId to form', () => {
    mockProject.mockReturnValue({ data: { id: 'p1', framework: 'react', name: 'T' }, isLoading: false } as any);
    render(<ComponentGenerator projectId="p1" />);
    expect(screen.getByTestId('generator-form')).toHaveAttribute('data-pid', 'p1');
  });

  it('should pass framework to preview', () => {
    mockProject.mockReturnValue({ data: { id: 'p1', framework: 'vue', name: 'T' }, isLoading: false } as any);
    render(<ComponentGenerator projectId="p1" />);
    expect(screen.getByTestId('live-preview')).toHaveAttribute('data-fw', 'vue');
  });

  it('should show save when code exists', () => {
    mockGen.mockReturnValue({ ...genDefault, code: 'function X(){}' });
    mockProject.mockReturnValue({ data: { id: 'p1', framework: 'react', name: 'T' }, isLoading: false } as any);
    render(<ComponentGenerator projectId="p1" />);
    expect(screen.getByTestId('save-project')).toBeInTheDocument();
  });

  it('should hide save when no code', () => {
    mockProject.mockReturnValue({ data: { id: 'p1', framework: 'react', name: 'T' }, isLoading: false } as any);
    render(<ComponentGenerator projectId="p1" />);
    expect(screen.queryByTestId('save-project')).not.toBeInTheDocument();
  });
});
