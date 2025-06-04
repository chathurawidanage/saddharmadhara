import {
    Tooltip
} from "@dhis2/ui";
import { observer } from "mobx-react";
import "./ApplicationIndicator.css";
import COMMENT from "./img/comment.png";

const ParticipationIndicator = observer(({ trackedEntity, store }) => {

    return (
        <div className="yogi-applications">
            {Object.keys(trackedEntity.participation)
                .map(retreatId => {
                    let retreat = store.metadata.retreatsMapWithCodeKey[retreatId];
                    let p = trackedEntity.participation[retreatId];
                    return (
                      <Tooltip content={<>
                        <p>
                          {retreat.name}
                        </p>
                        {p.specialComment && <p>{p.specialComment}</p>}
                      </>} key={retreat.code + p.attendance}>
                            <div className="yogi-application">
                                <div className="yogi-application-retreat">
                                    {retreat.retreatCode || "UNKW"}
                                </div>
                                <div className={`yogi-application-state participation-state-${p.attendance}`}>
                                    {p.attendance || "Pending"}
                                </div>
                              {p.specialComment &&
                                <div className="yogi-application-special-comment">
                                  <img src={COMMENT} width={15} />
                                </div>
                              }
                            </div>
                        </Tooltip>
                    );
                })}
        </div>
    )
});

export default ParticipationIndicator;