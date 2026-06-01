# Task 4: Decompose Large Components

## Objective
Break up the biggest UI files so each screen is composed from smaller, purpose-driven pieces instead of long mixed files that combine rendering, event handling, and business rules.

## Why This Is Needed
- `src/components/manager/YogiList.js` is the largest component in the app and contains list loading, filtering, sorting, pagination, row actions, room allocation, attendance actions, and invitation status UI.
- `src/components/RetreatModal.js` contains form setup, edit data fetching, value derivation, submit mapping, and layout in a single 500+ line file.
- `src/components/RetreatManager.js`, `src/components/RetreatsDashboard.js`, and `src/components/RetreatInvitationModal.js` each mix multiple responsibilities.

## Scope
1. **Decompose `RetreatManager`**
   - Extract:
     - `RetreatHeader`
     - `RetreatDetails`
     - `RetreatDownloadMenu`
   - Leave the page component responsible only for route/store wiring and modal visibility state.
2. **Decompose `RetreatsDashboard`**
   - Extract:
     - retreat card component
     - dashboard stats grid
     - general retreat stats panel
     - retreat sections for current and past retreats
3. **Decompose `YogiList`**
   - Split the file into focused pieces such as:
     - list toolbar
     - filters
     - tabs/state summary
     - paginated table
     - row action controls
   - Move helper components currently declared at the bottom of the file into separate modules when they are reused or complex enough to deserve isolation.
4. **Decompose form and modal flows**
   - Split `RetreatModal` into form sections and submit-mapping helpers.
   - Split `RetreatInvitationModal` into recipient selection, message preview, and send-progress pieces.

## Verification
- The UI should remain unchanged.
- Main page components should become much shorter and mostly orchestration-oriented.
- Individual subcomponents should be easier to test and reason about in isolation.
