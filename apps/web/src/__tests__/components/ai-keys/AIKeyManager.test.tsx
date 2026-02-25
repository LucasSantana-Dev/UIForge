/**
 * AI Key Manager Component Tests
 * Tests for AI key management UI component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
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
jest.mock('@/lib/encryption', () => ({
  AIProvider: {},
  AI_PROVIDERS: {
    openai: {
      name: 'OpenAI',
      models: ['gpt-4', 'gpt-3.5-turbo'],
      rateLimitPerMinute: 60,
      maxTokens: 128000,
      requiresOrganization: false,
    },
    anthropic: {
      name: 'Anthropic',
      models: ['claude-3-opus'],
      rateLimitPerMinute: 50,
      maxTokens: 200000,
      requiresOrganization: false,
    },
    google: {
      name: 'Google',
      models: ['gemini-pro'],
      rateLimitPerMinute: 60,
      maxTokens: 30000,
      requiresOrganization: false,
    },
  },
}));
jest.mock('lucide-react', () => ({
  Plus: () => <span>+</span>,
  Key: () => <span>K</span>,
  Settings: () => <span>S</span>,
  Trash2: () => <span>T</span>,
  XCircle: () => <span>X</span>,
  AlertCircle: () => <span>!</span>,
  Star: () => <span>*</span>,
  Shield: () => <span>SH</span>,
  Edit: () => <span>E</span>,
}));

const mockUseAIKeyStore = useAIKeyStore as jest.MockedFunction<typeof useAIKeyStore>;

const defaultMockStore = {
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

describe('AIKeyManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAIKeyStore.mockReturnValue(defaultMockStore as any);
  });

  it('should render header with title', () => {
    render(<AIKeyManager />);
    expect(screen.getByText('API Keys')).toBeInTheDocument();
  });

  it('should render empty state when no keys', () => {
    render(<AIKeyManager />);
    expect(screen.getByText('No API Keys Yet')).toBeInTheDocument();
    expect(screen.getAllByText(/Add your first API key/i).length).toBeGreaterThanOrEqual(1);
  });

  it('should render error state', () => {
    mockUseAIKeyStore.mockReturnValue({
      ...defaultMockStore,
      error: 'Failed to load API keys',
    } as any);
    render(<AIKeyManager />);
    expect(screen.getByText('Failed to load API keys')).toBeInTheDocument();
  });

  it('should render API key cards', () => {
    mockUseAIKeyStore.mockReturnValue({
      ...defaultMockStore,
      apiKeys: [
        {
          provider: 'openai',
          keyId: 'key_123',
          encryptedKey: 'enc_key',
          createdAt: '2026-02-17T00:00:00.000Z',
          lastUsed: '2026-02-17T12:00:00.000Z',
          isDefault: true,
        },
      ],
    } as any);
    render(<AIKeyManager />);
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('key_123')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('should show Set Default button for non-default keys', () => {
    mockUseAIKeyStore.mockReturnValue({
      ...defaultMockStore,
      apiKeys: [
        {
          provider: 'openai',
          keyId: 'key_123',
          encryptedKey: 'enc_key',
          createdAt: '2026-02-17T00:00:00.000Z',
          isDefault: false,
        },
      ],
    } as any);
    render(<AIKeyManager />);
    expect(screen.getByText('Set Default')).toBeInTheDocument();
  });

  it('should show Add API Key button', () => {
    render(<AIKeyManager />);
    expect(screen.getAllByText('Add API Key').length).toBeGreaterThan(0);
  });

  it('should call loadUsageStats on mount', () => {
    render(<AIKeyManager />);
    expect(defaultMockStore.loadUsageStats).toHaveBeenCalled();
  });

  it('should render add dialog when showAddKeyDialog is true', () => {
    mockUseAIKeyStore.mockReturnValue({
      ...defaultMockStore,
      showAddKeyDialog: true,
    } as any);
    render(<AIKeyManager />);
    expect(screen.getByTestId('add-dialog')).toBeInTheDocument();
  });

  it('should render edit dialog when editingKeyId is set', () => {
    mockUseAIKeyStore.mockReturnValue({
      ...defaultMockStore,
      editingKeyId: 'key_123',
    } as any);
    render(<AIKeyManager />);
    expect(screen.getByTestId('edit-dialog')).toBeInTheDocument();
  });
});
