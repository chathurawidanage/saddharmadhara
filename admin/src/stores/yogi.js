import { makeAutoObservable, runInAction } from "mobx";
import {
    DHIS2_ATTENDANCE_DATA_ELEMENT,
    DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE,
    DHIS2_PARTICIPATION_PROGRAM_STAGE,
    DHIS2_RETREAT_DATA_ELEMENT, DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT,
    DHIS2_ROOM_ALLOCATION_DATA_ELEMENT,
    DHIS2_SPECIAL_COMMENT_DATA_ELEMENT,
    DHIS2_SPECIAL_COMMENT_PROGRAM_STAGE,
    DHIS_PROGRAM
} from "../dhis2";

const roomAllocationEventData = (roomCode, retreat) => {
    return {
        program: DHIS_PROGRAM,
        programStage: DHIS2_PARTICIPATION_PROGRAM_STAGE,
        status: "ACTIVE",
        dataValues: [
            {
                dataElement: DHIS2_ROOM_ALLOCATION_DATA_ELEMENT,
                value: roomCode,
            },
            {
                dataElement: DHIS2_RETREAT_DATA_ELEMENT,
                value: retreat.code,
            },
        ],
    }
};

class YogiStore {
    yogiIdToObjectMap = {};
    constructor(engine) {
        this.engine = engine;
        makeAutoObservable(this);
    }

    fetchYogi = async (yogiId, forceRefetch = false) => {
        if (this.yogiIdToObjectMap[yogiId] && !forceRefetch) {
            return;
        }

        let response = await this.engine.query({
            trackedEntity: {
                resource: `tracker/trackedEntities/${yogiId}`,
                params: {
                    inactive: false,
                    fields: "attributes[attribute,value],enrollments[status,notes[value,createdBy[username]],events[programStage,event,occurredAt,dataValues[dataElement,value]]]",
                    program: DHIS_PROGRAM
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
            active = enrollment.status === 'ACTIVE';

            enrollment.events.forEach(event => {
                let dataElementIdToValueMap = {};
                event.dataValues.forEach(dv => {
                    dataElementIdToValueMap[dv.dataElement] = dv.value;
                });

                if (event.programStage === DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE) {
                    expressionOfInterests[dataElementIdToValueMap[DHIS2_RETREAT_DATA_ELEMENT]] = {
                        eventId: event.event,
                        state: dataElementIdToValueMap[DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT],
                        occurredAt: event.occurredAt
                    }
                } else if (event.programStage === DHIS2_SPECIAL_COMMENT_PROGRAM_STAGE) {
                    specialComments.push({
                        eventId: event.event,
                        comment: dataElementIdToValueMap[DHIS2_SPECIAL_COMMENT_DATA_ELEMENT],
                        occurredAt: event.occurredAt
                    });
                } else if (event.programStage === DHIS2_PARTICIPATION_PROGRAM_STAGE) {
                    participation[dataElementIdToValueMap[DHIS2_RETREAT_DATA_ELEMENT]] = {
                        eventId: event.event,
                        attendance: dataElementIdToValueMap[DHIS2_ATTENDANCE_DATA_ELEMENT],
                        room: dataElementIdToValueMap[DHIS2_ROOM_ALLOCATION_DATA_ELEMENT],
                        retreat: dataElementIdToValueMap[DHIS2_RETREAT_DATA_ELEMENT],
                        occurredAt: event.occurredAt
                    };
                }
            });
            notes.push(...enrollment.notes);
        }

        runInAction(() => {
            this.yogiIdToObjectMap[yogiId] = {
                id: yogiId,
                active,
                attributes: attributeIdToValueMap,
                expressionOfInterests,
                specialComments,
                participation,
                notes
            };
        })
    };

    deletePartipationEvent = async (yogiId, retreat) => {
        let eventId = this.yogiIdToObjectMap[yogiId].participation[retreat.code]?.eventId;
        if (eventId) {
            const mutation = {
                resource: "events",
                id: eventId,
                type: "delete"
            };
            let response = await this.engine.mutate(mutation);
            if (response.httpStatusCode === 200) {
                runInAction(() => {
                    delete this.yogiIdToObjectMap[yogiId].participation[retreat.code]
                });
            }
            return response.httpStatusCode === 200;
        } else {
            return true;
        }
    };

    assignRoom = async (yogiId, retreat, roomCode) => {
        let eventId = this.yogiIdToObjectMap[yogiId].participation[retreat.code]?.eventId;

        try {
            if (eventId) {
                let data = roomAllocationEventData(roomCode, retreat);
                const mutation = {
                    resource: "events",
                    id: eventId,
                    data,
                    type: "update"
                };
                let response = await this.engine.mutate(mutation);
                if (response.httpStatusCode === 200) {
                    runInAction(() => {
                        this.yogiIdToObjectMap[yogiId].participation[retreat.code].room = roomCode;
                    });
                }
                return response.httpStatusCode === 200;
            } else {
                let data = roomAllocationEventData(roomCode, retreat);
                data.trackedEntityInstance = yogiId;
                data.orgUnit = retreat.location;
                data.eventDate = new Date();

                const mutation = {
                    resource: "events",
                    id: eventId,
                    data,
                    type: "create"
                };
                let response = await this.engine.mutate(mutation);

                if (response.httpStatusCode === 200) {
                    runInAction(() => {
                        this.yogiIdToObjectMap[yogiId].participation[retreat.code] = {
                            room: roomCode,
                            eventId: response.response.importSummaries[0].reference,
                            retreat: retreat.code,
                            occurredAt: data.eventDate
                        };
                    });
                }
                return response.httpStatusCode === 200;
            }
        } catch (e) {
            console.error("Room assignment failed", e);
            return false;
        }
    };

    changeRetreatState = async (yogiId, retreatCode, newState) => {
        const mutation = {
            resource: "events",
            id: this.yogiIdToObjectMap[yogiId].expressionOfInterests[retreatCode].eventId,
            data: {
                program: DHIS_PROGRAM,
                programStage: DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE,
                status: "COMPLETED",
                dataValues: [
                    {
                        dataElement: DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT,
                        value: newState,
                    },
                    {
                        dataElement: DHIS2_RETREAT_DATA_ELEMENT,
                        value: retreatCode,
                    },
                ],
            },
            type: "update",
        };

        try {

            let response = await this.engine.mutate(mutation);

            if (response.httpStatusCode === 200) {
                runInAction(() => {
                    this.yogiIdToObjectMap[yogiId].expressionOfInterests[retreatCode].state = newState;
                });
            }

            return response.httpStatusCode === 200;
        } catch (e) {
            console.error("Yogi state change failed", e);
            return false;
        }
    };
}

export default YogiStore;