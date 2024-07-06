import { DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE, DHIS2_RETREAT_DATA_ELEMENT, DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT } from "../../dhis2";
import {
    Tooltip
} from "@dhis2/ui";
import "./ActiveApplicationIndicator.css";
import { observer } from "mobx-react";

const ActiveApplicationIndicator = observer(({ currentRetreat, trackedEntity, store }) => {
    const currentRetreats = store.metadata.currentRetreats;

    return (
        <div className="active-applications">
            {currentRetreats.filter(r => r.code !== currentRetreat.code)
                .filter(r => trackedEntity.expressionOfInterests[r.code])
                .map(r => {
                    return (
                        <Tooltip content={r.name} key={r.code}>
                            <div className="active-application">
                                <div className="active-application-retreat">
                                    {r.retreatCode || "UNKW"}
                                </div>
                                <div className={`active-application-state active-application-state-${trackedEntity.expressionOfInterests[r.code].state}`}>
                                    {trackedEntity.expressionOfInterests[r.code].state}
                                </div>
                            </div>
                        </Tooltip>
                    );
                })}
        </div>
    )
});

export default ActiveApplicationIndicator;