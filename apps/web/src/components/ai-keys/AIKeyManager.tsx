/**
 * AI Key Management Component
 * Provides UI for managing BYOK system with shadcn/ui components
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plus,
  Key,
  Settings,
  Trash2,
  XCircle,
  AlertCircle,
  Star,
  Shield,
  Edit
} from 'lucide-react';
import { useAIKeyStore } from '@/stores/ai-keys';
import { AIProvider, AI_PROVIDERS } from '@/lib/encryption';
import { AddApiKeyDialog } from './AddApiKeyDialog';
import { EditApiKeyDialog } from './EditApiKeyDialog';
import { UsageStats } from './UsageStats';

function isExpired(createdAt: string): boolean {
  const daysSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceCreation > 90;
}

export function AIKeyManager() {
  const {
    apiKeys,
    error,
    showAddKeyDialog,
    selectedProvider,
    editingKeyId,
    usageStats,
    setShowAddKeyDialog,
    setSelectedProvider,
    setEditingKeyId,
    deleteApiKey,
    setDefaultApiKey,
    loadUsageStats,
    clearError,
  } = useAIKeyStore();

  const [showUsageStats, setShowUsageStats] = useState(false);

  useEffect(() => {
    loadUsageStats();
  }, [loadUsageStats]);

  const handleAddKey = (provider: AIProvider) => {
    setSelectedProvider(provider);
    setShowAddKeyDialog(true);
  };

  const handleEditKey = (keyId: string) => {
    setEditingKeyId(keyId);
  };

  const handleDeleteKey = async (keyId: string) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      await deleteApiKey(keyId);
    }
  };

  const handleSetDefault = async (keyId: string) => {
    await setDefaultApiKey(keyId);
  };

  const getProviderIcon = (provider: AIProvider) => {
    switch (provider) {
      case 'openai':
        return '🤖';
      case 'anthropic':
        return '🧠';
      case 'google':
        return '🔍';
      default:
        return '🔑';
    }
  };

  const getProviderColor = (provider: AIProvider) => {
    switch (provider) {
      case 'openai':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'anthropic':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'google':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
        <Button variant="outline" size="sm" onClick={clearError} className="ml-auto">
          <XCircle className="h-4 w-4" />
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Key className="h-6 w-6" />
            API Keys
          </h2>
          <p className="text-muted-foreground">
            Manage your AI provider API keys with secure client-side encryption
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowUsageStats(!showUsageStats)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {showUsageStats ? 'Hide Stats' : 'Show Stats'}
          </Button>
          <Button onClick={() => handleAddKey('openai')}>
            <Plus className="h-4 w-4 mr-2" />
            Add API Key
          </Button>
        </div>
      </div>

      {/* Usage Stats */}
      {showUsageStats && usageStats && (
        <UsageStats stats={usageStats} />
      )}

      {/* API Keys List */}
      <div className="grid gap-4">
        {apiKeys.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Key className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No API Keys Yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Add your first API key to start generating components with AI
              </p>
              <Button onClick={() => handleAddKey('openai')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First API Key
              </Button>
            </CardContent>
          </Card>
        ) : (
          apiKeys.map((apiKey) => {
            const isDefault = apiKey.isDefault;
            const expired = isExpired(apiKey.createdAt);
            const config = AI_PROVIDERS[apiKey.provider];

            return (
              <Card key={apiKey.keyId} className={expired ? 'border-orange-200' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {getProviderIcon(apiKey.provider)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {config.name}
                        </CardTitle>
                        <CardDescription>
                          {apiKey.keyId}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isDefault && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                      {expired && (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Expired
                        </Badge>
                      )}
                      <Badge className={getProviderColor(apiKey.provider)}>
                        {apiKey.provider.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Key Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <div className="font-medium">{formatDate(apiKey.createdAt)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Used:</span>
                        <div className="font-medium">
                          {apiKey.lastUsed ? formatDate(apiKey.lastUsed) : 'Never'}
                        </div>
                      </div>
                    </div>

                    {/* Available Models */}
                    <div>
                      <span className="text-sm text-muted-foreground">Available Models:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {config.models.map((model) => (
                          <Badge key={model} variant="outline" className="text-xs">
                            {model}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Provider Info */}
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Provider Information</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                        <div>
                          <div>Rate Limit:</div>
                          <div className="font-medium text-foreground">
                            {config.rateLimitPerMinute} requests/min
                          </div>
                        </div>
                        <div>
                          <div>Max Tokens:</div>
                          <div className="font-medium text-foreground">
                            {config.maxTokens.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {config.requiresOrganization && (
                        <div className="text-xs text-orange-600 bg-orange-50 rounded p-2 mt-2">
                          Requires organization ID in API key
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      {!isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(apiKey.keyId)}
                        >
                          <Star className="h-4 w-4 mr-1" />
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditKey(apiKey.keyId)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteKey(apiKey.keyId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Key Dialog */}
      {showAddKeyDialog && (
        <AddApiKeyDialog
          open={showAddKeyDialog}
          onOpenChange={setShowAddKeyDialog}
          defaultProvider={selectedProvider || 'openai'}
        />
      )}

      {/* Edit Key Dialog */}
      {editingKeyId && (
        <EditApiKeyDialog
          open={!!editingKeyId}
          onOpenChange={(open) => {
            if (!open) setEditingKeyId(undefined);
          }}
          keyId={editingKeyId}
        />
      )}
    </div>
  );
}
