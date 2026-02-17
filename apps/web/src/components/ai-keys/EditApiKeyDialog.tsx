/**
 * Edit API Key Dialog Component
 * Provides UI for editing existing AI provider API keys
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Key, 
  Check, 
  X, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAIKeyStore, useAIKeys } from '@/stores/ai-keys';
import { AIProvider, AI_PROVIDERS } from '@/lib/encryption';

interface EditApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyId: string;
}

export function EditApiKeyDialog({ open, onOpenChange, keyId }: EditApiKeyDialogProps) {
  const { updateApiKey, loading, error } = useAIKeyStore();
  const apiKeys = useAIKeys();
  
  const currentKey = apiKeys.find(key => key.keyId === keyId);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (open && currentKey) {
      setApiKey('');
      setShowApiKey(false);
    }
  }, [open, currentKey]);

  if (!currentKey) {
    return null;
  }

  const config = AI_PROVIDERS[currentKey.provider];
  const isValid = apiKey.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      await updateApiKey(keyId, apiKey.trim());
      setApiKey('');
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleClose = () => {
    setApiKey('');
    setShowApiKey(false);
    onOpenChange(false);
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

  const getApiKeyPlaceholder = (provider: AIProvider) => {
    switch (provider) {
      case 'openai':
        return 'sk-proj-...';
      case 'anthropic':
        return 'sk-ant-...';
      case 'google':
        return 'AIza...';
      default:
        return 'Enter your new API key';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Update API Key
          </DialogTitle>
          <DialogDescription>
            Update your {config.name} API key
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Key Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-xl">
                {getProviderIcon(currentKey.provider)}
              </div>
              <div>
                <h4 className="font-medium">{config.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {currentKey.keyId}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <div>Created:</div>
                <div className="font-medium text-foreground">
                  {formatDate(currentKey.createdAt)}
                </div>
              </div>
              <div>
                <div>Last Used:</div>
                <div className="font-medium text-foreground">
                  {currentKey.lastUsed ? formatDate(currentKey.lastUsed) : 'Never'}
                </div>
              </div>
            </div>

            {currentKey.isDefault && (
              <div className="mt-2">
                <div className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  <Check className="h-3 w-3" />
                  Default API Key
                </div>
              </div>
            )}
          </div>

          {/* New API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="new-api-key">New API Key</Label>
            <div className="relative">
              <Input
                id="new-api-key"
                type={showApiKey ? 'text' : 'password'}
                placeholder={getApiKeyPlaceholder(currentKey.provider)}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 p-0"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your new {config.name} API key. The old key will be replaced.
            </p>
          </div>

          {/* Security Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your new API key will be encrypted locally with AES-256 before storage. 
              The encrypted key is never sent to our servers in plaintext.
            </AlertDescription>
          </Alert>

          {/* Warning */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Make sure your new API key has the same permissions and access level 
              as the previous one to avoid service interruptions.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Dialog Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || loading}
            >
              {loading ? 'Updating...' : 'Update API Key'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
