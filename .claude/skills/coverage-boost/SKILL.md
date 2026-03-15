---
name: coverage-boost
description: Find and fix coverage gaps in Siza test suite — identify low-coverage files and write targeted tests
version: 1.0.0
tags: [testing, coverage, jest, quality]
---

# Coverage Boost

Find files with low coverage and add targeted tests to close the gaps.

## Quick Coverage Check
```bash
cd apps/web && npx jest --forceExit --coverage --silent 2>&1 | grep -E "All files|%" | head -5
```

Current thresholds (jest.config): branches 60%, functions 65%, lines 75%, statements 75%

## Find Low-Coverage Files

```bash
# Files with statement coverage under 75%
cd apps/web && npx jest --forceExit --coverage --silent 2>&1 | \
  grep -E "\|\s+[0-9]" | \
  awk -F'|' '{gsub(/ /,"",$2); if ($2+0 < 75 && $2+0 > 0 && length($1) > 5) print $0}'
```

## Coverage Improvement Workflow

### 1. Isolate the file
```bash
cd apps/web && npx jest --forceExit --coverage --silent \
  --collectCoverageFrom='src/path/to/file.ts' \
  --testPathPattern='filename' 2>&1 | tail -10
```
The `Uncovered Line #s` column tells you exactly which lines need tests.

### 2. Read the source
Read the uncovered lines to understand:
- Which functions are missing tests
- Which branches (`if/else`, ternary, `??`) are not exercised
- Whether it's a happy path or error path that's missing

### 3. Find the existing test file
```bash
find apps/web/src/__tests__ -name "*filename*" 2>/dev/null
```
Extend the existing file; don't create a new one.

### 4. Write targeted tests

#### Common uncovered patterns

**Error paths** — most common gap:
```typescript
it('throws on error', async () => {
  mockFn.mockResolvedValue({ data: null, error: { message: 'Something failed' } });
  await expect(targetFn()).rejects.toThrow('Something failed');
});
```

**Feature flag disabled branch**:
```typescript
it('returns early when feature disabled', async () => {
  mockGetFeatureFlag.mockReturnValue(false);
  const result = await targetFn('user-1');
  expect(result).toEqual({ allowed: true, current: 0, limit: -1, remaining: -1 });
  expect(mockFrom).not.toHaveBeenCalled();
});
```

**Optional parameters / defaults**:
```typescript
it('uses defaults when options not provided', async () => {
  await targetFn('bucket', 'path'); // no options
  expect(mockFn).toHaveBeenCalledWith('path', expect.objectContaining({ limit: 100 }));
});
```

**Array vs single value**:
```typescript
it('handles array input', async () => {
  await targetFn('bucket', ['path1', 'path2']);
  expect(mockRemove).toHaveBeenCalledWith(['path1', 'path2']);
});
```

**Null/undefined data from DB**:
```typescript
it('handles no data returned', async () => {
  mockSingle.mockResolvedValue({ data: null });
  const result = await targetFn('user-1');
  expect(result.limit).toBe(2); // default
});
```

### 5. Mock patterns for Supabase Storage (client-side)

Storage mock type is narrow — use a cast helper for methods not in the base type:
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bucket = (methods: Record<string, jest.Mock>): any => methods;
mockStorage.from.mockReturnValue(bucket({ createSignedUrl: mockFn }));
```

### 6. Validate improvement
```bash
cd apps/web && npx jest --forceExit --coverage --silent \
  --collectCoverageFrom='src/path/to/file.ts' \
  --testPathPattern='filename' 2>&1 | grep "All files"
```

## Coverage Targets (per file type)

| File type | Target |
|-----------|--------|
| Utility functions | 95%+ statements, 90%+ branches |
| Service layer | 90%+ statements, 85%+ branches |
| React hooks | 85%+ statements |
| React components | 80%+ statements |
| API route handlers | 90%+ statements |

## Key Files Still Under 80% (as of 2026-03-15)

Check with the quick coverage command above — the known low-coverage areas were:
- `lib/supabase/storage.ts` — now 100% isolated
- `lib/usage/limits.ts` — now 100% statements
- `lib/features/provider.tsx` — now 96.7%

After boosting, overall coverage: 91.4% stmts, 82.9% branches, 93.9% functions, 92.9% lines.

## Output Format
```
COVERAGE BOOST RESULTS:
  Before: X% statements, Y% branches, Z% functions
  After:  X% statements, Y% branches, Z% functions
  
  Files improved:
    - path/to/file.ts: A% → B% statements
  
  New tests added: N (in M test files)
```
