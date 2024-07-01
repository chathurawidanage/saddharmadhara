import { DataQuery, useConfig } from "@dhis2/app-runtime";
import {
    Button,
    CircularLoader
} from "@dhis2/ui";
import { DHIS2_TEI_ATTRIBUTE_FULL_NAME, DHIS2_TEI_ATTRIBUTE_GENDER, DHIS2_TEI_ATTRIBUTE_HAS_KIDS, DHIS2_TEI_ATTRIBUTE_HAS_KIDS_COMMENT, DHIS2_TEI_ATTRIBUTE_HAS_PERMISSION, DHIS2_TEI_ATTRIBUTE_HAS_PERMISSION_COMMENT, DHIS2_TEI_ATTRIBUTE_HAS_STRESS, DHIS2_TEI_ATTRIBUTE_HAS_STRESS_COMMENT, DHIS2_TEI_ATTRIBUTE_HAS_UNATTENDED_DEFORMITIES, DHIS2_TEI_ATTRIBUTE_HAS_UNATTENDED_DEFORMITIES_COMMENT, DHIS2_TEI_ATTRIBUTE_MOBILE, DHIS_PROGRAM } from "../../dhis2";
import { HasKidsIndicator, HasPermission, HasStress, HasUnattendedDeformities } from "../indicators/BooleanWithCommentIndicator";
import GenderIndicator from "../indicators/GenderIndicator";
import ActiveApplicationIndicator from "../indicators/ActiveApplicationsIndicator";

const styles = {
    actionButton: {
        marginRight: 2,
    },
    indicators: {
        display: "flex",
        columnGap: 2,
        rowGap: 2,
        flexDirection: "column"
    },
    miniIndicators: {
        display: "flex",
        columnGap: 2,
        rowGap: 2,
        flexDirection: "row"
    }
}

const YogiRow = ({ trackedEntity, dateApplied, currentRetreat, actions }) => {
    const { baseUrl } = useConfig();
    const query = {
        trackedEntity: {
            resource: `tracker/trackedEntities/${trackedEntity}`,
            params: {
                inactive: false,
                fields: "attributes[attribute,value],enrollments[events[programStage,dataValues[dataElement,value]]]",
                program: DHIS_PROGRAM
            },
        },
    };

    return (
        <DataQuery query={query}>
            {({ error, loading, data }) => {
                if (error) return <span>ERROR</span>;
                if (loading) return <tr><td><CircularLoader extrasmall /></td></tr>;

                let attributeIdToValueMap = {};
                data.trackedEntity.attributes.forEach((attribute) => {
                    attributeIdToValueMap[attribute.attribute] = attribute.value;
                });

                return (
                    <tr>
                        <td>{attributeIdToValueMap[DHIS2_TEI_ATTRIBUTE_FULL_NAME]}</td>
                        <td style={styles.indicators}>
                            <div style={styles.miniIndicators}>
                                <GenderIndicator gender={attributeIdToValueMap[DHIS2_TEI_ATTRIBUTE_GENDER]} />
                                <HasKidsIndicator hasKids={attributeIdToValueMap[DHIS2_TEI_ATTRIBUTE_HAS_KIDS]}
                                    comment={attributeIdToValueMap[DHIS2_TEI_ATTRIBUTE_HAS_KIDS_COMMENT]} />
                                <HasPermission hasPermission={attributeIdToValueMap[DHIS2_TEI_ATTRIBUTE_HAS_PERMISSION]}
                                    comment={attributeIdToValueMap[DHIS2_TEI_ATTRIBUTE_HAS_PERMISSION_COMMENT]} />
                                <HasUnattendedDeformities hasUnattendedDeformities={attributeIdToValueMap[DHIS2_TEI_ATTRIBUTE_HAS_UNATTENDED_DEFORMITIES]}
                                    comment={attributeIdToValueMap[DHIS2_TEI_ATTRIBUTE_HAS_UNATTENDED_DEFORMITIES_COMMENT]} />
                                <HasStress hasStress={attributeIdToValueMap[DHIS2_TEI_ATTRIBUTE_HAS_STRESS]}
                                    comment={attributeIdToValueMap[DHIS2_TEI_ATTRIBUTE_HAS_STRESS_COMMENT]} />
                            </div>
                            <div>
                                <ActiveApplicationIndicator currentRetreat={currentRetreat} enrollments={data.trackedEntity.enrollments} />
                            </div>
                        </td>
                        <td>{attributeIdToValueMap[DHIS2_TEI_ATTRIBUTE_MOBILE]}</td>
                        <td>
                            <Button
                                small
                                onClick={() => {
                                    //TODO: change ou
                                    let tempElement = document.createElement("a");
                                    tempElement.href = baseUrl;
                                    window.open(
                                        new URL(
                                            `dhis-web-tracker-capture/index.html#/dashboard?tei=${trackedEntity}&program=${DHIS_PROGRAM}&ou=GRcUwrSIcZv`,
                                            tempElement.href
                                        ),
                                        "_blank"
                                    );
                                }}
                                style={styles.actionButton}
                            >
                                View Profile
                            </Button>
                            {actions}
                        </td>
                    </tr>
                );
            }}
        </DataQuery>
    );
};

export default YogiRow;
