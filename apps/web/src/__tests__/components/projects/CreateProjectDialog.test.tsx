import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';

const mockCreateProject = {
  mutateAsync: jest.fn(),
  isPending: false,
};
jest.mock('@/hooks/use-projects', () => ({
  useCreateProject: () => mockCreateProject,
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    type,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} type={(type as 'button' | 'submit') || 'button'}>
      {children}
    </button>
  ),
}));

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  onSuccess: jest.fn(),
};

describe('CreateProjectDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateProject.mutateAsync.mockResolvedValue({ id: 'new-proj' });
    mockCreateProject.isPending = false;
  });

  it('renders form when open=true', () => {
    render(<CreateProjectDialog {...defaultProps} />);
    expect(
      screen.getByLabelText(/name/i) || screen.getByDisplayValue('') || screen.getByRole('textbox')
    ).toBeInTheDocument();
  });

  it('does not render when open=false', () => {
    render(<CreateProjectDialog {...defaultProps} open={false} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('pre-fills framework with defaultFramework', () => {
    render(<CreateProjectDialog {...defaultProps} defaultFramework="vue" />);
    const select = document.getElementById('cpd-framework') as HTMLSelectElement;
    expect(select?.value).toBe('vue');
  });

  it('calls onOpenChange(false) when Cancel is clicked', () => {
    render(<CreateProjectDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('submits form and calls onSuccess with project id', async () => {
    render(<CreateProjectDialog {...defaultProps} />);
    const nameInput = document.getElementById('cpd-name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Project' } });
    fireEvent.click(screen.getByText('Create'));
    await waitFor(() => {
      expect(mockCreateProject.mutateAsync).toHaveBeenCalled();
      expect(defaultProps.onSuccess).toHaveBeenCalledWith('new-proj');
    });
  });

  it('shows Creating... when isSubmitting', async () => {
    mockCreateProject.mutateAsync.mockImplementation(() => new Promise(() => {}));
    render(<CreateProjectDialog {...defaultProps} />);
    const nameInput = document.getElementById('cpd-name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Project' } });
    fireEvent.click(screen.getByText('Create'));
    await waitFor(() => {
      expect(screen.getByText('Creating...')).toBeInTheDocument();
    });
  });

  it('shows error message when mutation fails', async () => {
    mockCreateProject.mutateAsync.mockRejectedValue(new Error('Server error'));
    render(<CreateProjectDialog {...defaultProps} />);
    const nameInput = document.getElementById('cpd-name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Project' } });
    fireEvent.click(screen.getByText('Create'));
    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });
  });
});
