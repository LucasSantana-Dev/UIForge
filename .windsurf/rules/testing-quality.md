# Testing & Quality

**When to apply:** When writing or modifying test suites, quality gates, or coverage targets.

## Test runners

- **Jest 29.7** for unit and integration tests
- **Playwright 1.48** for E2E tests
- **React Testing Library** for React component testing
- Stack: `jest` + `ts-jest` (ESM preset) + `@types/jest`.
- Requires `NODE_OPTIONS=--experimental-vm-modules` for ESM support.
- Config: `jest.config.ts` with `ts-jest/presets/default-esm`.

## Test file naming

- Unit tests: `src/__tests__/unit/my-module.test.ts` or `src/components/__tests__/MyComponent.test.tsx`
- Integration tests: `src/__tests__/integration/my-flow.test.ts`
- E2E tests: `e2e/my-flow.spec.ts`.

### Why Jest

- Industry standard with the largest ecosystem of matchers, reporters, and integrations.
- Built-in coverage, mocking, snapshot testing, and parallel execution.

## Test file mapping

| Test file | Covers |
| --- | --- |
| `scaffold.unit.test.ts` | `scaffold-full-application` tool — each framework → expected file structure |
| `generate-component.unit.test.ts` | `generate-ui-component` tool — style audit integration, component output |
| `generate-prototype.unit.test.ts` | `generate-prototype` tool — screen assembly, navigation, valid HTML |
| `generate-image.unit.test.ts` | `generate-design-image` tool — satori → valid SVG, PNG base64 |
| `style-audit.unit.test.ts` | `style-audit.ts` lib — Tailwind config parsing |
| `tailwind-mapper.unit.test.ts` | `tailwind-mapper.ts` lib — Figma props → Tailwind classes |
| `design-references.unit.test.ts` | Design reference data — presets, fonts, colors, icons, animations, layouts |
| `phase0-changes.unit.test.ts` | Design context store, CSS variables generator, semantic Tailwind mapper |
| `pipeline.integration.test.ts` | Full generation pipeline — design context → template output across all frameworks |

## Jest configuration

```js
// apps/web/jest.config.ts
import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 80,
      functions: 80,
      statements: 80,
    },
  },
};

export default createJestConfig(config);
```

## Conventions

- Test behavior, not implementation details.
- **Coverage threshold: 80%** (statements, functions, lines) and **80% branches** — enforced in `jest.config.ts`. Branch threshold is lower because many `??` fallbacks on always-present data are unreachable.
- Mock external dependencies (Figma API, URL fetch, native addons) in tests.
- Test each framework template produces valid file structures.
- Test design context updates flow correctly through tools.
- Do NOT import from `vitest` — Jest globals (`describe`, `it`, `expect`, `beforeEach`) are available automatically.

## Quality gates

- **Coverage**: ≥80% for unit tests (Jest config enforces)
- **E2E**: 100% coverage for critical user flows (auth, project CRUD, generation)
- **Lint**: `npm run lint` must pass with 0 warnings (ESLint strict mode)
- **Format**: `npm run format:check` must pass (Prettier)
- **Type Check**: `npm run type-check` must pass (TypeScript strict)
- **Build**: `npm run build` must complete without errors
- **Pre-commit**: All hooks must pass before commit

## Commands

- Run all: `npm test`
- Watch mode: `npm run test:watch`
- With coverage: `npm run test:coverage`
- Single file: `NODE_OPTIONS=--experimental-vm-modules npx jest src/__tests__/scaffold.unit.test.ts`
