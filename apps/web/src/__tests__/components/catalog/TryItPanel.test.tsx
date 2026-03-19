import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import TryItPanel from '@/components/catalog/api-docs/TryItPanel';
import type { Endpoint } from '@/lib/openapi/types';

jest.mock('lucide-react', () => ({
  PlayIcon: () => <svg data-testid="play-icon" />,
  CopyIcon: () => <svg data-testid="copy-icon" />,
  CheckIcon: () => <svg data-testid="check-icon" />,
  LoaderIcon: () => <svg data-testid="loader-icon" />,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    className,
  }: React.PropsWithChildren<{ onClick?: () => void; disabled?: boolean; className?: string }>) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({
    value,
    onChange,
    placeholder,
    className,
  }: {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
  }) => <input value={value} onChange={onChange} placeholder={placeholder} className={className} />,
}));

jest.mock('@/lib/openapi/types', () => ({
  METHOD_COLORS: {
    get: 'text-green-400 bg-green-400/10',
    post: 'text-blue-400 bg-blue-400/10',
    put: 'text-amber-400 bg-amber-400/10',
    delete: 'text-red-400 bg-red-400/10',
    patch: 'text-purple-400 bg-purple-400/10',
  },
}));

const makeEndpoint = (overrides: Partial<Endpoint['operation']> = {}): Endpoint => ({
  method: 'get',
  path: '/api/test',
  operation: {
    summary: 'Test endpoint',
    parameters: [],
    responses: {},
    ...overrides,
  },
});

describe('TryItPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
    global.fetch = jest.fn();
  });

  it('renders Try It label', () => {
    render(<TryItPanel endpoint={makeEndpoint()} baseUrl="https://api.example.com" />);
    expect(screen.getByText('Try It')).toBeInTheDocument();
  });

  it('renders Send button', () => {
    render(<TryItPanel endpoint={makeEndpoint()} baseUrl="https://api.example.com" />);
    expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument();
  });

  it('renders path in URL display', () => {
    render(<TryItPanel endpoint={makeEndpoint()} baseUrl="https://api.example.com" />);
    expect(screen.getByText('https://api.example.com/api/test')).toBeInTheDocument();
  });

  it('renders query parameter inputs', () => {
    const endpoint = makeEndpoint({
      parameters: [{ name: 'limit', in: 'query', required: false, schema: { type: 'integer' } }],
    });
    render(<TryItPanel endpoint={endpoint} baseUrl="https://api.example.com" />);
    expect(screen.getByText('limit')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('integer')).toBeInTheDocument();
  });

  it('renders required marker for required params', () => {
    const endpoint = makeEndpoint({
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
    });
    render(<TryItPanel endpoint={endpoint} baseUrl="https://api.example.com" />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders select for enum params', () => {
    const endpoint = makeEndpoint({
      parameters: [
        {
          name: 'status',
          in: 'query',
          required: false,
          schema: { type: 'string', enum: ['active', 'inactive'] },
        },
      ],
    });
    render(<TryItPanel endpoint={endpoint} baseUrl="https://api.example.com" />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('inactive')).toBeInTheDocument();
  });

  it('renders request body textarea for POST methods', () => {
    const endpoint: Endpoint = {
      method: 'post',
      path: '/api/test',
      operation: {
        summary: 'Create',
        parameters: [],
        responses: {},
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { name: { type: 'string' } },
              },
            },
          },
        },
      },
    };
    render(<TryItPanel endpoint={endpoint} baseUrl="https://api.example.com" />);
    expect(screen.getByText('Request body')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows response after successful fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify({ data: 'test' }),
    });

    render(<TryItPanel endpoint={makeEndpoint()} baseUrl="https://api.example.com" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Send/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/200/)).toBeInTheDocument();
      expect(screen.getByText(/OK/)).toBeInTheDocument();
    });
  });

  it('shows error response on network failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Connection failed'));

    render(<TryItPanel endpoint={makeEndpoint()} baseUrl="https://api.example.com" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Send/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/Network Error/i)).toBeInTheDocument();
      expect(screen.getByText(/Connection failed/)).toBeInTheDocument();
    });
  });

  it('copies response body to clipboard', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      statusText: 'OK',
      text: async () => '{"key":"value"}',
    });

    render(<TryItPanel endpoint={makeEndpoint()} baseUrl="https://api.example.com" />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Send/i }));
    });

    await waitFor(() => expect(screen.getByTitle('Copy response')).toBeInTheDocument());
    fireEvent.click(screen.getByTitle('Copy response'));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('"key": "value"')
    );
  });
});
