# Task 6: Migrate to TypeScript Incrementally

## Objective
Add type safety after the codebase has better boundaries, test coverage, and smaller modules. TypeScript is still worthwhile here, but it should follow the cleanup work instead of blocking it.

## Why This Is Last
- Migrating the current 300 to 600 line files directly to TypeScript will create a lot of noisy type errors before the architecture is ready.
- Tasks 1 to 5 create the seams TypeScript needs: pure helpers, extracted services, smaller components, and clearer store contracts.

## Scope
1. **Add TypeScript configuration**
   - Add `typescript` and the needed React type packages if they are not already present.
   - Add `tsconfig.json` for the DHIS2 app.
2. **Start with low-risk modules**
   - Convert extracted helpers, transformers, and service modules first.
   - Add types for key domain objects such as:
     - `Retreat`
     - `Yogi`
     - `ExpressionOfInterest`
     - `Participation`
     - `SelectionState`
3. **Type the stores next**
   - Add types around transformed metadata, async method inputs, and mutation payloads.
   - Avoid spreading `any` through the store layer unless there is a temporary escape hatch with a follow-up note.
4. **Convert React components after their decomposition**
   - Convert the main screen components only after Task 4 reduces their size.
   - Prefer typed props and shared interfaces over component-local duplicated shapes.
5. **Keep migration incremental**
   - Allow mixed `.js` and `.ts/.tsx` during the migration.
   - Do not block the app on converting every file in one pass.

## Verification
- TypeScript builds successfully alongside the existing app platform tooling.
- Core domain modules and stores have meaningful types.
- The migration improves confidence rather than just replacing runtime ambiguity with widespread `any`.
