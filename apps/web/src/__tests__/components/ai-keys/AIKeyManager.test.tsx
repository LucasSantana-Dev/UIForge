/**
 * AI Key Manager Component Tests
 * Tests for AI key management UI component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AIKeyManager } from '@/components/ai-keys/AIKeyManager';
import { useAIKeyStore } from '@/stores/ai-keys';
import { AIProvider } from '@/lib/encryption';
import { TEST_CONFIG } from '../../../../../../test-config';

// Mock the store
jest.mock('@/stores/ai-keys');

const mockUseAIKeyStore = useAIKeyStore as jest.MockedFunction<typeof useAIKeyStore>;

describe('AIKeyManager', () => {
  const mockStore = {
    apiKeys: [
      {
        provider: 'openai' as AIProvider,
        keyName: 'OpenAI Key',
        encryptedKey: 'encrypted-key-1',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        provider: 'anthropic' as AIProvider,
        keyName: 'Anthropic Key',
        encryptedKey: 'encrypted-key-2',
        isActive: false,
        createdAt: new Date().toISOString(),
      },
    ],
    isLoading: false,
    error: null,
    addApiKey: jest.fn(),
    removeApiKey: jest.fn(),
    updateApiKey: jest.fn(),
    toggleApiKey: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAIKeyStore.mockReturnValue(mockStore);
  });

  it('should render AI key manager', () => {
    render(<AIKeyManager />);

    expect(screen.getByText('AI API Keys')).toBeInTheDocument();
    expect(screen.getByText('OpenAI Key')).toBeInTheDocument();
    expect(screen.getByText('Anthropic Key')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockUseAIKeyStore.mockReturnValue({
      ...mockStore,
      isLoading: true,
    });

    render(<AIKeyManager />);

    expect(screen.getByText('Loading API keys...')).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseAIKeyStore.mockReturnValue({
      ...mockStore,
      error: 'Failed to load API keys',
    });

    render(<AIKeyManager />);

    expect(screen.getByText('Failed to load API keys')).toBeInTheDocument();
  });

  it('should add new API key', async () => {
    render(<AIKeyManager />);

    // Click add button
    const addButton = screen.getByText('Add API Key');
    await userEvent.click(addButton);

    // Fill form
    const providerSelect = screen.getByLabelText(/provider/i);
    const keyNameInput = screen.getByLabelText(/key name/i);
    const apiKeyInput = screen.getByLabelText(/api key/i);

    await userEvent.selectOptions(providerSelect, 'openai');
    await userEvent.type(keyNameInput, 'Test Key');
    await userEvent.type(apiKeyInput, TEST_CONFIG.API_KEYS.OPENAI);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /add key/i });
    await userEvent.click(submitButton);

    expect(mockStore.addApiKey).toHaveBeenCalledWith({
      provider: 'openai' as AIProvider,
      keyName: 'Test Key',
      apiKey: TEST_CONFIG.API_KEYS.OPENAI,
    });
  });

  it('should toggle API key active status', async () => {
    render(<AIKeyManager />);

    // Find toggle for OpenAI key
    const openaiToggle = screen.getByLabelText(/toggle openai key/i);
    await userEvent.click(openaiToggle);

    expect(mockStore.toggleApiKey).toHaveBeenCalledWith('openai');
  });

  it('should remove API key', async () => {
    render(<AIKeyManager />);

    // Find delete button for OpenAI key
    const deleteButton = screen.getByLabelText(/delete openai key/i);
    await userEvent.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(confirmButton);

    expect(mockStore.removeApiKey).toHaveBeenCalledWith('openai');
  });

  it('should validate API key format', async () => {
    render(<AIKeyManager />);

    // Click add button
    const addButton = screen.getByText('Add API Key');
    await userEvent.click(addButton);

    // Fill form with invalid key
    const providerSelect = screen.getByLabelText(/provider/i);
    const keyNameInput = screen.getByLabelText(/key name/i);
    const apiKeyInput = screen.getByLabelText(/api key/i);

    await userEvent.selectOptions(providerSelect, 'openai');
    await userEvent.type(keyNameInput, 'Test Key');
    await userEvent.type(apiKeyInput, 'invalid-key');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /add key/i });
    await userEvent.click(submitButton);

    // Should show validation error
    expect(screen.getByText(/invalid api key format/i)).toBeInTheDocument();
  });

  it('should handle empty API keys list', () => {
    mockUseAIKeyStore.mockReturnValue({
      ...mockStore,
      apiKeys: [],
    });

    render(<AIKeyManager />);

    expect(screen.getByText('No API keys configured')).toBeInTheDocument();
    expect(screen.getByText('Add your first API key to get started')).toBeInTheDocument();
  });

  it('should sort API keys by provider', () => {
    render(<AIKeyManager />);

    const keys = screen.getAllByTestId(/api-key-/);
    expect(keys).toHaveLength(2);

    // Should be sorted by provider name
    expect(keys[0]).toHaveTextContent('Anthropic Key');
    expect(keys[1]).toHaveTextContent('OpenAI Key');
  });

  it('should show API key status indicators', () => {
    render(<AIKeyManager />);

    // Active key should show green indicator
    const activeIndicator = screen.getByTestId(/openai-active-indicator/);
    expect(activeIndicator).toHaveClass('bg-green-500');

    // Inactive key should show gray indicator
    const inactiveIndicator = screen.getByTestId(/anthropic-active-indicator/);
    expect(inactiveIndicator).toHaveClass('bg-gray-500');
  });
});
