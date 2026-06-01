# Task 3: Refactor Stores and Async Data Flow

## Objective
Reduce coupling inside the MobX layer, make async behavior explicit, and stop the app from loading or failing as one large block.

## Why This Is Needed
- `src/stores/metadata.js` fetches many resources at once in `init()` and mixes loading, transformation, remote mutation, derived stats, and external SMS credit fetching.
- `src/stores/yogi.js` handles several different event mutation workflows and caches without a clear request/error contract.
- `src/stores/root.js` wires stores directly into a singleton-style app boot path, which makes future testing and composition harder.

## Scope
1. **Split metadata loading into focused operations**
   - Keep retreat list loading fast and explicit.
   - Lazy-load or separately refresh supporting metadata such as rooms, languages, attendance, participation summary, and EOI summary.
   - Do not block the whole app on dashboard-only data.
2. **Track loading and error state explicitly**
   - Add observable request state for:
     - metadata bootstrap
     - SMS credits
     - retreat refresh
     - yogi fetch batches
   - Replace silent failures and console-only reporting with state the UI can render.
3. **Move derived dashboard stats into pure logic**
   - Extract the `generalRetreatStats` calculation from `src/stores/metadata.js` into a pure helper.
   - Keep the MobX getter as a thin wrapper around transformed data.
4. **Reduce duplication in store mutations**
   - Review repeated mutation patterns in `src/stores/yogi.js` and `src/stores/metadata.js`.
   - Introduce helpers for building event payloads and applying successful local cache updates.
5. **Prepare for better app composition**
   - Review whether `RootStore` should remain a module-level singleton dependency passed through props.
   - If feasible, introduce a small store provider or app context so components are not tightly coupled to a global store instance.

## Verification
- Initial dashboard rendering depends only on the data it truly needs.
- Error states such as SMS credit failures can be surfaced in the UI.
- Store methods become smaller, easier to test, and easier to reason about.
