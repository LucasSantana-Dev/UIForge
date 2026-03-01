import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GenerationHistory from '@/components/generator/GenerationHistory';
import { useGenerations, useDeleteGeneration } from '@/hooks/use-generations';

jest.mock('@/hooks/use-generations');

const mockGenerations = [
  {
    id: 'gen-1',
    project_id: 'proj-1',
    user_id: 'user-1',
    prompt: 'Create a modern card component with hover effects and shadow',
    component_name: 'HoverCard',
    generated_code: '<div className="card">HoverCard</div>',
    framework: 'react',
    component_library: 'shadcn',
    style: 'modern',
    typescript: true,
    status: 'completed' as const,
    quality_score: 92,
    parent_generation_id: undefined,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'gen-2',
    project_id: 'proj-1',
    user_id: 'user-1',
    prompt:
      'Make the card darker with more padding and a subtle border animation on hover that glows with a purple gradient effect',
    component_name: 'HoverCard',
    generated_code: '<div className="card-v2">HoverCard v2</div>',
    framework: 'react',
    component_library: 'shadcn',
    style: 'modern',
    typescript: true,
    status: 'completed' as const,
    quality_score: 78,
    parent_generation_id: 'gen-1',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'gen-3',
    project_id: 'proj-1',
    user_id: 'user-1',
    prompt: 'Build a responsive navbar with mobile hamburger menu',
    component_name: 'Navbar',
    generated_code: '<nav>Navbar</nav>',
    framework: 'vue',
    typescript: false,
    status: 'completed' as const,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockDeleteMutateAsync = jest.fn().mockResolvedValue({});
const mockUseGenerations = useGenerations as jest.MockedFunction<typeof useGenerations>;
const mockUseDeleteGeneration = useDeleteGeneration as jest.MockedFunction<
  typeof useDeleteGeneration
>;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseDeleteGeneration.mockReturnValue({
    mutateAsync: mockDeleteMutateAsync,
  } as any);
});

describe('GenerationHistory', () => {
  it('should render loading state', () => {
    mockUseGenerations.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<GenerationHistory projectId="proj-1" />);
    expect(screen.getByText('Loading history...')).toBeInTheDocument();
  });

  it('should render error state', () => {
    mockUseGenerations.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
    } as any);

    render(<GenerationHistory projectId="proj-1" />);
    expect(screen.getByText('Failed to load history')).toBeInTheDocument();
  });

  it('should render empty state when no generations', () => {
    mockUseGenerations.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    render(<GenerationHistory projectId="proj-1" />);
    expect(screen.getByText('No generations yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first component!')).toBeInTheDocument();
  });

  it('should render generation list with component names and badges', () => {
    mockUseGenerations.mockReturnValue({
      data: mockGenerations,
      isLoading: false,
      error: null,
    } as any);

    render(<GenerationHistory projectId="proj-1" />);

    expect(screen.getAllByText('HoverCard')).toHaveLength(2);
    expect(screen.getByText('Navbar')).toBeInTheDocument();
    expect(screen.getAllByText('react')).toHaveLength(2);
    expect(screen.getByText('vue')).toBeInTheDocument();
  });

  it('should show quality score badges', () => {
    mockUseGenerations.mockReturnValue({
      data: mockGenerations,
      isLoading: false,
      error: null,
    } as any);

    render(<GenerationHistory projectId="proj-1" />);

    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('78%')).toBeInTheDocument();
  });

  it('should show refinement indicator for child generations', () => {
    mockUseGenerations.mockReturnValue({
      data: mockGenerations,
      isLoading: false,
      error: null,
    } as any);

    render(<GenerationHistory projectId="proj-1" />);

    expect(screen.getByText('Refinement')).toBeInTheDocument();
  });

  it('should truncate long prompts', () => {
    mockUseGenerations.mockReturnValue({
      data: mockGenerations,
      isLoading: false,
      error: null,
    } as any);

    render(<GenerationHistory projectId="proj-1" />);

    const longPrompt = mockGenerations[1].prompt;
    expect(screen.getByText(longPrompt.substring(0, 100) + '...')).toBeInTheDocument();
  });

  it('should call onSelectGeneration when load button clicked', () => {
    mockUseGenerations.mockReturnValue({
      data: mockGenerations,
      isLoading: false,
      error: null,
    } as any);

    const onSelect = jest.fn();
    render(<GenerationHistory projectId="proj-1" onSelectGeneration={onSelect} />);

    const loadButtons = screen.getAllByTitle('Load code');
    fireEvent.click(loadButtons[0]);
    expect(onSelect).toHaveBeenCalledWith(mockGenerations[0].generated_code, mockGenerations[0].id);
  });

  it('should call onForkGeneration when fork button clicked', () => {
    mockUseGenerations.mockReturnValue({
      data: mockGenerations,
      isLoading: false,
      error: null,
    } as any);

    const onFork = jest.fn();
    render(<GenerationHistory projectId="proj-1" onForkGeneration={onFork} />);

    const forkButtons = screen.getAllByTitle('Fork as new conversation');
    fireEvent.click(forkButtons[2]);
    expect(onFork).toHaveBeenCalledWith(
      mockGenerations[2].generated_code,
      mockGenerations[2].prompt
    );
  });

  it('should copy code to clipboard on copy button click', async () => {
    mockUseGenerations.mockReturnValue({
      data: mockGenerations,
      isLoading: false,
      error: null,
    } as any);

    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });

    render(<GenerationHistory projectId="proj-1" />);

    const copyButtons = screen.getAllByTitle('Copy code');
    fireEvent.click(copyButtons[0]);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockGenerations[0].generated_code);
    });
  });

  it('should call delete mutation on delete button click', async () => {
    mockUseGenerations.mockReturnValue({
      data: mockGenerations,
      isLoading: false,
      error: null,
    } as any);

    render(<GenerationHistory projectId="proj-1" />);

    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockDeleteMutateAsync).toHaveBeenCalledWith({
        generationId: 'gen-1',
        projectId: 'proj-1',
      });
    });
  });
});
