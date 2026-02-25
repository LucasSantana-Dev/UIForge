/**
 * AI Key Manager Component Tests
 * Tests for AI key management UI component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AIKeyManager } from '@/components/ai-keys/AIKeyManager';
import { useAIKeyStore } from '@/stores/ai-keys';

jest.mock('@/stores/ai-keys');
jest.mock('@/components/ai-keys/AddApiKeyDialog', () => ({
  AddApiKeyDialog: () => <div data-testid="add-dialog">Add Dialog</div>,
}));
jest.mock('@/components/ai-keys/EditApiKeyDialog', () => ({
  EditApiKeyDialog: () => <div data-testid="edit-dialog">Edit Dialog</div>,
}));
jest.mock('@/components/ai-keys/UsageStats', () => ({
  UsageStats: () => <div data-testid="usage-stats">Usage Stats</div>,
}));

const mockUseAIKeyStore = useAIKeyStore as jest.MockedFunction<typeof useAIKeyStore>;

describe('AIKeyManager', () => {
  const baseMock = {
    apiKeys: [],
    error: undefined,
    showAddKeyDialog: false,
    selectedProvider: undefined,
    editingKeyId: undefined,
    usageStats: undefined,
    setShowAddKeyDialog: jest.fn(),
    setSelectedProvider: jest.fn(),
    setEditingKeyId: jest.fn(),
    deleteApiKey: jest.fn(),
    setDefaultApiKey: jest.fn(),
    loadUsageStats: jest.fn(),
    clearError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAIKeyStore.mockReturnValue(baseMock as any);
    jest.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render empty state when no keys', () => {
    render(<AIKeyManager />);
    expect(screen.getByText('No API Keys Yet')).toBeInTheDocument();
    expect(screen.getByText(/Add your first API key/)).toBeInTheDocument();
  });

  it('should render API keys heading', () => {
    render(<AIKeyManager />);
    expect(screen.getByText('API Keys')).toBeInTheDocument();
  });

  it('should render Add API Key button', () => {
    render(<AIKeyManager />);
    expect(screen.getByRole('button', { name: /Add API Key/i })).toBeInTheDocument();
  });

  it('should render key cards when keys exist', () => {
    mockUseAIKeyStore.mockReturnValue({
      ...baseMock,
      apiKeys: [
        {
          provider: 'openai',
          keyId: 'key_test_123',
          encryptedKey: 'encrypted-key-1',
          createdAt: '2026-02-17T00:00:00.000Z',
          lastUsed: '2026-02-17T12:00:00.000Z',
          isDefault: true,
        },
      ],
    } as any);

    render(<AIKeyManager />);
    expect(screen.getByText('key_test_123')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByText('OPENAI')).toBeInTheDocument();
  });

  it('should render error state', () => {
    mockUseAIKeyStore.mockReturnValue({
      ...baseMock,
      error: 'Failed to load API keys',
    } as any);

    render(<AIKeyManager />);
    expect(screen.getByText('Failed to load API keys')).toBeInTheDocument();
  });

  it('should call setShowAddKeyDialog when Add button clicked', async () => {
    const user = userEvent.setup();
    render(<AIKeyManager />);

    await user.click(screen.getByRole('button', { name: /Add API Key/i }));

    expect(baseMock.setSelectedProvider).toHaveBeenCalledWith('openai');
    expect(baseMock.setShowAddKeyDialog).toHaveBeenCalledWith(true);
  });

  it('should call deleteApiKey when Delete button clicked', async () => {
    const user = userEvent.setup();
    mockUseAIKeyStore.mockReturnValue({
      ...baseMock,
      apiKeys: [
        {
          provider: 'openai',
          keyId: 'key_test_123',
          encryptedKey: 'encrypted-key-1',
          createdAt: '2026-02-17T00:00:00.000Z',
          isDefault: false,
        },
      ],
    } as any);

    render(<AIKeyManager />);
    await user.click(screen.getByRole('button', { name: /Delete/i }));

    expect(baseMock.deleteApiKey).toHaveBeenCalledWith('key_test_123');
  });

  it('should call setEditingKeyId when Edit button clicked', async () => {
    const user = userEvent.setup();
    mockUseAIKeyStore.mockReturnValue({
      ...baseMock,
      apiKeys: [
        {
          provider: 'openai',
          keyId: 'key_test_123',
          encryptedKey: 'encrypted-key-1',
          createdAt: '2026-02-17T00:00:00.000Z',
          isDefault: false,
        },
      ],
    } as any);

    render(<AIKeyManager />);
    await user.click(screen.getByRole('button', { name: /Edit/i }));

    expect(baseMock.setEditingKeyId).toHaveBeenCalledWith('key_test_123');
  });

  it('should show Set Default button for non-default keys', () => {
    mockUseAIKeyStore.mockReturnValue({
      ...baseMock,
      apiKeys: [
        {
          provider: 'openai',
          keyId: 'key_test_123',
          encryptedKey: 'encrypted-key-1',
          createdAt: '2026-02-17T00:00:00.000Z',
          isDefault: false,
        },
      ],
    } as any);

    render(<AIKeyManager />);
    expect(screen.getByRole('button', { name: /Set Default/i })).toBeInTheDocument();
  });

  it('should not show Set Default button for default keys', () => {
    mockUseAIKeyStore.mockReturnValue({
      ...baseMock,
      apiKeys: [
        {
          provider: 'openai',
          keyId: 'key_test_123',
          encryptedKey: 'encrypted-key-1',
          createdAt: '2026-02-17T00:00:00.000Z',
          isDefault: true,
        },
      ],
    } as any);

    render(<AIKeyManager />);
    expect(screen.queryByRole('button', { name: /Set Default/i })).not.toBeInTheDocument();
  });

  it('should show expired badge for old keys', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 100);

    mockUseAIKeyStore.mockReturnValue({
      ...baseMock,
      apiKeys: [
        {
          provider: 'openai',
          keyId: 'key_expired',
          encryptedKey: 'encrypted-key-1',
          createdAt: oldDate.toISOString(),
          isDefault: false,
        },
      ],
    } as any);

    render(<AIKeyManager />);
    expect(screen.getByText('Expired')).toBeInTheDocument();
  });

  it('should load usage stats on mount', () => {
    render(<AIKeyManager />);
    expect(baseMock.loadUsageStats).toHaveBeenCalled();
  });
});
