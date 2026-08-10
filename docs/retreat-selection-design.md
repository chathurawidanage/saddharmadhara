# Retreat Selection System Specification: Bias-Free Score-Driven Model

## 1. Executive Summary & Core Objective

The primary goal of this specification is to eliminate **selector bias** during retreat applicant selection by relying entirely on the automated scoring engine (`getYogiSortScore`). 

To address real-world edge cases (e.g., medical unsuitability, behavioral concerns, or emergency monastic requirements), the system provides controlled safety overrides with strict governance, auditing, DataStore persistence, and dynamic quotas.

---

## 2. Core Architectural Principles

1. **Score-Driven Queue**: Standard selection occurs exclusively through an algorithmically sorted queue in rank order. Selectors cannot arbitrarily cherry-pick applicants from tables.
2. **Dynamic Discretionary Quota (Earned Wildcards)**: Selectors are granted a small discretionary quota calculated dynamically against total active score selections across the retreat (combined across both genders):
   $$\text{Allowed Discretionary Slots} = \min\left(4, \left\lceil \text{Total Active Count of (Pending + Selected)} \times 0.05 \right\rceil\right)$$
   * For 0 active selections $\rightarrow$ **0 slots**
   * For 1 to 20 active selections $\rightarrow$ **1 slot**
   * For 21 to 40 active selections $\rightarrow$ **2 slots**
   * Up to **4 slots** (Max Cap, usable for any gender combination)
3. **Mandatory DataStore Auditing**: All disqualifications AND discretionary selections trigger a mandatory popup modal requiring a structured reason dropdown + explanatory comment, persisted in DHIS2 DataStore.
4. **Transparent UI Feedback Subrows**: Both **Disqualifications** and **Discretionary Selections** display highlighted subrow badges in Yogi table views and detail views showing who added/denied them, why, and their reason notes.
5. **Auto-Backfill on Cancellation**: When a confirmed or pending yogi declines or cancels, the system automatically prompts/proposes the next highest-scoring applicant from the queue.

---

## 3. DataStore Tracking Architecture

To maintain complete parity with how rejected yogis are tracked, the system uses two parallel DHIS2 DataStore namespaces:

### A. Rejections DataStore (`dataStore/yogi-proposal-denials`)
* **Key Format**: `${retreatCode}_${yogiId}`
* **Schema**:
  ```json
  {
    "reason": "medical_unsuitability | conduct_history | ineligible | other",
    "comment": "Explanation provided by selector",
    "yogiId": "TEI_12345",
    "retreatCode": "RET_2026_01",
    "deniedBy": "username",
    "submittedAt": "2026-08-03T10:00:00.000Z"
  }
  ```

### B. Selector's Discretion DataStore (`dataStore/yogi-discretionary-selections`)
* **Key Format**: `${retreatCode}_${yogiId}`
* **Schema**:
  ```json
  {
    "reason": "monastic_request | ops_volunteer | emergency_case | other",
    "comment": "Explanation provided by selector for bypassing score queue",
    "yogiId": "TEI_12345",
    "retreatCode": "RET_2026_01",
    "gender": "male | female",
    "addedBy": "username",
    "submittedAt": "2026-08-03T10:00:00.000Z"
  }
  ```

---

## 4. UI Subrow & Badge Display (Yogi Row & Detail View)

In `YogiRow.tsx` and `ProposedYogiDetail.tsx`, both types of override decisions render dedicated visual subrows below the applicant's profile details:

### A. Rejection Subrow (Existing)
* **Badge**: `<span className="yogi-deny-badge">System Proposal Denied</span>`
* **Text**: `"System proposal denied by {deniedBy} due to: {reasonLabel}"`
* **Note**: `"{comment}"` *(italicized below)*

### B. Selector's Discretion Subrow (New)
* **Badge**: `<span className="yogi-discretionary-badge">Added at Selector's Discretion</span>`
* **Text**: `"Added at selector's discretion by {addedBy} due to: {reasonLabel}"`
* **Note**: `"{comment}"` *(italicized below)*

---

## 5. Discretionary Usage Counter & Toolbar Statistics

In `YogiListToolbar.tsx`, an active statistics pill displays the current discretionary quota usage:

```
[ Discretionary Selections: 1 / 2 Used (Male: 1, Female: 0) ]
```

* **Dynamic Calculation**: 
  1. Count total keys loaded from `dataStore/yogi-discretionary-selections` matching `${retreatCode}_*`.
  2. Compute max allowed cap using `Math.ceil(activePendingAndSelectedCount * 0.05)`.
* **Actionable Filter**: Clicking on the Discretionary Stats pill filters the list to immediately show all yogis added via selector's discretion.

---

## 6. Tab-by-Tab Allowed Action Matrix

| Tab Name | Role in Workflow | Allowed Actions ("Move To" Options) | Disallowed Actions |
| :--- | :--- | :--- | :--- |
| **1. Selection** *(Proposed Queue)* | **Main Decision Hub** (Yogis evaluated strictly in rank order by `getYogiSortScore`) | • **Accept** $\rightarrow$ Moves candidate to `Pending Confirmation`<br>• **Reject / Disqualify** $\rightarrow$ Opens popup for reason + note, saves to `yogi-proposal-denials`, moves to `Deselected`<br>• **Bulk Accept Top N** | • Cannot select candidates out of rank order |
| **2. Applied** | **Read-Only Audit Queue** (All initial applicants) | • **Move to** Dropdown:<br>  - **Pending Confirmation** *(Opens popup for discretionary selection; enabled ONLY when earned slot count $> 0$)* | • Cannot manually move to `Pending Confirmation` or `Selected` without burning an earned Discretionary slot |
| **3. Pending Confirmation** | **Selected & Awaiting Yogi Response** | • **Selected** *(Confirm Attending)*<br>• **Not Attending** *(Declined)*<br>• **Failed to Confirm** *(Confirmation deadline expired / no response)*<br>• **Resend Invitation** | • Cannot move directly to `Deselected` |
| **4. Selected** | **Confirmed Attending Roster** | • **Assign / Edit Room**<br>• **Mark Attendance** *(Attended / Absent / No-show)*<br>• **Late Cancellation** $\rightarrow$ Moves to `Not Attending` *(releases room, prompts auto-backfill from score queue)* | • Cannot move directly back to `Applied` or `Pending Confirmation` |
| **5. Deselected** | **Rejected / Unsuitable Applicants** | • **View Rejection Reason & Notes**<br>• **Re-evaluate / Revert to Applied** (*Admin Only* - removes entry from `yogi-proposal-denials`) | • Regular selectors cannot move candidates out of `Deselected` |
| **6. Not Attending** | **Yogis Who Declined or Cancelled** | • **View Decline Reason / Date**<br>• **Applied** (*Admin Only* - Re-evaluate candidate) | • Regular selectors cannot edit state directly |
| **7. Failed to Confirm** | **System Deadline Expired** | • **View Expiration History**<br>• **Applied** (*Admin Only* - Re-evaluate candidate) | • Cannot move directly to `Selected` or `Pending Confirmation` |

---

## 7. Exploit & Gaming Prevention Safeguards

| Potential Exploit Vector | System Mitigation & Safeguard |
| :--- | :--- |
| **Fake Headcount (Inflate & Dump)** | Discretionary slot availability is evaluated dynamically against **active** `Pending` + `Selected` count. If a selector tries to deselect candidates and the active count drops below the ratio threshold, wildcard actions freeze. |
| **Queue Purging (Bulk Reject Top Scorers)** | Rejections in `Selection` tab require structured reason logging. High rejection rates flag alert warnings on selector activity dashboards. |
| **Gender Cross-Dumping** | Earned discretionary slots are calculated **strictly per gender** (1 slot per gender for 1-20 active gender selections). |
| **Filler Excuses** | Pre-defined mandatory dropdown category + minimum 15-character note requirement. |
| **Unfilled Seats / Silent Declines** | Auto-promotion prompt for the next highest-scoring applicant whenever an accepted candidate declines. |

---

## 8. Technical Implementation Roadmap

### A. Store & Backend Updates (`admin/src/stores/yogi.ts`)
1. Add `discretionarySelections = new Map<string, DiscretionarySelectionRecord>()`.
2. Add `saveDiscretionarySelection(retreatCode, yogiId, reason, comment, gender)` saving to `dataStore/yogi-discretionary-selections/${retreatCode}_${yogiId}`.
3. Add `loadDiscretionarySelections(retreatCode)` to load and populate the store on retreat load.
4. Add `deleteDiscretionarySelection(retreatCode, yogiId)` for reverting discretionary selections.

### B. Frontend Updates (`admin/src/components/manager/`)
1. **`YogiListToolbar.tsx`**: Add Discretionary Slot counter component (`Selectors Discretion: X/Y Used`).
2. **`YogiRow.tsx`**: Render `yogi-discretionary-badge` subrow showing `addedBy`, `reason`, and `comment` (matching `denyFeedback`).
3. **`YogiRowActions.tsx`**: Add popup modal when selecting via selector's discretion in `Applied` tab.
