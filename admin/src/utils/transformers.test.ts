import {
  transformEoiSummary,
  transformRetreats,
  transformRooms,
  transformLanguages,
  transformAttendance,
  transformParticipationSummary,
} from "./transformers";
import {
  DHIS2_RETREAT_CODE_ATTRIBUTE,
  DHIS2_RETREAT_DATE_ATTRIBUTE,
  DHIS2_RETREAT_DISABLED_ATTRIBUTE,
  DHIS2_RETREAT_LOCATION_ATTRIBUTE,
  DHIS2_RETREAT_NO_OF_DAYS_ATTRIBUTE,
  DHIS2_RETREAT_TOTAL_YOGIS_ATTRIBUTE,
  DHIS2_RETREAT_TYPE_ATTRIBUTE,
  DHIS2_ROOMS_FLOOR_ATTRIBUTE,
  DHIS2_RETREAT_MEDIUM_ATTRIBUTE,
  DHIS2_RETREAT_FINALIZED_ATTRIBUTE,
} from "../dhis2";
import { Dhis2SqlViewResponse, Dhis2OptionSetResponse } from "../types/dhis2";
import { SelectionState, InvitationState } from "../types/domain";

describe("transformers", () => {
  describe("transformRetreats", () => {
    test("transforms retreat response correctly", () => {
      const mockResponse: Dhis2SqlViewResponse = {
        listGrid: {
          headers: [],
          rows: [
            [
              "id1",
              "code1",
              "name1",
              JSON.stringify({
                [DHIS2_RETREAT_CODE_ATTRIBUTE]: "RC1",
                [DHIS2_RETREAT_DATE_ATTRIBUTE]: "2024-01-01",
                [DHIS2_RETREAT_NO_OF_DAYS_ATTRIBUTE]: 5,
                [DHIS2_RETREAT_DISABLED_ATTRIBUTE]: "false",
                [DHIS2_RETREAT_LOCATION_ATTRIBUTE]: "LOC1",
                [DHIS2_RETREAT_TOTAL_YOGIS_ATTRIBUTE]: 50,
                [DHIS2_RETREAT_TYPE_ATTRIBUTE]: "General",
                [DHIS2_RETREAT_MEDIUM_ATTRIBUTE]: "Sinhala",
                [DHIS2_RETREAT_FINALIZED_ATTRIBUTE]: "false",
              }),
              "true", // current
            ],
          ],
        },
      };

      const result = transformRetreats(mockResponse);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: "id1",
          code: "code1",
          name: "name1",
          current: true,
          retreatCode: "RC1",
          noOfDays: 5,
          location: "LOC1",
          totalYogis: 50,
          retreatType: "General",
          medium: "Sinhala",
          finalized: false,
        }),
      );
      expect(result[0].date).toBeInstanceOf(Date);
      expect(result[0].endDate).toBeInstanceOf(Date);
    });

    test("sorts retreats by date", () => {
      const mockResponse: Dhis2SqlViewResponse = {
        listGrid: {
          headers: [],
          rows: [
            [
              "id2",
              "code2",
              "name2",
              JSON.stringify({ [DHIS2_RETREAT_DATE_ATTRIBUTE]: "2024-01-10" }),
              "false",
            ],
            [
              "id1",
              "code1",
              "name1",
              JSON.stringify({ [DHIS2_RETREAT_DATE_ATTRIBUTE]: "2024-01-01" }),
              "false",
            ],
          ],
        },
      };
      const result = transformRetreats(mockResponse);
      expect(result[0].id).toBe("id1");
      expect(result[1].id).toBe("id2");
    });
  });

  describe("transformRooms", () => {
    test("transforms room options correctly", () => {
      const mockResponse: Dhis2OptionSetResponse = {
        options: [
          {
            id: "opt1",
            code: "RM1",
            name: "Room 1",
            attributeValues: [
              {
                attribute: { id: DHIS2_RETREAT_LOCATION_ATTRIBUTE },
                value: "LOC1",
              },
              { attribute: { id: DHIS2_ROOMS_FLOOR_ATTRIBUTE }, value: "1" },
            ],
          },
        ],
      };
      const result = transformRooms(mockResponse);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        code: "RM1",
        name: "Room 1",
        location: "LOC1",
        floor: "1",
      });
    });
  });

  describe("transformLanguages", () => {
    test("transforms language options correctly", () => {
      const mockResponse: Dhis2OptionSetResponse = {
        options: [{ id: "opt1", code: "en", name: "English" }],
      };
      const result = transformLanguages(mockResponse);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ code: "en", name: "English" });
    });
  });

  describe("transformAttendance", () => {
    test("transforms attendance options correctly", () => {
      const mockResponse: Dhis2OptionSetResponse = {
        options: [{ id: "opt1", code: "present", name: "Present" }],
      };
      const result = transformAttendance(mockResponse);
      expect(result).toEqual([{ code: "present", name: "Present" }]);
    });
  });

  describe("transformParticipationSummary", () => {
    test("normalizes participation summary rows", () => {
      const mockResponse: Dhis2SqlViewResponse = {
        listGrid: {
          headers: [],
          rows: [["y1", "R1"]],
        },
      };

      expect(transformParticipationSummary(mockResponse)).toEqual([
        { yogiUid: "y1", retreatCode: "R1" },
      ]);
    });
  });

  describe("transformEoiSummary", () => {
    test("normalizes EOI summary rows", () => {
      const mockResponse: Dhis2SqlViewResponse = {
        listGrid: {
          headers: [],
          rows: [
            ["y1", "R1", "SELECTED", "SENT"], 
            ["y2", "R1", "PENDING", "NOT_SENT"]
          ],
        },
      };

      expect(transformEoiSummary(mockResponse)).toEqual([
        { yogiUid: "y1", retreatCode: "R1", state: SelectionState.SELECTED, invitationSent: InvitationState.SENT },
        { yogiUid: "y2", retreatCode: "R1", state: SelectionState.PENDING, invitationSent: InvitationState.NOT_SENT },
      ]);
    });
  });
});
