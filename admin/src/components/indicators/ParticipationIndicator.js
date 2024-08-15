import {
    Tooltip
} from "@dhis2/ui";
import { observer } from "mobx-react";
import "./ApplicationIndicator.css";

const ParticipationIndicator = observer(({ trackedEntity, store }) => {

    return (
        <div className="yogi-applications">
            {Object.keys(trackedEntity.participation)
                .map(retreatId => {
                    let retreat = store.metadata.retreatsMapWithCodeKey[retreatId];
                    let p = trackedEntity.participation[retreatId];
                    return (
                        <Tooltip content={retreat.name} key={retreat.code}>
                            <div className="yogi-application">
                                <div className="yogi-application-retreat">
                                    {retreat.retreatCode || "UNKW"}
                                </div>
                                <div className={`yogi-application-state participation-state-${p.attendance}`}>
                                    {p.attendance}
                                </div>
                            </div>
                        </Tooltip>
                    );
                })}
        </div>
    )
});

export default ParticipationIndicator;