import {
  getYogiSortScore,
  selectionPrioritySorter,
  ageSorter,
  sortYogiList,
  SELECTION_PRIORITY_SORT,
} from "./YogiList";
import {
  DHIS2_TEI_ATTRIBUTE_MARITAL_STATE,
  DHIS2_TEI_ATTRIBUTE_YOGI_PRIORITY,
  DHIS2_TEI_ATTRIBUTE_DOB,
} from "../../dhis2";

describe("YogiList Sorting Helpers", () => {
  const retreat = { code: "R1" } as any;

  test("getYogiSortScore identifies reverends and priority members", () => {
    const reverend = {
      attributes: { [DHIS2_TEI_ATTRIBUTE_MARITAL_STATE]: "reverend" },
    } as any;
    const trustMember = {
      attributes: { [DHIS2_TEI_ATTRIBUTE_YOGI_PRIORITY]: "trust_member" },
    } as any;
    const normal = { attributes: {} } as any;

    expect(getYogiSortScore(reverend)).toBeGreaterThan(
      getYogiSortScore(trustMember),
    );
    expect(getYogiSortScore(trustMember)).toBeGreaterThan(
      getYogiSortScore(normal),
    );
  });

  test("selectionPrioritySorter sorts by score then date", () => {
    const y1 = {
      attributes: { [DHIS2_TEI_ATTRIBUTE_MARITAL_STATE]: "reverend" },
      expressionOfInterests: { R1: { occurredAt: "2024-01-02" } },
    } as any;
    const y2 = {
      attributes: { [DHIS2_TEI_ATTRIBUTE_MARITAL_STATE]: "reverend" },
      expressionOfInterests: { R1: { occurredAt: "2024-01-01" } },
    } as any;

    // Both are reverends, so y2 (earlier date) should come first (negative result for y2 - y1 sort style)
    // Wait, selectionPrioritySorter returns negative if y1 should come before y2
    expect(selectionPrioritySorter(y1, y2, retreat)).toBeGreaterThan(0);
    expect(selectionPrioritySorter(y2, y1, retreat)).toBeLessThan(0);
  });

  test("ageSorter sorts by DOB then priority", () => {
    const y1 = {
      attributes: { [DHIS2_TEI_ATTRIBUTE_DOB]: "1990-01-01" },
    } as any;
    const y2 = {
      attributes: { [DHIS2_TEI_ATTRIBUTE_DOB]: "1980-01-01" },
    } as any;

    // y2 is older, should come first (earlier DOB)
    expect(ageSorter(y1, y2, retreat)).toBeGreaterThan(0);
    expect(ageSorter(y2, y1, retreat)).toBeLessThan(0);
  });

  test("sortYogiList correctly sorts an array", () => {
    const y1 = {
      attributes: { [DHIS2_TEI_ATTRIBUTE_MARITAL_STATE]: "reverend" },
      expressionOfInterests: { R1: { occurredAt: "2024-01-02" } },
    } as any;
    const y2 = {
      attributes: { [DHIS2_TEI_ATTRIBUTE_MARITAL_STATE]: "reverend" },
      expressionOfInterests: { R1: { occurredAt: "2024-01-01" } },
    } as any;
    const list = [y1, y2];
    sortYogiList(list, retreat, SELECTION_PRIORITY_SORT);
    expect(list[0]).toBe(y2);
  });
});
