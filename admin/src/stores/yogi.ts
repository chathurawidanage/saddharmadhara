import { makeAutoObservable, runInAction, observable } from "mobx";
import {
  DHIS2_ATTENDANCE_DATA_ELEMENT,
  DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE,
  DHIS2_PARTICIPATION_PROGRAM_STAGE,
  DHIS2_RETREAT_DATA_ELEMENT,
  DHIS2_RETREAT_INVITATION_SENT_DATA_ELEMENT,
  DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT,
  DHIS2_ROOM_ALLOCATION_DATA_ELEMENT,
  DHIS2_SPECIAL_COMMENT_DATA_ELEMENT,
  DHIS2_SPECIAL_COMMENT_PROGRAM_STAGE,
  DHIS_PROGRAM,
  DHIS2_TEI_ATTRIBUTE_FULL_NAME,
  DHIS2_TEI_ATTRIBUTE_GENDER,
  DHIS2_TEI_ATTRIBUTE_MOBILE,
  DHIS2_TEI_ATTRIBUTE_MARITAL_STATE,
  DHIS2_TEI_ATTRIBUTE_NIC,
  DHIS2_TEI_ATTRIBUTE_PASSPORT,
  DHIS2_TEI_ATTRIBUTE_DOB,
  DHIS2_TEI_ATTRIBUTE_YOGI_PRIORITY,
  DHIS2_TEI_ATTRIBUTE_HAS_KIDS,
  DHIS2_TEI_ATTRIBUTE_HAS_KIDS_COMMENT,
  DHIS2_TEI_ATTRIBUTE_HAS_PERMISSION,
  DHIS2_TEI_ATTRIBUTE_HAS_PERMISSION_COMMENT,
  DHIS2_TEI_ATTRIBUTE_HAS_UNATTENDED_DEFORMITIES,
  DHIS2_TEI_ATTRIBUTE_HAS_UNATTENDED_DEFORMITIES_COMMENT,
  DHIS2_TEI_ATTRIBUTE_HAS_STRESS,
  DHIS2_TEI_ATTRIBUTE_HAS_STRESS_COMMENT,
} from "../dhis2";
import { Yogi, Retreat, ExpressionOfInterest, Participation, SpecialComment, Note, YogiAttributes, SelectionState, InvitationState, AttendanceState } from "../types/domain";
import {
  Dhis2Engine,
  Dhis2TrackerEventsResponse,
  Dhis2TrackedEntityInstance,
} from "../types/dhis2";


interface AttendanceEventDataParams {
  retreat?: Partial<Retreat>;
  roomCode?: string;
  attendance?: string;
  specialComment?: string;
  trackedEntityInstance?: string;
  orgUnit?: string;
  eventDate?: Date;
}

const attributeUIDToNameMap: Record<string, keyof YogiAttributes> = {
  [DHIS2_TEI_ATTRIBUTE_FULL_NAME]: "fullName",
  [DHIS2_TEI_ATTRIBUTE_GENDER]: "gender",
  [DHIS2_TEI_ATTRIBUTE_MOBILE]: "mobile",
  [DHIS2_TEI_ATTRIBUTE_MARITAL_STATE]: "maritalState",
  [DHIS2_TEI_ATTRIBUTE_NIC]: "nic",
  [DHIS2_TEI_ATTRIBUTE_PASSPORT]: "passport",
  [DHIS2_TEI_ATTRIBUTE_DOB]: "dob",
  [DHIS2_TEI_ATTRIBUTE_YOGI_PRIORITY]: "priority",
  [DHIS2_TEI_ATTRIBUTE_HAS_KIDS]: "hasKids",
  [DHIS2_TEI_ATTRIBUTE_HAS_KIDS_COMMENT]: "hasKidsComment",
  [DHIS2_TEI_ATTRIBUTE_HAS_PERMISSION]: "hasPermission",
  [DHIS2_TEI_ATTRIBUTE_HAS_PERMISSION_COMMENT]: "hasPermissionComment",
  [DHIS2_TEI_ATTRIBUTE_HAS_UNATTENDED_DEFORMITIES]: "hasUnattendedDeformities",
  [DHIS2_TEI_ATTRIBUTE_HAS_UNATTENDED_DEFORMITIES_COMMENT]:
    "hasUnattendedDeformitiesComment",
  [DHIS2_TEI_ATTRIBUTE_HAS_STRESS]: "hasStress",
  [DHIS2_TEI_ATTRIBUTE_HAS_STRESS_COMMENT]: "hasStressComment",
};

const attendanceEventData = ({
  retreat,
  roomCode,
  attendance,
  specialComment,
  trackedEntityInstance,
  orgUnit,
  eventDate,
}: AttendanceEventDataParams) => {
  const dataValues = [];
  if (roomCode) {
    dataValues.push({
      dataElement: DHIS2_ROOM_ALLOCATION_DATA_ELEMENT,
      value: roomCode,
    });
  }

  if (retreat) {
    dataValues.push({
      dataElement: DHIS2_RETREAT_DATA_ELEMENT,
      value: retreat.code,
    });
  }

  if (attendance) {
    dataValues.push({
      dataElement: DHIS2_ATTENDANCE_DATA_ELEMENT,
      value: attendance,
    });
  }

  if (specialComment) {
    dataValues.push({
      dataElement: DHIS2_SPECIAL_COMMENT_DATA_ELEMENT,
      value: specialComment,
    });
  }

  return {
    program: DHIS_PROGRAM,
    programStage: DHIS2_PARTICIPATION_PROGRAM_STAGE,
    status: "ACTIVE",
    dataValues,
    trackedEntityInstance,
    orgUnit,
    eventDate,
  };
};

interface RequestStates {
  loadingEoi: Record<string, boolean>;
  eoiErrors: Record<string, string | null>;
  loadingYogi: Record<string, boolean>;
  yogiErrors: Record<string, string | null>;
  loadingBatch: Record<string, boolean>;
  batchProgress: Record<string, { completed: number; total: number; failed: number }>;
  batchErrors: Record<string, string | null>;
  performingMutation: boolean;
  mutationError: string | null;
}

class YogiStore {
  yogiIdToObjectMap = new Map<string, Yogi>();
  expressionOfInterestsYogiIds = new Map<string, string[]>();
  engine: Dhis2Engine;


  requestStates: RequestStates = {
    loadingEoi: {},
    eoiErrors: {},
    loadingYogi: {},
    yogiErrors: {},
    loadingBatch: {},
    batchProgress: {},
    batchErrors: {},
    performingMutation: false,
    mutationError: null,
  };

  constructor(engine: Dhis2Engine) {
    this.engine = engine;
    makeAutoObservable(this);
  }

  fetchExpressionOfInterests = async (retreatCode: string, retreatName?: string): Promise<string[] | null> => {
    if (this.expressionOfInterestsYogiIds.has(retreatCode)) {
      return this.expressionOfInterestsYogiIds.get(retreatCode) ?? null;
    }

    runInAction(() => {
      this.requestStates.loadingEoi[retreatCode] = true;
      this.requestStates.eoiErrors[retreatCode] = null;
    });

    try {
      const response = await this.engine.query({

        yogis: {
          resource: "tracker/events.json",
          params: {
            programStage: DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE,
            filter: `${DHIS2_RETREAT_DATA_ELEMENT}:eq:${
              retreatName || retreatCode
            }`,
            fields: "trackedEntity",
            skipPaging: true,
          },
        },
      });

      const yogisResponse = response.yogis as Dhis2TrackerEventsResponse;
      const yogiIdList = [
        ...new Set<string>(yogisResponse?.instances.map((i) => i.trackedEntity)),
      ];

      runInAction(() => {
        this.expressionOfInterestsYogiIds.set(retreatCode, yogiIdList);
      });
      return yogiIdList;
    } catch (error) {
      runInAction(() => {
        this.requestStates.eoiErrors[retreatCode] =
          `Failed to fetch EOIs for ${retreatCode}.`;
      });
      console.error(error);
      return null;
    } finally {
      runInAction(() => {
        this.requestStates.loadingEoi[retreatCode] = false;
      });
    }
  };

  fetchYogi = async (yogiId: string, forceRefetch = false): Promise<Yogi | null> => {
    if (this.yogiIdToObjectMap.has(yogiId) && !forceRefetch) {
      return this.yogiIdToObjectMap.get(yogiId) ?? null;
    }

    runInAction(() => {
      this.requestStates.loadingYogi[yogiId] = true;
      this.requestStates.yogiErrors[yogiId] = null;
    });

    try {
      const response = await this.engine.query({

        trackedEntity: {
          resource: `tracker/trackedEntities/${yogiId}`,
          params: {
            inactive: false,
            fields:
              "attributes[attribute,value],enrollments[status,notes[value,storedAt,createdBy[username]],events[programStage,event,occurredAt,dataValues[dataElement,value]]]",
            program: DHIS_PROGRAM,
          },
        },
      });

      const tei = response.trackedEntity as Dhis2TrackedEntityInstance;

      const attributeIdToValueMap: YogiAttributes = {};
      tei.attributes.forEach((attribute) => {
        attributeIdToValueMap[attribute.attribute] = attribute.value;

        const name = attributeUIDToNameMap[attribute.attribute];
        if (name) {
          let value = attribute.value;
          if (name === "gender" || name === "maritalState" || name === "priority") {
            value = (value || "").toLowerCase();
          } else if (name === "hasKids" || name === "hasPermission" || name === "hasUnattendedDeformities" || name === "hasStress") {
            value = value !== undefined && value !== null ? (String(value).toLowerCase() === "true" || value === true) : undefined as any;
          }
          attributeIdToValueMap[name] = value as any;
        }
      });

      let active = false;
      const expressionOfInterests: Record<string, ExpressionOfInterest> = {};
      const specialComments: SpecialComment[] = [];
      const participation: Record<string, Participation> = {};
      const notes: Note[] = [];

      if (tei.enrollments.length > 0) {
        const enrollment = tei.enrollments[0];
        active = enrollment.status === "ACTIVE";

        enrollment.events.forEach((event) => {
          const dataElementIdToValueMap: Record<string, string> = {};
          event.dataValues.forEach((dv) => {
            dataElementIdToValueMap[dv.dataElement] = dv.value;
          });

          if (
            event.programStage === DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE
          ) {
            expressionOfInterests[
              dataElementIdToValueMap[DHIS2_RETREAT_DATA_ELEMENT]
            ] = {
              eventId: event.event,
              state:
                (dataElementIdToValueMap[
                  DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT
                ] || "").toLowerCase() as SelectionState,
              invitationSent:
                (dataElementIdToValueMap[
                  DHIS2_RETREAT_INVITATION_SENT_DATA_ELEMENT
                ] || "").toLowerCase() as InvitationState,
              occurredAt: event.occurredAt,
            };
          } else if (
            event.programStage === DHIS2_SPECIAL_COMMENT_PROGRAM_STAGE
          ) {
            specialComments.push({
              eventId: event.event,
              comment:
                dataElementIdToValueMap[DHIS2_SPECIAL_COMMENT_DATA_ELEMENT],
              occurredAt: event.occurredAt,
            });
          } else if (event.programStage === DHIS2_PARTICIPATION_PROGRAM_STAGE) {
            participation[
              dataElementIdToValueMap[DHIS2_RETREAT_DATA_ELEMENT]
            ] = {
              eventId: event.event,
              attendance: (dataElementIdToValueMap[DHIS2_ATTENDANCE_DATA_ELEMENT] || "").toLowerCase() as AttendanceState,
              room: dataElementIdToValueMap[DHIS2_ROOM_ALLOCATION_DATA_ELEMENT],
              retreat: dataElementIdToValueMap[DHIS2_RETREAT_DATA_ELEMENT],
              specialComment:
                dataElementIdToValueMap[DHIS2_SPECIAL_COMMENT_DATA_ELEMENT],
              occurredAt: event.occurredAt,
            };
          }
        });
        notes.push(...enrollment.notes);
      }

      const yogiObj: Yogi = {
        id: yogiId,
        active,
        attributes: attributeIdToValueMap,
        expressionOfInterests,
        specialComments,
        participation,
        notes,
      };

      runInAction(() => {
        this.yogiIdToObjectMap.set(yogiId, observable(yogiObj));
      });

      return this.yogiIdToObjectMap.get(yogiId) ?? null;
    } catch (error) {
      runInAction(() => {
        this.requestStates.yogiErrors[yogiId] = `Failed to fetch yogi ${yogiId}.`;
      });
      console.error(error);
      return null;
    } finally {
      runInAction(() => {
        this.requestStates.loadingYogi[yogiId] = false;
      });
    }
  };

  fetchYogiBatch = async (retreatCode: string, retreatName?: string, onProgress?: (progress: { completed: number; total: number; failed: number }) => void): Promise<Yogi[]> => {
    runInAction(() => {
      this.requestStates.loadingBatch[retreatCode] = true;
      this.requestStates.batchErrors[retreatCode] = null;
      this.requestStates.batchProgress[retreatCode] = {
        completed: 0,
        total: 0,
        failed: 0,
      };
    });

    try {
      const yogiIdList = await this.fetchExpressionOfInterests(
        retreatCode,
        retreatName,
      );

      if (yogiIdList === null) {
        runInAction(() => {
          this.requestStates.batchErrors[retreatCode] =
            this.requestStates.eoiErrors[retreatCode] ||
            `Failed to load yogis for ${retreatCode}.`;
        });
        return [];
      }

      runInAction(() => {
        this.requestStates.batchProgress[retreatCode] = {
          completed: 0,
          total: yogiIdList.length,
          failed: 0,
        };
      });

      if (yogiIdList.length === 0) {
        return [];
      }

      let completed = 0;
      let failed = 0;

      const yogis = await Promise.all(
        yogiIdList.map(async (yogiId) => {
          const yogi = await this.fetchYogi(yogiId);
          completed += 1;
          if (!yogi) {
            failed += 1;
          }

          runInAction(() => {
            this.requestStates.batchProgress[retreatCode] = {
              completed,
              total: yogiIdList.length,
              failed,
            };
          });

          if (onProgress) {
            onProgress({
              completed,
              total: yogiIdList.length,
              failed,
            });
          }

          return yogi;
        }),
      );

      if (failed > 0) {
        runInAction(() => {
          this.requestStates.batchErrors[retreatCode] =
            `Failed to load ${failed} yogi record${failed === 1 ? "" : "s"}.`;
        });
      }

      return (yogis.filter(Boolean) as Yogi[]);
    } finally {
      runInAction(() => {
        this.requestStates.loadingBatch[retreatCode] = false;
      });
    }
  };

  applyMutation = async (
    mutation: object,
    localUpdate: (response: any) => void,
  ): Promise<boolean> => {

    runInAction(() => {
      this.requestStates.performingMutation = true;
      this.requestStates.mutationError = null;
    });

    try {
      const response = await this.engine.mutate(mutation as any);
      if (response.httpStatusCode === 200 || response.httpStatusCode === 201) {
        runInAction(() => {
          localUpdate(response);
        });
        return true;
      }
      return false;
    } catch (error) {
      runInAction(() => {
        this.requestStates.mutationError = "Mutation failed.";
      });
      console.error(error);
      return false;
    } finally {
      runInAction(() => {
        this.requestStates.performingMutation = false;
      });
    }
  };

  deleteParticipationEvent = async (yogiId: string, retreat: Retreat): Promise<boolean> => {
    const eventId =
      this.yogiIdToObjectMap.get(yogiId)?.participation[retreat.code]?.eventId;
    if (!eventId) return true;

    const mutation = {
      resource: "events",
      id: eventId,
      type: "delete" as const,
    };

    return this.applyMutation(mutation, () => {
      const yogi = this.yogiIdToObjectMap.get(yogiId);
      if (yogi) {
        delete yogi.participation[retreat.code];
      }
    });
  };

  markAttendance = async (yogiId: string, retreat: Retreat, attendance: string, specialComment?: string): Promise<boolean> => {
    const eventId =
      this.yogiIdToObjectMap.get(yogiId)?.participation[retreat.code]?.eventId;
    const type = eventId ? ("update" as const) : ("create" as const);
    const data = eventId
      ? attendanceEventData({ attendance, specialComment, retreat })
      : attendanceEventData({
          attendance,
          specialComment,
          retreat,
          trackedEntityInstance: yogiId,
          orgUnit: retreat.location,
          eventDate: new Date(),
        });

    const mutation = {
      resource: "events",
      id: eventId,
      data,
      type,
    };

    return this.applyMutation(mutation, (response) => {
      const yogi = this.yogiIdToObjectMap.get(yogiId);
      if (yogi) {
        yogi.participation[retreat.code] = {
          attendance,
          specialComment,
          eventId:
            eventId ||
            (response.response?.importSummaries
              ? response.response.importSummaries[0].reference
              : response.response?.reference),
          retreat: retreat.code,
          occurredAt: (data.eventDate as Date).toISOString(),
        };
      }
    });
  };

  assignRoom = async (yogiId: string, retreat: Retreat, roomCode: string): Promise<boolean> => {
    const eventId =
      this.yogiIdToObjectMap.get(yogiId)?.participation[retreat.code]?.eventId;
    const type = eventId ? ("update" as const) : ("create" as const);
    const data = eventId
      ? attendanceEventData({ roomCode, retreat })
      : attendanceEventData({
          roomCode,
          retreat,
          trackedEntityInstance: yogiId,
          orgUnit: retreat.location,
          eventDate: new Date(),
        });

    const mutation = {
      resource: "events",
      id: eventId,
      data,
      type,
    };

    return this.applyMutation(mutation, (response) => {
      const yogi = this.yogiIdToObjectMap.get(yogiId);
      if (yogi) {
        yogi.participation[retreat.code] = {
          ...yogi.participation[retreat.code],
          room: roomCode,
          eventId:
            eventId ||
            (response.response?.importSummaries
              ? response.response.importSummaries[0].reference
              : response.response?.reference),
          retreat: retreat.code,
          occurredAt: (data.eventDate as Date).toISOString(),
        };
      }
    });
  };

  changeRetreatState = async (yogiId: string, retreatCode: string, newState: SelectionState): Promise<boolean> => {
    const yogi = this.yogiIdToObjectMap.get(yogiId);
    if (!yogi) return false;
    const eoi = yogi.expressionOfInterests[retreatCode];
    const dataValues = [
      {
        dataElement: DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT,
        value: newState,
      },
      {
        dataElement: DHIS2_RETREAT_DATA_ELEMENT,
        value: retreatCode,
      },
    ];

    if (eoi.invitationSent) {
      dataValues.push({
        dataElement: DHIS2_RETREAT_INVITATION_SENT_DATA_ELEMENT,
        value: eoi.invitationSent,
      });
    }

    const mutation = {
      resource: "events",
      id: eoi.eventId,
      data: {
        program: DHIS_PROGRAM,
        programStage: DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE,
        status: "COMPLETED",
        dataValues,
      },
      type: "update" as const,
    };

    return this.applyMutation(mutation, () => {
      const yogi = this.yogiIdToObjectMap.get(yogiId);
      if (yogi) {
        yogi.expressionOfInterests[retreatCode].state = newState;
      }
    });
  };

  changeInvitationSentState = async (yogiId: string, retreatCode: string, invitationState: InvitationState): Promise<boolean> => {
    const yogi = this.yogiIdToObjectMap.get(yogiId);
    if (!yogi) return false;
    const eoi = yogi.expressionOfInterests[retreatCode];
    const mutation = {
      resource: "events",
      id: eoi.eventId,
      data: {
        program: DHIS_PROGRAM,
        programStage: DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE,
        status: "COMPLETED",
        dataValues: [
          {
            dataElement: DHIS2_RETREAT_INVITATION_SENT_DATA_ELEMENT,
            value: invitationState,
          },
          {
            dataElement: DHIS2_RETREAT_DATA_ELEMENT,
            value: retreatCode,
          },
          {
            dataElement: DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT,
            value: eoi.state,
          },
        ],
      },
      type: "update" as const,
    };

    return this.applyMutation(mutation, () => {
      const yogi = this.yogiIdToObjectMap.get(yogiId);
      if (yogi) {
        yogi.expressionOfInterests[retreatCode].invitationSent = invitationState;
      }
    });
  };
}

export default YogiStore;
