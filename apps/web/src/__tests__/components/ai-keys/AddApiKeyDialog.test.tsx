/**
 * AddApiKeyDialog Component Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddApiKeyDialog } from '@/components/ai-keys/AddApiKeyDialog';
import { useAIKeyStore } from '@/stores/ai-keys';

jest.mock('@/stores/ai-keys');
jest.mock('@/lib/encryption', () => ({
  AI_PROVIDERS: {
    openai: {
      name: 'OpenAI',
      models: ['gpt-4', 'gpt-3.5-turbo'],
      maxTokens: 128000,
      rateLimitPerMinute: 3500,
      requiresOrganization: true,
    },
    anthropic: {
      name: 'Anthropic',
      models: ['claude-3-5-sonnet-20241022'],
      maxTokens: 200000,
      rateLimitPerMinute: 1000,
    },
    google: {
      name: 'Google AI',
      models: ['gemini-1.5-pro-latest'],
      maxTokens: 2097152,
      rateLimitPerMinute: 60,
    },
    siza: {
      name: 'Siza AI',
      models: ['siza-auto'],
      maxTokens: 2097152,
      rateLimitPerMinute: 60,
    },
  },
}));

const mockUseAIKeyStore = jest.mocked(useAIKeyStore);

describe('AddApiKeyDialog', () => {
  const baseMock = {
    addApiKey: jest.fn(),
    loading: false,
    error: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAIKeyStore.mockReturnValue(baseMock as any);
  });

  it('renders dialog title and description when open', () => {
    render(<AddApiKeyDialog open={true} onOpenChange={jest.fn()} />);
    expect(screen.getByRole('heading', { name: /Add API Key/i })).toBeInTheDocument();
    expect(screen.getByText(/Add a new API key for AI-powered/)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<AddApiKeyDialog open={false} onOpenChange={jest.fn()} />);
    expect(screen.queryByText('Add API Key')).not.toBeInTheDocument();
  });

  it('renders provider selection buttons', () => {
    render(<AddApiKeyDialog open={true} onOpenChange={jest.fn()} />);
    expect(screen.getAllByText('OpenAI').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Anthropic').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Google AI').length).toBeGreaterThan(0);
  });

  it('renders API key input field', () => {
    render(<AddApiKeyDialog open={true} onOpenChange={jest.fn()} />);
    expect(screen.getByLabelText('API Key')).toBeInTheDocument();
  });

  it('submit button is disabled when api key is empty', () => {
    render(<AddApiKeyDialog open={true} onOpenChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: /Add API Key/i })).toBeDisabled();
  });

  it('submit button is enabled when api key is entered', async () => {
    const user = userEvent.setup();
    render(<AddApiKeyDialog open={true} onOpenChange={jest.fn()} />);
    await user.type(screen.getByLabelText('API Key'), 'sk-test-key');
    expect(screen.getByRole('button', { name: /Add API Key/i })).toBeEnabled();
  });

  it('calls addApiKey on form submit with valid key', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    const addApiKey = jest.fn().mockResolvedValue(undefined);
    mockUseAIKeyStore.mockReturnValue({ ...baseMock, addApiKey } as any);

    render(<AddApiKeyDialog open={true} onOpenChange={onOpenChange} />);
    await user.type(screen.getByLabelText('API Key'), 'sk-proj-test123');
    await user.click(screen.getByRole('button', { name: /Add API Key/i }));

    await waitFor(() => expect(addApiKey).toHaveBeenCalledWith('openai', 'sk-proj-test123'));
  });

  it('calls onOpenChange(false) after successful submit', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    const addApiKey = jest.fn().mockResolvedValue(undefined);
    mockUseAIKeyStore.mockReturnValue({ ...baseMock, addApiKey } as any);

    render(<AddApiKeyDialog open={true} onOpenChange={onOpenChange} />);
    await user.type(screen.getByLabelText('API Key'), 'sk-ant-test');
    await user.click(screen.getByRole('button', { name: /Add API Key/i }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('calls onOpenChange(false) when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    render(<AddApiKeyDialog open={true} onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows error alert when store has error', () => {
    mockUseAIKeyStore.mockReturnValue({ ...baseMock, error: 'Invalid API key' } as any);
    render(<AddApiKeyDialog open={true} onOpenChange={jest.fn()} />);
    expect(screen.getByText('Invalid API key')).toBeInTheDocument();
  });

  it('shows loading state on submit button when loading', () => {
    mockUseAIKeyStore.mockReturnValue({ ...baseMock, loading: true } as any);
    render(<AddApiKeyDialog open={true} onOpenChange={jest.fn()} />);
    expect(screen.getByText('Adding...')).toBeInTheDocument();
  });

  it('renders with defaultProvider set to anthropic', () => {
    render(<AddApiKeyDialog open={true} onOpenChange={jest.fn()} defaultProvider="anthropic" />);
    // Placeholder changes based on selected provider
    expect(screen.getByPlaceholderText('sk-ant-...')).toBeInTheDocument();
  });

  it('renders security notice about AES-256 encryption', () => {
    render(<AddApiKeyDialog open={true} onOpenChange={jest.fn()} />);
    expect(screen.getByText(/encrypted locally with AES-256/)).toBeInTheDocument();
  });
});
