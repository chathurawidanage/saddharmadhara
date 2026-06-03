import MetadataStore from "./metadata";
import { getRetreatEndDate } from "../utils/retreatUtils";
import { transformRetreats } from "../utils/transformers";
import {
  DHIS2_RETREAT_DATE_ATTRIBUTE,
  DHIS2_RETREAT_NO_OF_DAYS_ATTRIBUTE,
  DHIS2_RETREAT_CODE_ATTRIBUTE,
} from "../dhis2";
import { Dhis2SqlViewResponse } from "../types/dhis2";

describe("MetadataStore Helpers", () => {
  test("getRetreatEndDate calculates correct date", () => {
    const startDate = new Date("2024-01-01T00:00:00Z");
    const noOfDays = 10;
    const result = getRetreatEndDate(startDate, noOfDays);
    expect(result?.toISOString()).toBe("2024-01-11T00:00:00.000Z");
  });

  test("transformRetreats transforms raw DHIS2 response correctly", () => {
    const mockResponse: Dhis2SqlViewResponse = {
      listGrid: {
        headers: [],
        rows: [
          [
            "id1",
            "code1",
            "Retreat 1",
            JSON.stringify({
              [DHIS2_RETREAT_DATE_ATTRIBUTE]: "2024-01-01", // Date
              [DHIS2_RETREAT_NO_OF_DAYS_ATTRIBUTE]: "10", // No of days
              [DHIS2_RETREAT_CODE_ATTRIBUTE]: "RC1", // Retreat Code
            }),
            "true", // Current
          ],
        ],
      },
    };

    // Note: These IDs are from ../dhis2.js.
    // I should ideally mock them or use the same constants.
    // For now I am assuming the logic in transformRetreats uses them correctly.

    const retreats = transformRetreats(mockResponse);
    expect(retreats).toHaveLength(1);
    expect(retreats[0].id).toBe("id1");
    expect(retreats[0].current).toBe(true);
    expect(retreats[0].date.toISOString()).toBe(
      new Date("2024-01-01").toISOString(),
    );
  });
});

describe("MetadataStore.generalRetreatStats", () => {
  let store: MetadataStore;
  const mockEngine = {} as any;

  beforeEach(() => {
    store = new MetadataStore(mockEngine);
  });

  test("returns baseline stats when data is missing", () => {
    const stats = store.generalRetreatStats;
    expect(stats).toEqual({
      totalParticipants: 0,
      totalApplicants: 0,
      oneTimeParticipants: 0,
      repeatParticipants: 0,
      unableToParticipate: 0,
      repeatBreakdown: {},
    });

  });

  test("calculates stats correctly with mock data", () => {
    store.retreats = [
      {
        id: "r1",
        code: "R1",
        name: "Retreat 1",
        retreatType: "general",
      } as any,
      {
        id: "r2",
        code: "R2",
        name: "Retreat 2",
        retreatType: "general",
      } as any,
    ];

    store.participationSummary = [
      { yogiUid: "y1", retreatCode: "R1" },
      { yogiUid: "y1", retreatCode: "R2" },
      { yogiUid: "y2", retreatCode: "R1" },
    ];

    store.eoiSummary = [
      { yogiUid: "y1", retreatCode: "R1", state: "SELECTED", invitationSent: "SENT" },
      { yogiUid: "y2", retreatCode: "R1", state: "SELECTED", invitationSent: "SENT" },
      { yogiUid: "y3", retreatCode: "R1", state: "PENDING", invitationSent: "NOT_SENT" },
    ];

    const stats = store.generalRetreatStats;
    expect(stats).toEqual({
      totalParticipants: 2,
      totalApplicants: 3,
      repeatBreakdown: {
        2: 1,
      },
      oneTimeParticipants: 1,
      repeatParticipants: 1,
      unableToParticipate: 1,
    });
  });
});
