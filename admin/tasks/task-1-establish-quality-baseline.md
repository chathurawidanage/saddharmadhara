# Task 1: Lock Down Current Behavior

## Objective
Create a safety net before refactoring. The first priority is characterization tests that lock in the app's current behavior, followed by the minimum linting and formatting guardrails needed to keep subsequent tasks safe and consistent.

## Why This Comes First
- The refactor plan touches large files with mixed responsibilities, so we need proof that behavior stays the same while we restructure them.
- `admin/package.json` has no `lint` script.
- Running `./node_modules/.bin/eslint src --ext .js` fails because the app does not define an ESLint config.
- Large refactors in `src/components/` and `src/stores/` will be much riskier without automated checks.

## Scope
1. **Add characterization tests first**
   - Add tests that capture the current behavior of the highest-risk logic before any structural refactor starts.
   - Start with pure or near-pure logic that is central to app behavior:
     - `generalRetreatStats` logic currently in `src/stores/metadata.js`
     - sort helpers in `src/components/manager/YogiList.js`
     - retreat/date helper behavior that will be extracted in Task 2
     - export formatting behavior from `RetreatManager` once extracted into testable helpers
   - Prefer characterization coverage over ideal architecture at this stage. The goal is to freeze current behavior, even if the implementation is messy.
2. **Add linting scripts and config**
   - Add `lint` and `lint:fix` scripts in `admin/package.json`.
   - Add a project ESLint configuration compatible with `@dhis2/cli-app-scripts`.
   - Decide on a small, realistic ruleset first: no unused vars, consistent quotes/semicolons, no `console.log` in production code, and React hooks validation.
3. **Add a formatting baseline**
   - Add Prettier only if the team wants automated formatting.
   - If Prettier is added, include a `format` script and keep the config intentionally small.
4. **Fix baseline issues surfaced by linting**
   - Remove debug `console.log` calls from `src/stores/metadata.js`.
   - Clean up small style inconsistencies in `src/App.js`, `src/stores/root.js`, and other touched files so the codebase starts from a consistent baseline.

## Verification
- The first refactor tasks do not begin until the characterization tests for current behavior are passing.
- `yarn lint` runs successfully.
- `yarn test --watch=false` runs successfully, even if coverage is still minimal.
- No new task should start without leaving the lint/test baseline green.
