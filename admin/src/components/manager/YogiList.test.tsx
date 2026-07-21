import {
  getYogiSortScore,
  selectionPrioritySorter,
  ageSorter,
  sortYogiList,
  SELECTION_PRIORITY_SORT,
} from "../../utils/yogiUtils";
import { SelectionState } from "../../types/domain";

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

    expect(getYogiSortScore(reverend).total).toBeGreaterThan(
      getYogiSortScore(trustMember).total,
    );
    expect(getYogiSortScore(trustMember).total).toBeGreaterThan(
      getYogiSortScore(normal).total,
    );
  });

  test("getYogiSortScore dynamically calculates mFlex using actual retreat count in a season", () => {
    // Yogi with 1 request in target season S1 and 1 request in another season S2
    const yogi = {
      attributes: { dob: "1990-01-01" }, // age score: 50
      expressionOfInterests: {
        R1: { state: "PENDING", occurredAt: "2024-01-01" },
        R_other: { state: "PENDING", occurredAt: "2024-01-01" },
      },
      participation: {},
    } as any;

    const allRetreats = [
      { code: "R1", season: "S1", totalYogis: "10" },
      { code: "R2", season: "S1", totalYogis: "10" },
      { code: "R3", season: "S1", totalYogis: "10" },
      { code: "R4", season: "S1", totalYogis: "10" },
      { code: "R5", season: "S1", totalYogis: "10" },
      { code: "R6", season: "S1", totalYogis: "10" },
      { code: "R_other", season: "S2", totalYogis: "10" },
    ] as any[];

    const eoiSummary = [] as any[]; // dEffective = 1 (R_other is in S2, which is ignored)

    const currentRetreat = { code: "R1", season: "S1" } as any;

    const scoreWithSeason = getYogiSortScore(yogi, allRetreats, eoiSummary, currentRetreat).total;
    const scoreWithoutSeason = getYogiSortScore(yogi, allRetreats, eoiSummary).total;

    expect(scoreWithSeason).toBe(225);
    expect(scoreWithoutSeason).toBe(150);
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

  test("getYogiSortScore applies a -25 penalty for a no-show within the last year", () => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(today.getFullYear() - 2);

    const yogiWithRecentNoShow = {
      attributes: { dob: "1990-01-01" }, // age score: 50
      participation: {
        R1: { retreat: "R1", attendance: "noshow" },
      },
    } as any;

    const yogiWithOldNoShow = {
      attributes: { dob: "1990-01-01" }, // age score: 50
      participation: {
        R2: { retreat: "R2", attendance: "noshow" },
      },
    } as any;

    const allRetreats = [
      { code: "R1", date: sixMonthsAgo },
      { code: "R2", date: twoYearsAgo },
    ] as any[];

    const currentRetreat = { code: "R3" } as any;

    const scoreRecent = getYogiSortScore(yogiWithRecentNoShow, allRetreats, [], currentRetreat);
    const scoreOld = getYogiSortScore(yogiWithOldNoShow, allRetreats, [], currentRetreat);

    // base score: status(0) + age(50) + participation(100) + penalty(-25) = 125.
    // without recent penalty: 150.
    expect(scoreRecent.total).toBe(125);
    expect(scoreRecent.breakdown.participationScore).toBe(100);
    expect(scoreRecent.breakdown.penaltyScore).toBe(-25);
    expect(scoreRecent.breakdown.penaltyReason).toContain("No-show within last year (-25)");

    expect(scoreOld.total).toBe(150);
    expect(scoreOld.breakdown.participationScore).toBe(100);
    expect(scoreOld.breakdown.penaltyScore).toBe(0);
  });

  test("getYogiSortScore reduces marks for every occurrence of hasSelectionInSeason (50 for first, 25 for subsequent)", () => {
    const yogiWithOneOccurrence = {
      attributes: { dob: "1990-01-01" }, // age score: 50
      expressionOfInterests: {
        R1: { state: SelectionState.SELECTED, occurredAt: "2024-01-01" },
        R2: { state: SelectionState.PENDING, occurredAt: "2024-01-01" }, // Current retreat being graded is R2, so it's ignored for penalty
      },
      participation: {},
    } as any;

    const yogiWithThreeOccurrences = {
      attributes: { dob: "1990-01-01" }, // age score: 50
      expressionOfInterests: {
        R1: { state: SelectionState.SELECTED, occurredAt: "2024-01-01" },
        R2: { state: SelectionState.SELECTED, occurredAt: "2024-01-01" },
        R3: { state: SelectionState.PENDING, occurredAt: "2024-01-01" },
        R4: { state: SelectionState.PENDING, occurredAt: "2024-01-01" }, // Current retreat being graded is R4, so it's ignored
      },
      participation: {},
    } as any;

    const allRetreats = [
      { code: "R1", season: "S1", date: "2027-06-15" },
      { code: "R2", season: "S1", date: "2027-06-20" },
      { code: "R3", season: "S1", date: "2027-06-25" },
      { code: "R4", season: "S1", date: "2027-06-30" },
    ] as any[];

    // 1 occurrence penalty: -25
    const resOne = getYogiSortScore(yogiWithOneOccurrence, allRetreats, [], allRetreats[1]);
    expect(resOne.breakdown.penaltyScore).toBe(-25);

    // 3 occurrences penalty: -25 - 50 * 2 = -125
    const resThree = getYogiSortScore(yogiWithThreeOccurrences, allRetreats, [], allRetreats[3]);
    expect(resThree.breakdown.penaltyScore).toBe(-125);
  });
});
