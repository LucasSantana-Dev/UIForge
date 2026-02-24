/**
 * Settings Page
 * Main settings page with AI Keys integration
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Key, Shield, CheckCircle, Info, ExternalLink, Github } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AIKeyManager } from '@/components/ai-keys/AIKeyManager';
import GitHubPanel from '@/components/dashboard/GitHubPanel';
import { useAIKeyStore } from '@/stores/ai-keys';
import { generateUserEncryptionKey, deriveEncryptionKey } from '@/lib/encryption';
import { AI_PROVIDERS } from '@/lib/encryption';

export function SettingsClient() {
  const {
    encryptionKey,
    initialize,
    loading,
    error,
    apiKeys,
    geminiFallbackEnabled,
    setGeminiFallbackEnabled,
    usageTrackingEnabled,
    setUsageTrackingEnabled,
  } = useAIKeyStore();

  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'github' ? 'github' : 'overview';
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-keys' | 'github'>(initialTab);

  useEffect(() => {
    // Initialize the AI key manager if encryption key exists
    const initKeyManager = async () => {
      // Check if we have an encryption key in localStorage
      const storedKey = localStorage.getItem('siza-encryption-key');

      if (storedKey) {
        // Derive the actual encryption key from the stored key
        const derivedKey = deriveEncryptionKey(storedKey);
        await initialize(derivedKey);
      } else {
        // Generate a new encryption key for the user
        const newKey = generateUserEncryptionKey();
        const derivedKey = deriveEncryptionKey(newKey);

        // Store the base key (not the derived one)
        localStorage.setItem('siza-encryption-key', newKey);
        await initialize(derivedKey);
      }
    };

    if (!encryptionKey && !loading) {
      initKeyManager();
    }
  }, [encryptionKey, initialize, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error && !encryptionKey) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">⚠️</div>
          <h2 className="text-lg font-semibold mb-2">Initialization Failed</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const providerStats = Object.entries(AI_PROVIDERS).map(([provider, config]) => {
    const keysForProvider = apiKeys.filter((key) => key.provider === provider);
    return {
      provider,
      config,
      count: keysForProvider.length,
      hasDefault: keysForProvider.some((key) => key.isDefault),
    };
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and AI provider preferences
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('ai-keys')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'ai-keys'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Key className="h-4 w-4 mr-2" />
          AI Keys
        </button>
        <button
          onClick={() => setActiveTab('github')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 flex items-center ${
            activeTab === 'github'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Github className="h-4 w-4 mr-2" />
          GitHub
        </button>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* AI Provider Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                AI Provider Status
              </CardTitle>
              <CardDescription>
                Overview of your configured AI providers and API keys
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {providerStats.map(({ provider, config, count, hasDefault }) => (
                <div
                  key={provider}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {provider === 'openai' ? '🤖' : provider === 'anthropic' ? '🧠' : '🔍'}
                    </div>
                    <div>
                      <h4 className="font-medium">{config.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {config.models.length} models available
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      {count > 0 && (
                        <Badge variant="secondary">
                          {count} key{count !== 1 ? 's' : ''}
                        </Badge>
                      )}
                      {hasDefault && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {count === 0 ? 'Not configured' : 'Configured'}
                    </p>
                  </div>
                </div>
              ))}

              {providerStats.every((stat) => stat.count === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No AI providers configured yet</p>
                  <Link href="/ai-keys">
                    <Button className="mt-4">
                      <Key className="h-4 w-4 mr-2" />
                      Configure AI Keys
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Your data security and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Client-Side Encryption</h4>
                  <p className="text-sm text-muted-foreground">
                    Your API keys are encrypted locally with AES-256 before storage
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Enabled
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Zero-Cost Architecture</h4>
                  <p className="text-sm text-muted-foreground">
                    No API keys are stored on our servers
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Data Ownership</h4>
                  <p className="text-sm text-muted-foreground">
                    You maintain full control of your API keys and data
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Guaranteed
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Gemini Fallback</h4>
                  <p className="text-sm text-muted-foreground">
                    Use Google Gemini API when no keys are configured
                  </p>
                </div>
                <Button
                  variant={geminiFallbackEnabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGeminiFallbackEnabled(!geminiFallbackEnabled)}
                >
                  {geminiFallbackEnabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Usage Tracking</h4>
                  <p className="text-sm text-muted-foreground">Track API usage statistics</p>
                </div>
                <Button
                  variant={usageTrackingEnabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUsageTrackingEnabled(!usageTrackingEnabled)}
                >
                  {usageTrackingEnabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Help & Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Help & Resources</CardTitle>
              <CardDescription>Learn more about AI providers and API keys</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>Need help getting started with AI keys?</span>
                <Link
                  href="/ai-keys"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  Go to AI Keys
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="text-lg mb-1">🤖</div>
                  <h4 className="font-medium">OpenAI</h4>
                  <p className="text-sm text-muted-foreground">Get your API key</p>
                </a>
                <a
                  href="https://console.anthropic.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="text-lg mb-1">🧠</div>
                  <h4 className="font-medium">Anthropic</h4>
                  <p className="text-sm text-muted-foreground">Get your API key</p>
                </a>
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="text-lg mb-1">🔍</div>
                  <h4 className="font-medium">Google AI</h4>
                  <p className="text-sm text-muted-foreground">Get your API key</p>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'ai-keys' && <AIKeyManager />}

      {activeTab === 'github' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                GitHub Integration
              </CardTitle>
              <CardDescription>
                Connect your GitHub account to push generated components directly as pull requests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GitHubPanel />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
