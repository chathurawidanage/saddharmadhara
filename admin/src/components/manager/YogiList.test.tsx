import {
  getYogiSortScore,
  selectionPrioritySorter,
  ageSorter,
  sortYogiList,
  SELECTION_PRIORITY_SORT,
} from "../../utils/yogiUtils";

describe("YogiList Sorting Helpers", () => {
  const retreat = { code: "R1" } as any;

  test("getYogiSortScore identifies reverends and priority members", () => {
    const reverend = {
      attributes: { maritalState: "reverend" },
    } as any;
    const trustMember = {
      attributes: { priority: "trust_member" },
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
      attributes: { maritalState: "reverend" },
      expressionOfInterests: { R1: { occurredAt: "2024-01-02" } },
    } as any;
    const y2 = {
      attributes: { maritalState: "reverend" },
      expressionOfInterests: { R1: { occurredAt: "2024-01-01" } },
    } as any;

    // Both are reverends, so y2 (earlier date) should come first (negative result for y2 - y1 sort style)
    // selectionPrioritySorter returns negative if y1 should come before y2
    expect(selectionPrioritySorter(y1, y2, retreat)).toBeGreaterThan(0);
    expect(selectionPrioritySorter(y2, y1, retreat)).toBeLessThan(0);
  });

  test("ageSorter sorts by DOB then priority", () => {
    const y1 = {
      attributes: { dob: "1990-01-01" },
      expressionOfInterests: { R1: { occurredAt: "2024-01-01" } },
    } as any;
    const y2 = {
      attributes: { dob: "1980-01-01" },
      expressionOfInterests: { R1: { occurredAt: "2024-01-01" } },
    } as any;

    // y2 is older, should come first (earlier DOB)
    expect(ageSorter(y1, y2, retreat)).toBeGreaterThan(0);
    expect(ageSorter(y2, y1, retreat)).toBeLessThan(0);
  });

  test("sortYogiList correctly sorts an array", () => {
    const y1 = {
      attributes: { maritalState: "reverend" },
      expressionOfInterests: { R1: { occurredAt: "2024-01-02" } },
    } as any;
    const y2 = {
      attributes: { maritalState: "reverend" },
      expressionOfInterests: { R1: { occurredAt: "2024-01-01" } },
    } as any;
    const list = [y1, y2];
    sortYogiList(list, retreat, SELECTION_PRIORITY_SORT);
    expect(list[0]).toBe(y2);
  });
});
