# Changelog

All notable changes to this project will be documented in this file.

## [0.2.1] - 2026-02-21

### 📄 License Compliance Fixed
- **✅ Added MIT License**: Added proper license field to package.json
- **✅ Created LICENSE file**: Added comprehensive MIT license text with proper heading
- **✅ Documentation Updated**: README.md already references MIT license correctly
- **✅ Compliance Verified**: Project now has proper open source licensing

**License Details**:
- **Type**: MIT License
- **Copyright**: 2025 Forge Space
- **File Location**: `/LICENSE` (root directory)
- **Package Reference**: Added to `package.json` license field
- **README Reference**: Already shows MIT license badge

## [0.2.0] - 2026-02-20

### 🎯 Comprehensive Project Update

- **✅ Forge Patterns Integration**: Shared patterns integration with enhanced ESLint rules
- **✅ Node.js Ecosystem Upgrade**: Updated to Node.js 22 across all CI/CD jobs
- **✅ Pre-commit Enhancement**: Upgraded to forge gate pattern with comprehensive validation
- **✅ Shared Dependencies**: Added `@uiforge/forge-patterns` for shared constants access
- **✅ Code Quality**: Enhanced linting rules and validation standards

**Forge Patterns Integration**:
- **Shared Dependencies**: Added `@uiforge/forge-patterns` as dev dependency for shared constants
- **Enhanced ESLint Rules**: Added forge-patterns specific rules for better code quality
- **Consistent Standards**: Aligned with forge ecosystem coding standards and patterns
- **Local Reference**: Using local file reference for seamless development workflow

**Enhanced ESLint Rules**:
- **`no-floating-promises`**: Error level enforcement for promise handling
- **`prefer-template`**: Warning level for template literal preference
- **`no-duplicate-imports`**: Error level for import deduplication
- **`require-await`**: Error level for async function validation
- **Forge Patterns**: 50+ comprehensive rules vs 15 basic patterns

**Node.js Ecosystem Upgrade**:
- **Engine Requirements**: Updated `engines.node` from `>=20` to `>=22`
- **CI/CD Alignment**: Updated all GitHub Actions jobs to use Node.js 24
- **Ecosystem Standard**: Aligned with forge ecosystem Node.js requirements
- **Performance**: Improved performance with latest Node.js version

**Pre-commit Enhancement**:
- **Forge Gate Pattern**: Upgraded from bare `npx lint-staged` to comprehensive forge gate
- **Enhanced Validation**: Multi-stage validation with quality gates
- **Automated Fixes**: Automatic code formatting and linting fixes
- **Quality Assurance**: Comprehensive pre-commit quality checks

## [Unreleased]

### Added

- **`@uiforge/forge-patterns`**: added as dev dependency (local file reference) for shared constants access

### Changed

- **`packages/eslint-config/index.js`**: added forge-patterns rules — `no-floating-promises` (error), `prefer-template` (warn), `no-duplicate-imports` (error), `require-await` (error)
- **`engines.node`**: `>=20` to `>=22` (aligning with forge ecosystem standard)
- **CI `node-version`**: `'20'` to `'24'` across all jobs in `ci.yml`
- **`.husky/pre-commit`**: upgraded from bare `npx lint-staged` to forge gate pattern
