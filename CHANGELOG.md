# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- **`@siza/forge-patterns`**: added as dev dependency (local file reference) for shared constants access

### Changed

- **`packages/eslint-config/index.js`**: added forge-patterns rules — `no-floating-promises` (error), `prefer-template` (warn), `no-duplicate-imports` (error), `require-await` (error)
- **`engines.node`**: `>=20` to `>=22` (aligning with forge ecosystem standard)
- **CI `node-version`**: `'20'` to `'24'` across all jobs in `ci.yml`
- **`.husky/pre-commit`**: upgraded from bare `npx lint-staged` to forge gate pattern
