import React from 'react';
import { render, screen } from '@testing-library/react';
import { AIKeyManager } from '@/components/ai-keys/AIKeyManager';
import { useAIKeyStore } from '@/stores/ai-keys';

jest.mock('@/stores/ai-keys');
jest.mock('@/components/ai-keys/AddApiKeyDialog', () => ({
  AddApiKeyDialog: () => <div data-testid="add-dialog" />,
}));
jest.mock('@/components/ai-keys/EditApiKeyDialog', () => ({
  EditApiKeyDialog: () => <div data-testid="edit-dialog" />,
}));
jest.mock('@/components/ai-keys/UsageStats', () => ({
  UsageStats: () => <div data-testid="usage-stats" />,
}));
jest.mock('@/lib/encryption', () => ({
  AIProvider: {},
  AI_PROVIDERS: {
    openai: { name: 'OpenAI', models: ['gpt-4'], rateLimitPerMinute: 60, maxTokens: 128000, requiresOrganization: false },
    anthropic: { name: 'Anthropic', models: ['claude-3'], rateLimitPerMinute: 50, maxTokens: 200000, requiresOrganization: false },
    google: { name: 'Google', models: ['gemini'], rateLimitPerMinute: 60, maxTokens: 30000, requiresOrganization: false },
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

const mock = useAIKeyStore as jest.MockedFunction<typeof useAIKeyStore>;
const base = {
  apiKeys: [], error: undefined, showAddKeyDialog: false,
  selectedProvider: undefined, editingKeyId: undefined, usageStats: undefined,
  setShowAddKeyDialog: jest.fn(), setSelectedProvider: jest.fn(),
  setEditingKeyId: jest.fn(), deleteApiKey: jest.fn(),
  setDefaultApiKey: jest.fn(), loadUsageStats: jest.fn(), clearError: jest.fn(),
};

describe('AIKeyManager', () => {
  beforeEach(() => { jest.clearAllMocks(); mock.mockReturnValue(base as any); });

  it('should render header', () => {
    render(<AIKeyManager />);
    expect(screen.getByText('API Keys')).toBeInTheDocument();
  });

  it('should render empty state', () => {
    render(<AIKeyManager />);
    expect(screen.getByText('No API Keys Yet')).toBeInTheDocument();
  });

  it('should render error state', () => {
    mock.mockReturnValue({ ...base, error: 'Load failed' } as any);
    render(<AIKeyManager />);
    expect(screen.getByText('Load failed')).toBeInTheDocument();
  });

  it('should render key cards', () => {
    mock.mockReturnValue({ ...base, apiKeys: [{
      provider: 'openai', keyId: 'k1', encryptedKey: 'e',
      createdAt: '2026-02-17T00:00:00.000Z', isDefault: true,
    }] } as any);
    render(<AIKeyManager />);
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('should show Set Default for non-default', () => {
    mock.mockReturnValue({ ...base, apiKeys: [{
      provider: 'openai', keyId: 'k1', encryptedKey: 'e',
      createdAt: '2026-02-17T00:00:00.000Z', isDefault: false,
    }] } as any);
    render(<AIKeyManager />);
    expect(screen.getByText('Set Default')).toBeInTheDocument();
  });

  it('should call loadUsageStats on mount', () => {
    render(<AIKeyManager />);
    expect(base.loadUsageStats).toHaveBeenCalled();
  });

  it('should show add dialog', () => {
    mock.mockReturnValue({ ...base, showAddKeyDialog: true } as any);
    render(<AIKeyManager />);
    expect(screen.getByTestId('add-dialog')).toBeInTheDocument();
  });

  it('should show edit dialog', () => {
    mock.mockReturnValue({ ...base, editingKeyId: 'k1' } as any);
    render(<AIKeyManager />);
    expect(screen.getByTestId('edit-dialog')).toBeInTheDocument();
  });
});
