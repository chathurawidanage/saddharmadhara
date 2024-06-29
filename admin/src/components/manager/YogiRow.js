import { DataQuery, useConfig } from "@dhis2/app-runtime";
import {
    Button
} from "@dhis2/ui";
import { DHIS2_TEI_ATTRIBUTE_FULL_NAME, DHIS2_TEI_ATTRIBUTE_GENDER, DHIS2_TEI_ATTRIBUTE_HAS_KIDS, DHIS2_TEI_ATTRIBUTE_HAS_KIDS_COMMENT, DHIS2_TEI_ATTRIBUTE_MOBILE } from "../../dhis2";
import { HasKids } from "../indicators/BooleanWithComment";
import Gender from "../indicators/Gender";

const styles = {
    actionButton: {
        marginRight: 2,
    },
    indicators: {
        display: "flex",
        columnGap: 2
    }
}

const YogiRow = ({ trackedEntity, dateApplied, actions }) => {
    const { baseUrl } = useConfig();
    const query = {
        trackedEntity: {
            resource: `tracker/trackedEntities/${trackedEntity}`,
            params: {
                inactive: false,
                fields: "attributes[attribute,value]",
            },
        },
    };
    return (
        <DataQuery query={query}>
            {({ error, loading, data }) => {
                if (error) return <span>ERROR</span>;
                if (loading) return <CircularLoader extrasmall />;

                let attributeIdToValueMap = {};
                data.trackedEntity.attributes.forEach((attribute) => {
                    attributeIdToValueMap[attribute.attribute] = attribute.value;
                });

                return (
                    <tr>
                        <td>{attributeIdToValueMap[DHIS2_TEI_ATTRIBUTE_FULL_NAME]}</td>
                        <td style={styles.indicators}>
                            <Gender gender={attributeIdToValueMap[DHIS2_TEI_ATTRIBUTE_GENDER]} />
                            <HasKids hasKids={attributeIdToValueMap[DHIS2_TEI_ATTRIBUTE_HAS_KIDS]}
                                comment={attributeIdToValueMap[DHIS2_TEI_ATTRIBUTE_HAS_KIDS_COMMENT]} />
                        </td>
                        <td>{attributeIdToValueMap[DHIS2_TEI_ATTRIBUTE_MOBILE]}</td>
                        <td>
                            {dateApplied.toDateString()} {dateApplied.toLocaleTimeString()}
                        </td>
                        <td>
                            <Button
                                small
                                onClick={() => {
                                    //TODO: change ou
                                    let tempElement = document.createElement("a");
                                    tempElement.href = baseUrl;
                                    window.open(
                                        new URL(
                                            `dhis-web-tracker-capture/index.html#/dashboard?tei=${props.trackedEntity}&program=${DHIS_PROGRAM}&ou=GRcUwrSIcZv`,
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
