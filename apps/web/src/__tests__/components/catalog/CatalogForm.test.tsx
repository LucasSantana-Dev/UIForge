import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CatalogForm from '@/components/catalog/CatalogForm';

const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  (global.fetch as jest.Mock) = jest.fn();
});

describe('CatalogForm', () => {
  it('renders all form fields', () => {
    render(<CatalogForm mode="create" />);
    expect(screen.getByLabelText(/^Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Display Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Type/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Lifecycle/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Team/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Repository URL/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Documentation URL/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tags/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dependencies/)).toBeInTheDocument();
  });

  it('shows create button in create mode', () => {
    render(<CatalogForm mode="create" />);
    expect(screen.getByText('Create Entry')).toBeInTheDocument();
  });

  it('shows update button in edit mode', () => {
    render(<CatalogForm mode="edit" entryId="entry-1" />);
    expect(screen.getByText('Update Entry')).toBeInTheDocument();
  });

  it('disables name field in edit mode', () => {
    render(<CatalogForm mode="edit" entryId="entry-1" initialData={{ name: 'my-service' }} />);
    expect(screen.getByLabelText(/^Name/)).toBeDisabled();
  });

  it('populates initial data', () => {
    render(
      <CatalogForm
        mode="edit"
        entryId="entry-1"
        initialData={{
          name: 'siza-web',
          display_name: 'Siza Web',
          type: 'service',
          lifecycle: 'production',
          team: 'Platform',
          tags: 'typescript, nextjs',
        }}
      />
    );
    expect(screen.getByLabelText(/^Name/)).toHaveValue('siza-web');
    expect(screen.getByLabelText(/Display Name/)).toHaveValue('Siza Web');
    expect(screen.getByLabelText(/Team/)).toHaveValue('Platform');
    expect(screen.getByLabelText(/Tags/)).toHaveValue('typescript, nextjs');
  });

  it('submits create request with correct payload', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { id: 'new-1' } }),
    });

    render(<CatalogForm mode="create" />);

    fireEvent.change(screen.getByLabelText(/^Name/), {
      target: { value: 'my-api' },
    });
    fireEvent.change(screen.getByLabelText(/Display Name/), {
      target: { value: 'My API' },
    });
    fireEvent.change(screen.getByLabelText(/Tags/), {
      target: { value: 'api, backend' },
    });
    fireEvent.submit(screen.getByText('Create Entry'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/catalog',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"name":"my-api"'),
        })
      );
    });
  });

  it('submits update request with PATCH', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { id: 'entry-1' } }),
    });

    render(
      <CatalogForm
        mode="edit"
        entryId="entry-1"
        initialData={{ name: 'siza-web', display_name: 'Siza Web' }}
      />
    );

    fireEvent.change(screen.getByLabelText(/Display Name/), {
      target: { value: 'Siza Web Updated' },
    });
    fireEvent.submit(screen.getByText('Update Entry'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/catalog/entry-1',
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });

  it('shows error on failed submission', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Duplicate name' }),
    });

    render(<CatalogForm mode="create" />);

    fireEvent.change(screen.getByLabelText(/^Name/), {
      target: { value: 'dup' },
    });
    fireEvent.change(screen.getByLabelText(/Display Name/), {
      target: { value: 'Dup' },
    });
    fireEvent.submit(screen.getByText('Create Entry'));

    await waitFor(() => {
      expect(screen.getByText('Duplicate name')).toBeInTheDocument();
    });
  });

  it('navigates back on cancel', () => {
    render(<CatalogForm mode="create" />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('calls onSuccess callback when provided', async () => {
    const onSuccess = jest.fn();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { id: 'new-1' } }),
    });

    render(<CatalogForm mode="create" onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/^Name/), {
      target: { value: 'test' },
    });
    fireEvent.change(screen.getByLabelText(/Display Name/), {
      target: { value: 'Test' },
    });
    fireEvent.submit(screen.getByText('Create Entry'));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
