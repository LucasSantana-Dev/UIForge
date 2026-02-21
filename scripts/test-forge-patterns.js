#!/usr/bin/env node

/**
 * Simple Forge Patterns Test
 *
 * This script tests the @forgespace/core integration
 */

import {
  getAvailablePatterns,
  validateForgePatterns,
  getForgePatternsVersion,
  projectConfig
} from '../lib/forge-patterns.js';

console.log('🔨 Testing @forgespace/core Integration');
console.log('=====================================\n');

// Test version
console.log(`📦 Version: ${getForgePatternsVersion()}`);

// Test validation
const isValid = validateForgePatterns();
console.log(`✅ Validation: ${isValid ? 'PASSED' : 'FAILED'}`);

// Test project config
console.log('\n⚙️  Project Configuration:');
console.log(JSON.stringify(projectConfig, null, 2));

// Test available patterns
const patterns = getAvailablePatterns();
console.log('\n📊 Available Pattern Categories:');
Object.keys(patterns).forEach(category => {
  console.log(`  - ${category}`);
});

console.log('\n🎉 @forgespace/core integration test completed!');
