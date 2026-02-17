/**
 * AI Key Manager Component Tests
 * Tests for AI key management UI component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AIKeyManager } from '@/components/ai-keys/AIKeyManager';
import { useAIKeysStore } from '@/stores/ai-keys';
import { AIProvider } from '@/lib/encryption';

// Mock the store
jest.mock('@/stores/ai-keys');

const mockUseAIKeysStore = useAIKeysStore as jest.MockedFunction<typeof useAIKeysStore>;

describe('AIKeyManager', () => {
  const mockStore = {
    apiKeys: [
      {
        provider: 'openai' as AIProvider,
        keyId: 'key_openai_123',
        encryptedKey: 'encrypted_openai',
        createdAt: '2026-02-17T00:00:00.000Z',
        lastUsed: '2026-02-17T12:00:00.000Z',
        isDefault: true,
      },
      {
        provider: 'anthropic' as AIProvider,
        keyId: 'key_anthropic_456',
        encryptedKey: 'encrypted_anthropic',
        createdAt: '2026-02-16T00:00:00.000Z',
        lastUsed: '2026-02-16T10:00:00.000Z',
        isDefault: false,
      },
    ],
    isLoading: false,
    error: null,
    isInitialized: true,
    encryptionKey: 'test-encryption-key',
    hasApiKeys: true,
    keysByProvider: { openai: 1, anthropic: 1, google: 0 },
    defaultKeys: {
      openai: {
        provider: 'openai' as AIProvider,
        keyId: 'key_openai_123',
        encryptedKey: 'encrypted_openai',
        createdAt: '2026-02-17T00:00:00.000Z',
        lastUsed: '2026-02-17T12:00:00.000Z',
        isDefault: true,
      },
      anthropic: null,
      google: null,
    },
    initialize: jest.fn(),
    addApiKey: jest.fn(),
    loadApiKeys: jest.fn(),
    updateApiKey: jest.fn(),
    deleteApiKey: jest.fn(),
    setDefaultApiKey: jest.fn(),
    getDefaultApiKey: jest.fn(),
    generateComponent: jest.fn(),
    getUsageStats: jest.fn(),
    clearError: jest.fn(),
    reset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAIKeysStore.mockReturnValue(mockStore);
  });

  it('should render AI key manager', () => {
    render(<AIKeyManager />);
    
    expect(screen.getByText('AI API Keys')).toBeInTheDocument();
    expect(screen.getByText('Manage your API keys for different AI providers')).toBeInTheDocument();
  });

  it('should display existing API keys', () => {
    render(<AIKeyManager />);
    
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Anthropic')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument(); // Default badge for OpenAI key
  });

  it('should show loading state', () => {
    mockUseAIKeysStore.mockReturnValue({
      ...mockStore,
      isLoading: true,
    });
    
    render(<AIKeyManager />);
    
    expect(screen.getByText('Loading API keys...')).toBeInTheDocument();
  });

  it('should show empty state when no keys exist', () => {
    mockUseAIKeysStore.mockReturnValue({
      ...mockStore,
      apiKeys: [],
      hasApiKeys: false,
      keysByProvider: { openai: 0, anthropic: 0, google: 0 },
      defaultKeys: { openai: null, anthropic: null, google: null },
    });
    
    render(<AIKeyManager />);
    
    expect(screen.getByText('No API keys configured')).toBeInTheDocument();
    expect(screen.getByText('Add your first API key to start generating components')).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseAIKeysStore.mockReturnValue({
      ...mockStore,
      error: 'Failed to load API keys',
    });
    
    render(<AIKeyManager />);
    
    expect(screen.getByText('Failed to load API keys')).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('should open add key dialog when add button clicked', () => {
    render(<AIKeyManager />);
    
    const addButton = screen.getByText('Add API Key');
    fireEvent.click(addButton);
    
    // Dialog should open (implementation would show dialog)
    expect(mockStore.addApiKey).not.toHaveBeenCalled(); // Not called yet, dialog opens first
  });

  it('should delete API key when delete button clicked', async () => {
    render(<AIKeyManager />);
    
    const deleteButton = screen.getAllByText('Delete')[0]; // First delete button
    fireEvent.click(deleteButton);
    
    // Should show confirmation dialog
    await waitFor(() => {
      expect(screen.getByText('Delete API Key')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this API key?')).toBeInTheDocument();
    });
    
    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);
    
    expect(mockStore.deleteApiKey).toHaveBeenCalledWith('key_openai_123');
  });

  it('should set API key as default when set default button clicked', () => {
    render(<AIKeyManager />);
    
    const setDefaultButton = screen.getAllByText('Set as Default')[1]; // Anthropic key
    fireEvent.click(setDefaultButton);
    
    expect(mockStore.setDefaultApiKey).toHaveBeenCalledWith('key_anthropic_456');
  });

  it('should show provider statistics', () => {
    render(<AIKeyManager />);
    
    expect(screen.getByText('Total Keys: 2')).toBeInTheDocument();
    expect(screen.getByText('OpenAI: 1')).toBeInTheDocument();
    expect(screen.getByText('Anthropic: 1')).toBeInTheDocument();
    expect(screen.getByText('Google: 0')).toBeInTheDocument();
  });

  it('should refresh keys when refresh button clicked', () => {
    render(<AIKeyManager />);
    
    const refreshButton = screen.getByLabelText('Refresh API keys');
    fireEvent.click(refreshButton);
    
    expect(mockStore.loadApiKeys).toHaveBeenCalled();
  });

  it('should clear error when clear error button clicked', () => {
    mockUseAIKeysStore.mockReturnValue({
      ...mockStore,
      error: 'Some error occurred',
    });
    
    render(<AIKeyManager />);
    
    const clearErrorButton = screen.getByText('Dismiss');
    fireEvent.click(clearErrorButton);
    
    expect(mockStore.clearError).toHaveBeenCalled();
  });

  it('should show last used time for keys', () => {
    render(<AIKeyManager />);
    
    expect(screen.getByText(/Last used:/)).toBeInTheDocument();
    expect(screen.getByText(/Feb 17, 2026/)).toBeInTheDocument();
  });

  it('should show creation date for keys', () => {
    render(<AIKeyManager />);
    
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByText(/Feb 17, 2026/)).toBeInTheDocument();
  });

  it('should handle key expiration', () => {
    const expiredKey = {
      ...mockStore.apiKeys[0],
      createdAt: '2025-02-17T00:00:00.000Z', // 1 year ago
      isExpired: true,
    };
    
    mockUseAIKeysStore.mockReturnValue({
      ...mockStore,
      apiKeys: [expiredKey],
    });
    
    render(<AIKeyManager />);
    
    expect(screen.getByText('Expired')).toBeInTheDocument();
  });

  it('should show usage statistics when available', async () => {
    const mockStats = {
      totalKeys: 2,
      keysByProvider: { openai: 1, anthropic: 1, google: 0 },
      lastUsedTimes: {
        'key_openai_123': '2026-02-17T12:00:00.000Z',
        'key_anthropic_456': '2026-02-16T10:00:00.000Z',
      },
      expiredKeys: [],
    };
    
    mockStore.getUsageStats.mockResolvedValue(mockStats);
    
    render(<AIKeyManager />);
    
    // Click on usage stats button/tab
    const usageStatsButton = screen.getByText('Usage Statistics');
    fireEvent.click(usageStatsButton);
    
    await waitFor(() => {
      expect(mockStore.getUsageStats).toHaveBeenCalled();
    });
  });

  it('should filter keys by provider', () => {
    render(<AIKeyManager />);
    
    // Select OpenAI filter
    const openaiFilter = screen.getByText('OpenAI');
    fireEvent.click(openaiFilter);
    
    // Should only show OpenAI keys
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    // Anthropic key should be hidden
    expect(screen.queryByText('Anthropic')).not.toBeInTheDocument();
  });

  it('should search keys by name or provider', () => {
    render(<AIKeyManager />);
    
    const searchInput = screen.getByPlaceholderText('Search API keys...');
    fireEvent.change(searchInput, { target: { value: 'openai' } });
    
    // Should filter to show only OpenAI key
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.queryByText('Anthropic')).not.toBeInTheDocument();
  });

  it('should sort keys by different criteria', () => {
    render(<AIKeyManager />);
    
    // Click sort dropdown
    const sortDropdown = screen.getByText('Sort by');
    fireEvent.click(sortDropdown);
    
    // Select sort by last used
    const sortByLastUsed = screen.getByText('Last Used');
    fireEvent.click(sortByLastUsed);
    
    // Keys should be reordered
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Anthropic')).toBeInTheDocument();
  });

  it('should export keys configuration', () => {
    render(<AIKeyManager />);
    
    const exportButton = screen.getByText('Export Configuration');
    fireEvent.click(exportButton);
    
    // Should trigger export functionality
    expect(screen.getByText('Export API Keys Configuration')).toBeInTheDocument();
  });

  it('should import keys configuration', () => {
    render(<AIKeyManager />);
    
    const importButton = screen.getByText('Import Configuration');
    fireEvent.click(importButton);
    
    // Should trigger import dialog
    expect(screen.getByText('Import API Keys Configuration')).toBeInTheDocument();
  });

  it('should handle bulk operations', () => {
    render(<AIKeyManager />);
    
    // Select multiple keys
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // Select first key
    fireEvent.click(checkboxes[1]); // Select second key
    
    // Bulk delete
    const bulkDeleteButton = screen.getByText('Delete Selected');
    fireEvent.click(bulkDeleteButton);
    
    expect(screen.getByText('Delete 2 API Keys')).toBeInTheDocument();
  });

  it('should show provider-specific configuration options', () => {
    render(<AIKeyManager />);
    
    // Click on OpenAI key to show details
    const openaiKey = screen.getByText('OpenAI');
    fireEvent.click(openaiKey);
    
    expect(screen.getByText('API Base URL')).toBeInTheDocument();
    expect(screen.getByText('Organization ID')).toBeInTheDocument();
  });

  it('should validate API key format before adding', async () => {
    render(<AIKeyManager />);
    
    const addButton = screen.getByText('Add API Key');
    fireEvent.click(addButton);
    
    // Dialog opens
    await waitFor(() => {
      expect(screen.getByText('Add New API Key')).toBeInTheDocument();
    });
    
    // Try to add invalid key
    const keyInput = screen.getByPlaceholderText('Enter API key');
    fireEvent.change(keyInput, { target: { value: 'invalid-key' } });
    
    const submitButton = screen.getByText('Add Key');
    fireEvent.click(submitButton);
    
    // Should show validation error
    expect(screen.getByText('Invalid API key format')).toBeInTheDocument();
  });

  it('should handle network errors gracefully', async () => {
    mockStore.addApiKey.mockRejectedValue(new Error('Network error'));
    
    render(<AIKeyManager />);
    
    const addButton = screen.getByText('Add API Key');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText('Add New API Key')).toBeInTheDocument();
    });
    
    const keyInput = screen.getByPlaceholderText('Enter API key');
    fireEvent.change(keyInput, { target: { value: 'sk-valid-key-123' } });
    
    const submitButton = screen.getByText('Add Key');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to add API key')).toBeInTheDocument();
    });
  });

  it('should show key strength indicator', () => {
    render(<AIKeyManager />);
    
    const addButton = screen.getByText('Add API Key');
    fireEvent.click(addButton);
    
    // Check if strength indicator is present
    expect(screen.getByText('Key Strength:')).toBeInTheDocument();
  });

  it('should handle key rotation', () => {
    render(<AIKeyManager />);
    
    const rotateButton = screen.getAllByText('Rotate')[0]; // First key rotate button
    fireEvent.click(rotateButton);
    
    expect(screen.getByText('Rotate API Key')).toBeInTheDocument();
    expect(screen.getByText('Generate a new API key and replace the existing one')).toBeInTheDocument();
  });

  it('should show key usage analytics', async () => {
    const mockUsageData = {
      requests: 150,
      tokens: 25000,
      cost: 0.75,
      lastRequest: '2026-02-17T15:30:00.000Z',
    };
    
    // Mock usage data
    mockStore.getUsageStats.mockResolvedValue({
      totalKeys: 2,
      keysByProvider: { openai: 1, anthropic: 1, google: 0 },
      lastUsedTimes: {},
      expiredKeys: [],
      usage: mockUsageData,
    });
    
    render(<AIKeyManager />);
    
    const analyticsButton = screen.getByText('Analytics');
    fireEvent.click(analyticsButton);
    
    await waitFor(() => {
      expect(screen.getByText('150 requests')).toBeInTheDocument();
      expect(screen.getByText('25,000 tokens')).toBeInTheDocument();
      expect(screen.getByText('$0.75')).toBeInTheDocument();
    });
  });
});
