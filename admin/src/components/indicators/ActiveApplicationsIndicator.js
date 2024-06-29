import { DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE, DHIS2_RETREAT_DATA_ELEMENT, DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT } from "../../dhis2";
import useCachedRetreats from "../useCachedRetreats";
import {
    CircularLoader
} from "@dhis2/ui";
import "./ActiveApplicationIndicator.css";

const ActiveApplicationIndicator = ({ currentRetreat, enrollments }) => {
    const { error, loading, data: activeRetreats, refetch } = useCachedRetreats();

    if (error) return <span>ERROR</span>;
    if (loading) return <CircularLoader extrasmall />;

    let allYogiApplications = {};

    if (enrollments?.length > 0) {
        enrollments[0].events.filter(ev => ev.programStage === DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE).forEach(ev => {
            let dataValuesMap = {}
            ev.dataValues?.forEach(de => {
                dataValuesMap[de.dataElement] = de.value;
            });

            if (dataValuesMap[DHIS2_RETREAT_DATA_ELEMENT]
                && dataValuesMap[DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT]) {
                allYogiApplications[dataValuesMap[DHIS2_RETREAT_DATA_ELEMENT]] = dataValuesMap[DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT];
            }
        });
    }
    console.log("C", currentRetreat, "E", enrollments, "A", allYogiApplications);

    return (
        <div className="active-applications">
            {activeRetreats.filter(r => r.code !== currentRetreat.code)
                .filter(r => allYogiApplications[r.code])
                .map(r => {
                    return (
                        <div className="active-application" key={r.code}>
                            <div className="active-application-retreat">
                                {r.name}
                            </div>
                            <div className={`active-application-state active-application-state-${allYogiApplications[r.code]}`}>
                                {allYogiApplications[r.code]}
                            </div>
                        </div>
                    );
                })}
        </div>
    )
}

export default ActiveApplicationIndicator;