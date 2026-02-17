/**
 * Add API Key Dialog Component
 * Provides UI for adding new AI provider API keys
 */

'use client';

import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Key, 
  Check, 
  X, 
  AlertCircle,
  Info,
  ExternalLink
} from 'lucide-react';
import { useAIKeyStore } from '@/stores/ai-keys';
import { AIProvider, AI_PROVIDERS } from '@/lib/encryption';

interface AddApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProvider?: AIProvider;
}

export function AddApiKeyDialog({ open, onOpenChange, defaultProvider = 'openai' }: AddApiKeyDialogProps) {
  const { addApiKey, loading, error } = useAIKeyStore();
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(defaultProvider);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const config = AI_PROVIDERS[selectedProvider];
  const isValid = apiKey.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      await addApiKey(selectedProvider, apiKey.trim());
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
        return 'Enter your API key';
    }
  };

  const getApiKeyHelp = (provider: AIProvider) => {
    switch (provider) {
      case 'openai':
        return 'Get your API key from OpenAI Platform. Requires organization ID for team accounts.';
      case 'anthropic':
        return 'Get your API key from Anthropic Console. Claude API access required.';
      case 'google':
        return 'Get your API key from Google AI Studio. Gemini API access required.';
      default:
        return 'Get your API key from the provider dashboard.';
    }
  };

  const getApiUrl = (provider: AIProvider) => {
    switch (provider) {
      case 'openai':
        return 'https://platform.openai.com/api-keys';
      case 'anthropic':
        return 'https://console.anthropic.com/';
      case 'google':
        return 'https://makersuite.google.com/app/apikey';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Add API Key
          </DialogTitle>
          <DialogDescription>
            Add a new API key for AI-powered component generation
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Provider Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">AI Provider</Label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(AI_PROVIDERS).map(([provider, config]) => {
                const isSelected = selectedProvider === provider;
                return (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => setSelectedProvider(provider as AIProvider)}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">
                      {getProviderIcon(provider as AIProvider)}
                    </div>
                    <div className="text-sm font-medium">{config.name}</div>
                    {isSelected && (
                      <div className="absolute top-1 right-1">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Provider Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-xl">
                {getProviderIcon(selectedProvider)}
              </div>
              <div>
                <h4 className="font-medium">{config.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {config.models.length} models available
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground mb-3">
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

            <div className="flex flex-wrap gap-1">
              {config.models.map((model) => (
                <Badge key={model} variant="outline" className="text-xs">
                  {model}
                </Badge>
              ))}
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showApiKey ? 'text' : 'password'}
                placeholder={getApiKeyPlaceholder(selectedProvider)}
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
              {getApiKeyHelp(selectedProvider)}
            </p>
          </div>

          {/* Security Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your API key is encrypted locally with AES-256 before storage. 
              The encrypted key is never sent to our servers in plaintext.
            </AlertDescription>
          </Alert>

          {/* Help Link */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>Need help getting your API key?</span>
            <a
              href={getApiUrl(selectedProvider)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              Visit {config.name}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {config.requiresOrganization && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {config.name} requires an organization ID for team accounts. 
                Make sure your API key includes the necessary permissions.
              </AlertDescription>
            </Alert>
          )}

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
              {loading ? 'Adding...' : 'Add API Key'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
