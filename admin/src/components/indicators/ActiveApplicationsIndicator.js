import {
    Tooltip
} from "@dhis2/ui";
import { observer } from "mobx-react";
import "./ApplicationIndicator.css";

const ActiveApplicationIndicator = observer(({ currentRetreat, trackedEntity, store }) => {
    const currentRetreats = store.metadata.currentRetreats;

    return (
        <div className="yogi-applications">
            {currentRetreats.filter(r => r.code !== currentRetreat.code)
                .filter(r => trackedEntity.expressionOfInterests[r.code])
                .map(r => {
                    return (
                        <Tooltip content={r.name} key={r.code}>
                            <div className="yogi-application">
                                <div className="yogi-application-retreat">
                                    {r.retreatCode || "UNKW"}
                                </div>
                                <div className={`yogi-application-state active-application-state-${trackedEntity.expressionOfInterests[r.code].state}`}>
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