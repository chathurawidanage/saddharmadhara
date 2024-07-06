import { makeAutoObservable, runInAction, values } from "mobx";
import {
    DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE,
    DHIS2_RETREAT_DATA_ELEMENT, DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT,
    DHIS_PROGRAM
} from "../dhis2";

class YogiStore {
    yogiIdToObjectMap = {};
    constructor(engine) {
        this.engine = engine;
        makeAutoObservable(this);
    }

    fetchYogi = async (yogiId, forceRefetch = false) => {
        if (this.yogiIdToObjectMap[yogiId]) {
            return;
        }

        let response = await this.engine.query({
            trackedEntity: {
                resource: `tracker/trackedEntities/${yogiId}`,
                params: {
                    inactive: false,
                    fields: "attributes[attribute,value],enrollments[status,events[programStage,event,occurredAt,dataValues[dataElement,value]]]",
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
                }
            });
        }

        runInAction(() => {
            this.yogiIdToObjectMap[yogiId] = {
                id: yogiId,
                active,
                attributes: attributeIdToValueMap,
                expressionOfInterests
            };
        })
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

        let response = await this.engine.mutate(mutation);

        if (response.httpStatusCode === 200) {
            runInAction(() => {
                this.yogiIdToObjectMap[yogiId].expressionOfInterests[retreatCode].state = newState;
            });
        }

        return response.httpStatusCode === 200;
    };
}

export default YogiStore;