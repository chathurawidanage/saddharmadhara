# Task 5: Standardize Styling and UI Patterns

## Objective
Remove ad-hoc styling, reduce visual inconsistency, and align the app more closely with reusable DHIS2-friendly UI patterns.

## Why This Is Needed
- Inline styles are scattered across `RetreatManager.js`, `RetreatsDashboard.js`, `RetreatModal.js`, `RetreatInvitationModal.js`, `YogiRow.js`, and indicator components.
- Color choices and spacing are hardcoded repeatedly.
- Some components mix `@dhis2/ui` elements with raw HTML controls in ways that make styling and behavior harder to keep consistent.

## Scope
1. **Remove inline style objects from the main screens**
   - Prioritize:
     - `src/components/RetreatManager.js`
     - `src/components/RetreatsDashboard.js`
     - `src/components/RetreatModal.js`
     - `src/components/RetreatInvitationModal.js`
   - Move styles into CSS files or a clearly chosen styling approach used consistently across `admin/src/components`.
2. **Define shared visual tokens**
   - Introduce CSS variables for repeated colors, spacing, border radius, and muted text colors.
   - Replace hardcoded retreat-type colors and stats colors with named variables or semantic classes.
3. **Use consistent form and layout patterns**
   - Replace raw controls where a DHIS2 UI component is a better fit.
   - Standardize headings, section spacing, badges/tags, and panel shells.
4. **Keep style logic out of render paths where possible**
   - Avoid building large style objects inline for repeated structures.
   - Prefer CSS classes and semantic modifiers instead of ad-hoc object spreads.

## Verification
- The app keeps the same functional behavior.
- Styling changes do not regress mobile/tablet layouts.
- Visual rules become easier to discover and reuse from a small number of CSS files or shared variables.
