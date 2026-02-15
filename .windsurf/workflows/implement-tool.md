---
description: Step-by-step workflow for implementing a new MCP tool
---

# Implement New MCP Tool

Follow this workflow when adding a new tool to the server:

1. **Define types** in `src/lib/types.ts` if new interfaces are needed

2. **Create tool file** at `src/tools/<tool-name>.ts`:
   - Export Zod schema with `.describe()` on each field
   - Export typed input type
   - Export async handler function

3. **Implement lib modules** in `src/lib/` for business logic:
   - Keep tool file thin (validation + orchestration)
   - Put heavy logic in dedicated lib modules

4. **Register tool** in `src/index.ts`:
   - Import schema and handler
   - Call `server.tool(name, description, schema, handler)`

5. **Update design context** if the tool reads or writes styles:
   - Import `designContextStore` from `src/lib/design-context.ts`
   - Call `.update()` for writes, `.get()` for reads

6. **Write tests** in `src/__tests__/<tool-name>.unit.test.ts`:
   - Test input validation (invalid inputs rejected)
   - Test happy path (correct output structure)
   - Test error cases (API failures, bad data)
   - Mock external dependencies

// turbo
7. **Build**: `npm run build`
// turbo
8. **Test**: `npm run test`

9. **Update docs**:
   - Add tool to README.md tools table
   - Add entry to CHANGELOG.md
