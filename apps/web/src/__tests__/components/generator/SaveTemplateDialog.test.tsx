import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SaveTemplateDialog } from '@/components/generator/SaveTemplateDialog';

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  code: 'export default function MyComponent() { return <div />; }',
  framework: 'react',
};

beforeEach(() => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true })) as jest.Mock;
  jest.clearAllMocks();
});

describe('SaveTemplateDialog', () => {
  it('renders null when open=false', () => {
    const { container } = render(<SaveTemplateDialog {...defaultProps} open={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders dialog when open=true', () => {
    render(<SaveTemplateDialog {...defaultProps} />);
    expect(screen.getByText('Save as Template')).toBeInTheDocument();
  });

  it('renders Name, Description, and Category fields', () => {
    render(<SaveTemplateDialog {...defaultProps} />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
  });

  it('shows validation error when name is less than 3 characters', async () => {
    render(<SaveTemplateDialog {...defaultProps} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'AB' } });
    fireEvent.click(screen.getByRole('button', { name: /save template/i }));
    await waitFor(() => {
      expect(screen.getByText('Name must be at least 3 characters')).toBeInTheDocument();
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows validation error when name is empty', async () => {
    render(<SaveTemplateDialog {...defaultProps} />);
    // Name is empty by default — Save Template button disabled
    const saveBtn = screen.getByRole('button', { name: /save template/i });
    expect(saveBtn).toBeDisabled();
  });

  it('calls fetch with POST on valid save', async () => {
    render(<SaveTemplateDialog {...defaultProps} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Login Form' } });
    fireEvent.click(screen.getByRole('button', { name: /save template/i }));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/templates',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.name).toBe('Login Form');
    expect(body.framework).toBe('react');
  });

  it('shows success state after save', async () => {
    render(<SaveTemplateDialog {...defaultProps} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Login Form' } });
    fireEvent.click(screen.getByRole('button', { name: /save template/i }));
    await waitFor(() => {
      expect(screen.getByText('Template saved successfully!')).toBeInTheDocument();
    });
  });

  it('category select renders all 8 categories', () => {
    render(<SaveTemplateDialog {...defaultProps} />);
    const select = screen.getByLabelText('Category') as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.text);
    expect(options).toHaveLength(8);
    expect(options).toContain('Landing Page');
    expect(options).toContain('Dashboard');
    expect(options).toContain('Authentication');
    expect(options).toContain('E-commerce');
    expect(options).toContain('Blog');
    expect(options).toContain('Portfolio');
    expect(options).toContain('Admin');
    expect(options).toContain('Other');
  });

  it('includes description in POST body when provided', async () => {
    render(<SaveTemplateDialog {...defaultProps} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Login Form' } });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'A beautiful login form' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save template/i }));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.description).toBe('A beautiful login form');
  });

  it('shows error message when fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Name already taken' } }),
    });
    render(<SaveTemplateDialog {...defaultProps} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Login Form' } });
    fireEvent.click(screen.getByRole('button', { name: /save template/i }));
    await waitFor(() => {
      expect(screen.getByText('Name already taken')).toBeInTheDocument();
    });
  });

  it('Cancel button calls onOpenChange(false)', () => {
    render(<SaveTemplateDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('includes code in POST body', async () => {
    render(<SaveTemplateDialog {...defaultProps} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'My Card' } });
    fireEvent.click(screen.getByRole('button', { name: /save template/i }));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.code.files[0].content).toBe(defaultProps.code);
  });
});
