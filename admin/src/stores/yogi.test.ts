import YogiStore from "./yogi";
import {
  DHIS2_ATTENDANCE_DATA_ELEMENT,
  DHIS2_ROOM_ALLOCATION_DATA_ELEMENT,
  DHIS2_RETREAT_DATA_ELEMENT,
  DHIS2_SPECIAL_COMMENT_DATA_ELEMENT,
} from "../dhis2";
import { Retreat, AttendanceState, Yogi } from "../types/domain";

describe("YogiStore participation mutations", () => {
  let store: YogiStore;
  let mutateMock: jest.Mock;

  const mockRetreat: Retreat = {
    id: "ret1",
    code: "RC101",
    name: "Test Retreat",
    retreatType: "general",
    location: "LOC1",
    date: new Date("2026-10-01"),
    noOfDays: 5,
    current: true,
  };

  const createMockYogi = (yogiId: string, participation = {}): Yogi => ({
    id: yogiId,
    active: true,
    attributes: {
      fullName: "Test Yogi",
    },
    expressionOfInterests: {},
    specialComments: [],
    participation,
    notes: [],
  });

  beforeEach(() => {
    mutateMock = jest.fn().mockResolvedValue({
      httpStatusCode: 200,
      response: {
        reference: "created-event-id",
        importSummaries: [{ reference: "created-event-id" }],
      },
    });
    const mockEngine = {
      mutate: mutateMock,
      query: jest.fn(),
    } as any;

    store = new YogiStore(mockEngine);
  });

  test("markAttendance preserves existing room assignment in mutation data and local state", async () => {
    const yogi = createMockYogi("yogi1", {
      RC101: {
        eventId: "event-123",
        room: "ROOM_A1",
        retreat: "RC101",
        occurredAt: "2026-10-01T00:00:00.000Z",
      },
    });
    store.yogiIdToObjectMap.set("yogi1", yogi);

    const success = await store.markAttendance(
      "yogi1",
      mockRetreat,
      AttendanceState.ATTENDED,
      "Arrived on time",
    );

    expect(success).toBe(true);
    expect(mutateMock).toHaveBeenCalledTimes(1);

    const mutationCall = mutateMock.mock.calls[0][0];
    expect(mutationCall.type).toBe("update");
    expect(mutationCall.id).toBe("event-123");

    const dataValues = mutationCall.data.dataValues;
    expect(dataValues).toEqual(
      expect.arrayContaining([
        { dataElement: DHIS2_ROOM_ALLOCATION_DATA_ELEMENT, value: "ROOM_A1" },
        { dataElement: DHIS2_RETREAT_DATA_ELEMENT, value: "RC101" },
        { dataElement: DHIS2_ATTENDANCE_DATA_ELEMENT, value: AttendanceState.ATTENDED },
        { dataElement: DHIS2_SPECIAL_COMMENT_DATA_ELEMENT, value: "Arrived on time" },
      ]),
    );

    // Verify local store state
    const updatedYogi = store.yogiIdToObjectMap.get("yogi1");
    expect(updatedYogi?.participation["RC101"]?.room).toBe("ROOM_A1");
    expect(updatedYogi?.participation["RC101"]?.attendance).toBe(AttendanceState.ATTENDED);
    expect(updatedYogi?.participation["RC101"]?.specialComment).toBe("Arrived on time");
  });

  test("assignRoom preserves existing attendance and special comments in mutation data and local state", async () => {
    const yogi = createMockYogi("yogi2", {
      RC101: {
        eventId: "event-456",
        attendance: AttendanceState.ATTENDED,
        specialComment: "Vegetarian meals only",
        retreat: "RC101",
        occurredAt: "2026-10-01T00:00:00.000Z",
      },
    });
    store.yogiIdToObjectMap.set("yogi2", yogi);

    const success = await store.assignRoom("yogi2", mockRetreat, "ROOM_B2");

    expect(success).toBe(true);
    expect(mutateMock).toHaveBeenCalledTimes(1);

    const mutationCall = mutateMock.mock.calls[0][0];
    expect(mutationCall.type).toBe("update");
    expect(mutationCall.id).toBe("event-456");

    const dataValues = mutationCall.data.dataValues;
    expect(dataValues).toEqual(
      expect.arrayContaining([
        { dataElement: DHIS2_ROOM_ALLOCATION_DATA_ELEMENT, value: "ROOM_B2" },
        { dataElement: DHIS2_RETREAT_DATA_ELEMENT, value: "RC101" },
        { dataElement: DHIS2_ATTENDANCE_DATA_ELEMENT, value: AttendanceState.ATTENDED },
        { dataElement: DHIS2_SPECIAL_COMMENT_DATA_ELEMENT, value: "Vegetarian meals only" },
      ]),
    );

    // Verify local store state
    const updatedYogi = store.yogiIdToObjectMap.get("yogi2");
    expect(updatedYogi?.participation["RC101"]?.room).toBe("ROOM_B2");
    expect(updatedYogi?.participation["RC101"]?.attendance).toBe(AttendanceState.ATTENDED);
    expect(updatedYogi?.participation["RC101"]?.specialComment).toBe("Vegetarian meals only");
  });
});
