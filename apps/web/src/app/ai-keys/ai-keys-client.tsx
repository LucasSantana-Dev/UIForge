/**
 * AI Keys Management Page
 * Main page for managing BYOK system and AI provider settings
 */

'use client';

import { useEffect } from 'react';
import { AIKeyManager } from '@/components/ai-keys/AIKeyManager';
import { useAIKeyStore } from '@/stores/ai-keys';
import { generateUserEncryptionKey, deriveEncryptionKey } from '@/lib/encryption';

export function AIKeysClient() {
  const { encryptionKey, initialize, loading, error } = useAIKeyStore();

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
          <p className="text-muted-foreground">Initializing AI Key Manager...</p>
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

  return (
    <div className="container mx-auto py-8">
      <AIKeyManager />
    </div>
  );
}
