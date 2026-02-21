/**
 * Forge Patterns Integration
 * 
 * This file demonstrates the integration of @forgespace/core package
 * into the UIForge WebApp project.
 */

import { ForgePatterns, createProjectConfig, VERSION } from '@forgespace/core';

// Get the singleton instance of ForgePatterns
const forgePatterns = ForgePatterns.getInstance();

// Create project configuration using forge-patterns
export const projectConfig = createProjectConfig('UIForge WebApp', {
  framework: 'Next.js 15',
  backend: 'Supabase',
  deployment: 'Cloudflare Pages',
  features: {
    'ai-generation': true,
    'wireframe-export': true,
    'template-library': true,
    'analytics': true,
    'custom-domains': true
  }
});

/**
 * Get available forge patterns
 */
export function getAvailablePatterns() {
  return forgePatterns.getPatterns();
}

/**
 * Get a specific pattern path
 */
export function getPatternPath(category: string, name: string): string {
  return forgePatterns.getPatternPath(category, name);
}

/**
 * Validate forge patterns installation
 */
export function validateForgePatterns(): boolean {
  return forgePatterns.validateInstallation();
}

/**
 * Get forge patterns version
 */
export function getForgePatternsVersion(): string {
  return VERSION;
}

/**
 * Initialize forge patterns integration
 */
export function initializeForgePatterns() {
  const isValid = validateForgePatterns();
  
  if (!isValid) {
    console.warn('Forge Patterns installation validation failed');
    return false;
  }

  const patterns = getAvailablePatterns();
  console.log(`Forge Patterns v${getForgePatternsVersion()} initialized successfully`);
  console.log('Available patterns:', Object.keys(patterns));
  
  return true;
}

// Export the forge patterns instance for advanced usage
export { forgePatterns };

// Export configuration for easy access
export default {
  projectConfig,
  getAvailablePatterns,
  getPatternPath,
  validateForgePatterns,
  getForgePatternsVersion,
  initializeForgePatterns,
  forgePatterns
};