import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateProjectForm from '@/components/projects/CreateProjectForm';

const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

const mockCreateProject = {
  mutateAsync: jest.fn(),
  isPending: false,
};
const mockUpdateProject = {
  mutateAsync: jest.fn(),
};
const mockUploadThumbnail = jest.fn();

jest.mock('@/hooks/use-projects', () => ({
  useCreateProject: () => mockCreateProject,
  useUpdateProject: () => mockUpdateProject,
}));

jest.mock('@/hooks/use-project-thumbnail', () => ({
  useProjectThumbnail: () => ({
    uploadThumbnail: mockUploadThumbnail,
    uploading: false,
  }),
}));

jest.mock('@/components/analytics/AnalyticsProvider', () => ({
  trackProjectCreation: jest.fn(),
}));

describe('CreateProjectForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateProject.mutateAsync.mockResolvedValue({ id: 'proj-123' });
    mockUpdateProject.mutateAsync.mockResolvedValue({});
  });

  it('renders name and description inputs', () => {
    render(<CreateProjectForm />);
    expect(document.getElementById('name')).toBeInTheDocument();
    expect(document.getElementById('description')).toBeInTheDocument();
  });

  it('defaults framework to react', () => {
    render(<CreateProjectForm />);
    const select = document.getElementById('framework') as HTMLSelectElement;
    expect(select?.value).toBe('react');
  });

  it('calls router.back() when Cancel is clicked', () => {
    render(<CreateProjectForm />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('shows validation error for short project name', async () => {
    render(<CreateProjectForm />);
    const nameInput = document.getElementById('name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'AB' } });
    fireEvent.click(screen.getByText('Create Project'));
    await waitFor(() => {
      expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
    });
  });

  it('submits form and navigates to project page on success', async () => {
    render(<CreateProjectForm />);
    const nameInput = document.getElementById('name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'My New Project' } });
    fireEvent.click(screen.getByText('Create Project'));
    await waitFor(() => {
      expect(mockCreateProject.mutateAsync).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/projects/proj-123');
    });
  });

  it('shows error message when creation fails', async () => {
    mockCreateProject.mutateAsync.mockRejectedValue(new Error('Creation failed'));
    render(<CreateProjectForm />);
    const nameInput = document.getElementById('name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'My New Project' } });
    fireEvent.click(screen.getByText('Create Project'));
    await waitFor(() => {
      expect(screen.getByText(/creation failed/i)).toBeInTheDocument();
    });
  });

  it('shows Creating... when submitting', async () => {
    mockCreateProject.mutateAsync.mockImplementation(() => new Promise(() => {}));
    render(<CreateProjectForm />);
    const nameInput = document.getElementById('name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'My New Project' } });
    fireEvent.click(screen.getByText('Create Project'));
    await waitFor(() => {
      expect(screen.getByText('Creating...')).toBeInTheDocument();
    });
  });
});
