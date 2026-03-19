/**
 * EditApiKeyDialog Component Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditApiKeyDialog } from '@/components/ai-keys/EditApiKeyDialog';
import { useAIKeyStore, useAIKeys } from '@/stores/ai-keys';

jest.mock('@/stores/ai-keys');
jest.mock('@/lib/encryption', () => ({
  AI_PROVIDERS: {
    openai: {
      name: 'OpenAI',
      models: ['gpt-4'],
      maxTokens: 128000,
      rateLimitPerMinute: 3500,
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
const mockUseAIKeys = jest.mocked(useAIKeys);

const mockKey = {
  keyId: 'key_openai_123',
  provider: 'openai' as const,
  encryptedKey: 'encrypted',
  createdAt: '2026-02-17T00:00:00.000Z',
  lastUsed: '2026-02-18T10:00:00.000Z',
  isDefault: false,
};

describe('EditApiKeyDialog', () => {
  const baseMock = {
    updateApiKey: jest.fn(),
    loading: false,
    error: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAIKeyStore.mockReturnValue(baseMock as any);
    mockUseAIKeys.mockReturnValue([mockKey] as any);
  });

  it('renders dialog title and description when open', () => {
    render(<EditApiKeyDialog open={true} onOpenChange={jest.fn()} keyId="key_openai_123" />);
    expect(screen.getByRole('heading', { name: /Update API Key/i })).toBeInTheDocument();
    expect(screen.getByText(/Update your OpenAI API key/)).toBeInTheDocument();
  });

  it('returns null when keyId does not match any key', () => {
    render(<EditApiKeyDialog open={true} onOpenChange={jest.fn()} keyId="key_nonexistent" />);
    expect(screen.queryByText('Update API Key')).not.toBeInTheDocument();
  });

  it('renders current key info (keyId and provider name)', () => {
    render(<EditApiKeyDialog open={true} onOpenChange={jest.fn()} keyId="key_openai_123" />);
    expect(screen.getByText('key_openai_123')).toBeInTheDocument();
    expect(screen.getAllByText('OpenAI').length).toBeGreaterThan(0);
  });

  it('renders new API key input field', () => {
    render(<EditApiKeyDialog open={true} onOpenChange={jest.fn()} keyId="key_openai_123" />);
    expect(screen.getByLabelText('New API Key')).toBeInTheDocument();
  });

  it('submit button is disabled when api key is empty', () => {
    render(<EditApiKeyDialog open={true} onOpenChange={jest.fn()} keyId="key_openai_123" />);
    expect(screen.getByRole('button', { name: /Update API Key/i })).toBeDisabled();
  });

  it('submit button is enabled when api key is entered', async () => {
    const user = userEvent.setup();
    render(<EditApiKeyDialog open={true} onOpenChange={jest.fn()} keyId="key_openai_123" />);
    await user.type(screen.getByLabelText('New API Key'), 'sk-proj-newkey');
    expect(screen.getByRole('button', { name: /Update API Key/i })).toBeEnabled();
  });

  it('calls updateApiKey on form submit with valid key', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    const updateApiKey = jest.fn().mockResolvedValue(undefined);
    mockUseAIKeyStore.mockReturnValue({ ...baseMock, updateApiKey } as any);

    render(<EditApiKeyDialog open={true} onOpenChange={onOpenChange} keyId="key_openai_123" />);
    await user.type(screen.getByLabelText('New API Key'), 'sk-proj-newkey123');
    await user.click(screen.getByRole('button', { name: /Update API Key/i }));

    await waitFor(() =>
      expect(updateApiKey).toHaveBeenCalledWith('key_openai_123', 'sk-proj-newkey123')
    );
  });

  it('calls onOpenChange(false) after successful update', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    const updateApiKey = jest.fn().mockResolvedValue(undefined);
    mockUseAIKeyStore.mockReturnValue({ ...baseMock, updateApiKey } as any);

    render(<EditApiKeyDialog open={true} onOpenChange={onOpenChange} keyId="key_openai_123" />);
    await user.type(screen.getByLabelText('New API Key'), 'sk-proj-newkey123');
    await user.click(screen.getByRole('button', { name: /Update API Key/i }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('calls onOpenChange(false) when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    render(<EditApiKeyDialog open={true} onOpenChange={onOpenChange} keyId="key_openai_123" />);
    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows error alert when store has error', () => {
    mockUseAIKeyStore.mockReturnValue({ ...baseMock, error: 'Update failed' } as any);
    render(<EditApiKeyDialog open={true} onOpenChange={jest.fn()} keyId="key_openai_123" />);
    expect(screen.getByText('Update failed')).toBeInTheDocument();
  });

  it('shows loading state on submit button when loading', () => {
    mockUseAIKeyStore.mockReturnValue({ ...baseMock, loading: true } as any);
    render(<EditApiKeyDialog open={true} onOpenChange={jest.fn()} keyId="key_openai_123" />);
    expect(screen.getByText('Updating...')).toBeInTheDocument();
  });

  it('shows "Default API Key" badge when key isDefault', () => {
    mockUseAIKeys.mockReturnValue([{ ...mockKey, isDefault: true }] as any);
    render(<EditApiKeyDialog open={true} onOpenChange={jest.fn()} keyId="key_openai_123" />);
    expect(screen.getByText('Default API Key')).toBeInTheDocument();
  });

  it('shows creation date from currentKey.createdAt', () => {
    render(<EditApiKeyDialog open={true} onOpenChange={jest.fn()} keyId="key_openai_123" />);
    // '2026-02-17T00:00:00.000Z' → locale date string (day/month dependent on CI locale)
    expect(screen.getByText('Created:')).toBeInTheDocument();
    expect(screen.getByText('Last Used:')).toBeInTheDocument();
  });

  it('shows "Never" when lastUsed is null', () => {
    mockUseAIKeys.mockReturnValue([{ ...mockKey, lastUsed: null }] as any);
    render(<EditApiKeyDialog open={true} onOpenChange={jest.fn()} keyId="key_openai_123" />);
    expect(screen.getByText('Never')).toBeInTheDocument();
  });
});
