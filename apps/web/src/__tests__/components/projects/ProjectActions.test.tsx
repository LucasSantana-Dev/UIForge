import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProjectActions from '@/components/projects/ProjectActions';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockDeleteProject = {
  mutateAsync: jest.fn(),
  isPending: false,
};
jest.mock('@/hooks/use-projects', () => ({
  useDeleteProject: () => mockDeleteProject,
}));

// lucide-react icons used in this component
jest.mock('lucide-react', () => ({
  MoreVerticalIcon: () => <span data-testid="more-icon" />,
  Edit2Icon: () => <span data-testid="edit-icon" />,
  TrashIcon: () => <span data-testid="trash-icon" />,
}));

describe('ProjectActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleteProject.mutateAsync.mockResolvedValue(undefined);
    mockDeleteProject.isPending = false;
  });

  it('renders the trigger button', () => {
    render(<ProjectActions projectId="proj-1" projectName="My Project" />);
    // The MoreVertical toggle button is the only initial button
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('shows Edit and Delete options after clicking trigger button', () => {
    render(<ProjectActions projectId="proj-1" projectName="My Project" />);
    const toggleBtn = screen.getAllByRole('button')[0];
    fireEvent.click(toggleBtn);
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('navigates to edit page when Edit is clicked', () => {
    render(<ProjectActions projectId="proj-1" projectName="My Project" />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByText('Edit'));
    expect(mockPush).toHaveBeenCalledWith('/projects/proj-1/edit');
  });

  it('opens delete confirmation dialog when Delete is clicked', () => {
    render(<ProjectActions projectId="proj-1" projectName="My Project" />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByText('Delete'));
    // Confirmation dialog shows project name and confirmation text
    expect(screen.getByText('My Project')).toBeInTheDocument();
    expect(screen.getByText(/delete project/i)).toBeInTheDocument();
  });

  it('calls deleteProject.mutateAsync with projectId on confirm', async () => {
    render(<ProjectActions projectId="proj-1" projectName="My Project" />);
    // Open menu
    fireEvent.click(screen.getAllByRole('button')[0]);
    // Click Delete in menu
    fireEvent.click(screen.getByText('Delete'));
    // Click the confirm Delete button in dialog (last button with text 'Delete')
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);
    await waitFor(() => {
      expect(mockDeleteProject.mutateAsync).toHaveBeenCalledWith('proj-1');
    });
  });

  it('shows Deleting... when isPending', () => {
    mockDeleteProject.isPending = true;
    render(<ProjectActions projectId="proj-1" projectName="My Project" />);
    // Open menu
    fireEvent.click(screen.getAllByRole('button')[0]);
    // Click Delete in menu to open confirmation
    fireEvent.click(screen.getByText('Delete'));
    expect(screen.getByText('Deleting...')).toBeInTheDocument();
  });

  it('closes menu when Cancel is clicked in confirm dialog', () => {
    render(<ProjectActions projectId="proj-1" projectName="My Project" />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByText('Delete'));
    fireEvent.click(screen.getByText('Cancel'));
    // Dialog should be closed — project name in dialog gone
    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
  });
});
