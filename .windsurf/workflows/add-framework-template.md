---
description: Step-by-step workflow for adding a new framework template
---

# Add Framework Template

Follow this workflow when adding support for a new framework in `scaffold_full_application`:

1. **Create template file** at `src/lib/templates/<framework>.ts`:
   - Export a pure function: `(config) => IGeneratedFile[]`
   - Generate all required files (package.json, config files, entry point, sample component)
   - Apply `IDesignContext` tokens for styling

2. **Update types** in `src/lib/types.ts`:
   - Add framework to `Framework` type union
   - Add any framework-specific types if needed

3. **Update scaffold tool** in `src/tools/scaffold-full-application.ts`:
   - Add framework to Zod enum
   - Import and wire the new template function
   - Handle framework-specific options (state management, architecture)

4. **Write tests** in `src/__tests__/scaffold.unit.test.ts`:
   - Test new framework → expected file structure
   - Test framework-specific options
   - Test design context integration

// turbo
5. **Build**: `npm run build`
// turbo
6. **Test**: `npm run test`

7. **Update docs**:
   - Add framework to README.md supported frameworks list
   - Add entry to CHANGELOG.md
