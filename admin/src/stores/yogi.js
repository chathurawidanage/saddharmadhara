import { makeAutoObservable, runInAction } from "mobx";
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
} from "../dhis2";

const attendanceEventData = ({
  retreat,
  roomCode,
  attendance,
  specialComment,
  trackedEntityInstance,
  orgUnit,
  eventDate,
}) => {
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

class YogiStore {
  yogiIdToObjectMap = {};
  expressionOfInterestsYogiIds = {};

  requestStates = {
    loadingEoi: {}, // Map of retreatCode -> boolean
    eoiErrors: {},
    loadingYogi: {}, // Map of yogiId -> boolean
    yogiErrors: {},
    loadingBatch: {}, // Map of retreatCode -> boolean
    batchProgress: {}, // Map of retreatCode -> { completed, total, failed }
    batchErrors: {}, // Map of retreatCode -> string
    performingMutation: false,
    mutationError: null,
  };

  constructor(engine) {
    this.engine = engine;
    makeAutoObservable(this);
  }

  fetchExpressionOfInterests = async (retreatCode, retreatName) => {
    if (this.expressionOfInterestsYogiIds[retreatCode]) {
      return this.expressionOfInterestsYogiIds[retreatCode];
    }

    runInAction(() => {
      this.requestStates.loadingEoi[retreatCode] = true;
      this.requestStates.eoiErrors[retreatCode] = null;
    });

    try {
      let response = await this.engine.query({
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

      // optional: remove duplicates. Only first interest will be considered
      const yogiIdList = [
        ...new Set(response.yogis?.instances.map((i) => i.trackedEntity)),
      ];
      runInAction(() => {
        this.expressionOfInterestsYogiIds[retreatCode] = yogiIdList;
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

  fetchYogi = async (yogiId, forceRefetch = false) => {
    if (this.yogiIdToObjectMap[yogiId] && !forceRefetch) {
      return this.yogiIdToObjectMap[yogiId];
    }

    runInAction(() => {
      this.requestStates.loadingYogi[yogiId] = true;
      this.requestStates.yogiErrors[yogiId] = null;
    });

    try {
      let response = await this.engine.query({
        trackedEntity: {
          resource: `tracker/trackedEntities/${yogiId}`,
          params: {
            inactive: false,
            fields:
              "attributes[attribute,value],enrollments[status,notes[value,createdBy[username]],events[programStage,event,occurredAt,dataValues[dataElement,value]]]",
            program: DHIS_PROGRAM,
          },
        },
      });

      // attributes
      let attributeIdToValueMap = {};
      response.trackedEntity.attributes.forEach((attribute) => {
        attributeIdToValueMap[attribute.attribute] = attribute.value;
      });

      let active = false;

      // events
      let expressionOfInterests = {};
      let specialComments = [];
      let participation = {};
      let notes = [];
      if (response.trackedEntity.enrollments.length > 0) {
        let enrollment = response.trackedEntity.enrollments[0];
        active = enrollment.status === "ACTIVE";

        enrollment.events.forEach((event) => {
          let dataElementIdToValueMap = {};
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
                dataElementIdToValueMap[
                  DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT
                ],
              invitationSent:
                dataElementIdToValueMap[
                  DHIS2_RETREAT_INVITATION_SENT_DATA_ELEMENT
                ],
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
              attendance: dataElementIdToValueMap[DHIS2_ATTENDANCE_DATA_ELEMENT],
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

      const yogiObj = {
        id: yogiId,
        active,
        attributes: attributeIdToValueMap,
        expressionOfInterests,
        specialComments,
        participation,
        notes,
      };

      runInAction(() => {
        this.yogiIdToObjectMap[yogiId] = yogiObj;
      });

      return yogiObj;
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

  fetchYogiBatch = async (retreatCode, retreatName, onProgress) => {
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

      return yogis.filter(Boolean);
    } finally {
      runInAction(() => {
        this.requestStates.loadingBatch[retreatCode] = false;
      });
    }
  };

  /**
   * Helper to apply mutations consistently
   */
  applyMutation = async (mutation, localUpdate) => {
    runInAction(() => {
      this.requestStates.performingMutation = true;
      this.requestStates.mutationError = null;
    });

    try {
      const response = await this.engine.mutate(mutation);
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

  deleteParticipationEvent = async (yogiId, retreat) => {
    let eventId =
      this.yogiIdToObjectMap[yogiId].participation[retreat.code]?.eventId;
    if (!eventId) return true;

    const mutation = {
      resource: "events",
      id: eventId,
      type: "delete",
    };

    return this.applyMutation(mutation, () => {
      delete this.yogiIdToObjectMap[yogiId].participation[retreat.code];
    });
  };

  markAttendance = async (yogiId, retreat, attendance, specialComment) => {
    let eventId =
      this.yogiIdToObjectMap[yogiId].participation[retreat.code]?.eventId;
    const type = eventId ? "update" : "create";
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
      this.yogiIdToObjectMap[yogiId].participation[retreat.code] = {
        attendance,
        specialComment,
        eventId:
          eventId ||
          (response.response?.importSummaries
            ? response.response.importSummaries[0].reference
            : response.response?.reference),
        retreat: retreat.code,
        occurredAt: data.eventDate,
      };
    });
  };

  assignRoom = async (yogiId, retreat, roomCode) => {
    let eventId =
      this.yogiIdToObjectMap[yogiId].participation[retreat.code]?.eventId;
    const type = eventId ? "update" : "create";
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
      this.yogiIdToObjectMap[yogiId].participation[retreat.code] = {
        ...this.yogiIdToObjectMap[yogiId].participation[retreat.code],
        room: roomCode,
        eventId:
          eventId ||
          (response.response?.importSummaries
            ? response.response.importSummaries[0].reference
            : response.response?.reference),
        retreat: retreat.code,
        occurredAt: data.eventDate,
      };
    });
  };

  changeRetreatState = async (yogiId, retreatCode, newState) => {
    const eoi = this.yogiIdToObjectMap[yogiId].expressionOfInterests[retreatCode];
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
      type: "update",
    };

    return this.applyMutation(mutation, () => {
      this.yogiIdToObjectMap[yogiId].expressionOfInterests[retreatCode].state =
        newState;
    });
  };

  changeInvitationSentState = async (yogiId, retreatCode, invitationState) => {
    const eoi = this.yogiIdToObjectMap[yogiId].expressionOfInterests[retreatCode];
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
      type: "update",
    };

    return this.applyMutation(mutation, () => {
      this.yogiIdToObjectMap[yogiId].expressionOfInterests[
        retreatCode
      ].invitationSent = invitationState;
    });
  };
}

export default YogiStore;
