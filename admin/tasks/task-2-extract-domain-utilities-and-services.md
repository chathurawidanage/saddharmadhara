# Task 2: Extract Domain Utilities and Services

## Objective
Move reusable business logic and browser/network side effects out of React components and stores so the code becomes easier to read, test, and reuse.

## Why This Is Needed
- `src/stores/metadata.js` mixes data transformation with store behavior.
- `src/components/RetreatManager.js` owns export helpers and selection-state-specific download logic.
- `src/components/RetreatInvitationModal.js` mixes message generation, phone normalization, token creation, SMS sending, and UI flow in one file.

## Scope
1. **Extract retreat/domain helpers**
   - Move `getEndDate` and retreat status/date helpers out of `src/stores/metadata.js`.
   - Add helpers such as:
     - `getRetreatEndDate`
     - `canFinalizeRetreat`
     - `isGeneralRetreat`
     - `getRetreatDisplayRange`
2. **Extract metadata transformers**
   - Move `transformRetreats`, `transformRooms`, `transformLanguages`, and `transformAttendance` into a dedicated transformer module.
   - Normalize raw DHIS2 row/option payloads as early as possible so stores stop working with ambiguous array indexes like `row[0]`, `row[1]`, and `row[3]`.
3. **Extract export logic from `RetreatManager`**
   - Move `downloadTextFile` and the yogi export builder into a service such as `src/services/exportService.js`.
   - Replace the repeated menu/action blocks with a configuration-driven export definition.
4. **Extract SMS/invitation logic**
   - Move SMS message construction and phone-number normalization out of `src/components/RetreatInvitationModal.js`.
   - Introduce a service module for:
     - temporary token creation/deletion
     - SMS sending
     - invitation campaign datastore updates
5. **Make extracted modules testable**
   - Prefer pure functions with explicit inputs/outputs.
   - Cover the highest-risk helpers with unit tests added in Task 1.

## Verification
- `RetreatManager` and `RetreatInvitationModal` become noticeably smaller.
- Export and invitation flows still behave the same.
- New utility/service modules can be tested without rendering React components.
