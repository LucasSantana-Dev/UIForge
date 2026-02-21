#!/usr/bin/env node

/**
 * Forge Patterns Integration CLI for UIForge WebApp
 * Simplified integration script for UIForge project
 */

import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import path from 'path';

const PROJECT_CONFIG = {
  name: 'UIForge WebApp',
  description: 'Next.js web application with feature toggles and code quality',
  patterns: [
    'code-quality/eslint',
    'code-quality/prettier',
    'code-quality/typescript',
    'feature-toggles/libraries/nodejs',
    'feature-toggles/config/centralized-config.yml',
    'feature-toggles'
  ],
  configFiles: ['.eslintrc.js', '.prettierrc.json'],
  dependencies: [
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
    'eslint',
    'eslint-config-prettier',
    'prettier',
    'typescript'
  ]
};

function logSuccess(message) {
  console.log('✅', message);
}

function logError(message) {
  console.log('❌', message);
}

function logInfo(message) {
  console.log('ℹ️', message);
}

async function integrateForgePatterns() {
  const targetDir = process.cwd();

  logInfo(`Integrating Forge Patterns into ${PROJECT_CONFIG.name}...`);
  logInfo(`Target directory: ${targetDir}`);

  try {
    // Create patterns directory structure
    const patternsDir = path.join(targetDir, 'patterns');
    await fs.ensureDir(patternsDir);

    // Create feature-toggles directory
    const featureTogglesDir = path.join(patternsDir, 'feature-toggles');
    await fs.ensureDir(featureTogglesDir);

    // Create config directory
    const configDir = path.join(featureTogglesDir, 'config');
    await fs.ensureDir(configDir);

    // Create libraries directory
    const librariesDir = path.join(featureTogglesDir, 'libraries');
    await fs.ensureDir(librariesDir);

    // Create code-quality directories
    const codeQualityDir = path.join(patternsDir, 'code-quality');
    await fs.ensureDir(codeQualityDir);

    await fs.ensureDir(path.join(codeQualityDir, 'eslint'));
    await fs.ensureDir(path.join(codeQualityDir, 'prettier'));
    await fs.ensureDir(path.join(codeQualityDir, 'typescript'));

    // Copy configuration files from forge-patterns
    logInfo('Setting up configuration files...');

    // Copy ESLint config
    const eslintSource = path.join(targetDir, '.eslintrc.forge-patterns.js');
    const eslintTarget = path.join(targetDir, '.eslintrc.js');
    if (await fs.pathExists(eslintSource)) {
      await fs.copy(eslintSource, eslintTarget);
      logSuccess('ESLint configuration updated');
    }

    // Copy Prettier config
    const prettierSource = path.join(targetDir, '.prettierrc.forge-patterns.json');
    const prettierTarget = path.join(targetDir, '.prettierrc.json');
    if (await fs.pathExists(prettierSource)) {
      await fs.copy(prettierSource, prettierTarget);
      logSuccess('Prettier configuration updated');
    }

    // Copy Docker configurations
    logInfo('Setting up Docker configurations...');

    const dockerFiles = [
      'docker-compose.prod.yml',
      'docker-compose.dev.yml',
      'Dockerfile.forge-patterns',
      '.dockerignore.forge-patterns'
    ];

    for (const dockerFile of dockerFiles) {
      const source = path.join(targetDir, dockerFile);
      if (await fs.pathExists(source)) {
        const target = path.join(targetDir, dockerFile.replace('.forge-patterns', ''));
        await fs.copy(source, target);
        logSuccess(`Docker configuration: ${dockerFile}`);
      }
    }

    // Copy security scripts
    logInfo('Setting up security scripts...');

    const securityDir = path.join(targetDir, 'scripts', 'security');
    if (await fs.pathExists(securityDir)) {
      logSuccess('Security scripts already exist');
    }

    // Copy forge-features CLI
    const forgeFeaturesSource = path.join(targetDir, 'scripts', 'forge-features');
    if (await fs.pathExists(forgeFeaturesSource)) {
      logSuccess('forge-features CLI tool available');
    }

    // Copy gitleaks configuration
    const gitleaksSource = path.join(targetDir, '.gitleaks.yml');
    if (await fs.pathExists(gitleaksSource)) {
      logSuccess('Gitleaks configuration available');
    }

    // Update package.json scripts
    logInfo('Updating package.json scripts...');

    const packageJsonPath = path.join(targetDir, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);

      // Check for existing scripts before overwriting
      const newScripts = {
        'validate-patterns': 'npm run lint:check && npm run format:check && ./scripts/security/validate-no-secrets.sh',
        'security-scan': './scripts/security/scan-for-secrets.sh',
        'feature-list': './scripts/forge-features list',
        'lint:check': 'eslint . --ext .js,.ts,.tsx',
        'format:check': 'prettier --check .'
      };

      // Check for conflicts and warn
      for (const [scriptName, scriptCommand] of Object.entries(newScripts)) {
        if (packageJson.scripts[scriptName] && packageJson.scripts[scriptName] !== scriptCommand) {
          logWarn(`Warning: Overwriting existing script '${scriptName}'`);
          logWarn(`  Old: ${packageJson.scripts[scriptName]}`);
          logWarn(`  New: ${scriptCommand}`);
        }
      }

      packageJson.scripts = {
        ...packageJson.scripts,
        ...newScripts
      };

      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
      logSuccess('Package.json scripts updated');
    }

    // Create integration documentation
    logInfo('Creating integration documentation...');

    const docsDir = path.join(targetDir, 'docs');
    await fs.ensureDir(docsDir);

    const integrationDoc = `# Forge Patterns Integration

This document describes how Forge Patterns v1.0.0 is integrated into the ${PROJECT_CONFIG.name} project.

## 📋 Integrated Components

### GitHub Actions Workflows
- \`continuous-security.yml\` - Daily security monitoring
- \`security-scan.yml\` - Comprehensive security scanning
- \`branch-protection.yml\` - Branch protection and validation

### Code Quality
- ESLint configuration with forge-patterns rules
- Prettier configuration with forge-patterns standards
- TypeScript strict mode enforcement

### Security
- Secret detection with Gitleaks and Trufflehog
- Custom security validation scripts
- Placeholder format validation

### Feature Management
- forge-features CLI tool for centralized feature management
- Feature toggle configuration templates

### Docker Optimization
- Multi-stage Dockerfile template
- Production and development compose configurations
- High-efficiency Docker standards

## 🔧 Usage Examples

### Security Validation
\`\`\`bash
npm run security-scan
\`\`\`

### Feature Management
\`\`\`bash
./scripts/forge-features list
./scripts/forge-features enable global.debug-mode
\`\`\`

### Pattern Validation
\`\`\`bash
npm run validate-patterns
\`\`\`

## 🚀 Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Run validation:
   \`\`\`bash
   npm run validate-patterns
   \`\`\`

3. Test security scanning:
   \`\`\`bash
   npm run security-scan
   \`\`\`

## 📚 Documentation

- [Forge Patterns Repository](https://github.com/LucasSantana-Dev/forge-patterns)
- [Pattern Library](./patterns/)
- [Security Guidelines](./SECURITY.md)

## 🔧 Configuration Files

The following configuration files have been added/updated:
- \`.eslintrc.js\` - Enhanced ESLint configuration
- \`.prettierrc.json\` - Prettier formatting standards
- \`.gitleaks.yml\` - Secret detection configuration
- \`docker-compose.prod.yml\` - Production Docker setup
- \`docker-compose.dev.yml\` - Development Docker setup

## 🎯 Next Steps

1. Review the new configuration files
2. Update your application code to follow the new patterns
3. Test the integration with validation scripts
4. Set up GitHub secrets for security workflows
5. Configure feature toggles as needed

## 🚨 Troubleshooting

If you encounter issues:

1. Check that all dependencies are installed: \`npm install\`
2. Verify configuration files are correctly formatted
3. Run validation: \`npm run validate-patterns\`
4. Check security scan: \`npm run security-scan\`

For more help, see the [Forge Patterns Documentation](https://github.com/LucasSantana-Dev/forge-patterns).
`;

    await fs.writeFile(path.join(docsDir, 'forge-patterns-integration.md'), integrationDoc);
    logSuccess('Integration documentation created');

    console.log('\n🎉 Forge Patterns integration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('  1. npm install');
    console.log('  2. npm run validate-patterns');
    console.log('  3. npm run security-scan');
    console.log('  4. Review docs/forge-patterns-integration.md');
    console.log('  5. Update your application code to use the patterns');
    console.log('\n📚 Documentation: docs/forge-patterns-integration.md');

  } catch (error) {
    logError(`Integration failed: ${error.message}`);
    process.exit(1);
  }
}

// Run integration
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  integrateForgePatterns();
}

export { integrateForgePatterns };
