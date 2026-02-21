#!/usr/bin/env node

/**
 * Forge Patterns CLI for UIForge WebApp
 *
 * This script demonstrates the usage of @forgespace/core package
 * in the UIForge WebApp project.
 */

import { program } from 'commander';
import {
  getAvailablePatterns,
  getPatternPath,
  validateForgePatterns,
  getForgePatternsVersion,
  projectConfig
} from '../lib/forge-patterns.js';

// Top-level error handling
try {
  // CLI setup
program
  .name('forge-patterns')
  .description('Forge Patterns CLI for UIForge WebApp')
  .version(getForgePatternsVersion());

// List patterns command
program
  .command('list')
  .description('List all available forge patterns')
  .action(() => {
    console.log('🔨 Available Forge Patterns:');
    console.log(`Version: ${getForgePatternsVersion()}\n`);

    const patterns = getAvailablePatterns();

    Object.entries(patterns).forEach(([category, categoryPatterns]) => {
      console.log(`📁 ${category}:`);
      Object.entries(categoryPatterns).forEach(([name, path]) => {
        console.log(`  ├─ ${name}: ${path}`);
      });
      console.log('');
    });
  });

// Validate command
program
  .command('validate')
  .description('Validate forge patterns installation')
  .action(() => {
    console.log('🔍 Validating Forge Patterns installation...');

    const isValid = validateForgePatterns();

    if (isValid) {
      console.log('✅ Forge Patterns installation is valid');
    } else {
      console.log('❌ Forge Patterns installation validation failed');
      process.exit(1);
    }
  });

// Get pattern path command
program
  .command('path <category> <name>')
  .description('Get the path for a specific pattern')
  .action((category, name) => {
    try {
      const path = getPatternPath(category, name);
      console.log(`📂 Pattern path: ${path}`);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

// Project config command
program
  .command('config')
  .description('Show project configuration')
  .action(() => {
    console.log('⚙️  Project Configuration:');
    console.log(JSON.stringify(projectConfig, null, 2));
  });

// Initialize command
program
  .command('init')
  .description('Initialize forge patterns')
  .action(() => {
    console.log('🚀 Initializing Forge Patterns...');

    const isValid = validateForgePatterns();

    if (isValid) {
      const patterns = getAvailablePatterns();
      console.log(`✅ Forge Patterns v${getForgePatternsVersion()} initialized successfully`);
      console.log(`📊 Available pattern categories: ${Object.keys(patterns).join(', ')}`);
    } else {
      console.log('❌ Forge Patterns initialization failed');
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

} catch (error) {
  // Safe error handling for non-Error throwables
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error('❌ Error:', errorMessage);
  process.exit(1);
}
