import { useDataEngine } from "@dhis2/app-runtime";
import { useState, useCallback, useEffect } from "react";
import { DHIS2_ACTIVE_RETREATS_SQL_VIEW, DHIS2_RETREAT_CODE, DHIS2_RETREAT_DATE_ATTRIBUTE, DHIS2_RETREAT_DISABLED_ATTRIBUTE, DHIS2_RETREAT_LOCATION_ATTRIBUTE, DHIS2_RETREAT_NO_OF_DAYS_ATTRIBUTE, DHIS2_RETREAT_TOTAL_YOGIS_ATTRIBUTE, DHIS2_RETREAT_TYPE_ATTRIBUTE } from "../dhis2";

const retreatsQuery = {
    retreats: {
        resource: `sqlViews/${DHIS2_ACTIVE_RETREATS_SQL_VIEW}/data.json`,
        params: {
            skipPaging: true,
        },
    },
};

const getEndDate = (startDate, noOfDays) => {
    let endDate = new Date(startDate.getTime() + noOfDays * 24 * 60 * 60 * 1000);
    return endDate;
};

const transformRetreats = (data) => {
    let retreats = data?.retreats?.listGrid?.rows?.map(row => {
        let attributeIdToValueMap = JSON.parse(row[3]);
        let date = new Date(attributeIdToValueMap[DHIS2_RETREAT_DATE_ATTRIBUTE]);
        let noOfDays = attributeIdToValueMap[DHIS2_RETREAT_NO_OF_DAYS_ATTRIBUTE];
        let endDate = getEndDate(date, noOfDays);
        return {
            id: row[0],
            name: row[1],
            code: row[2],
            retreatCode: attributeIdToValueMap[DHIS2_RETREAT_CODE],
            date,
            endDate,
            disabled:
                attributeIdToValueMap[DHIS2_RETREAT_DISABLED_ATTRIBUTE] === "true",
            location: attributeIdToValueMap[DHIS2_RETREAT_LOCATION_ATTRIBUTE],
            totalYogis: attributeIdToValueMap[DHIS2_RETREAT_TOTAL_YOGIS_ATTRIBUTE],
            retreatType: attributeIdToValueMap[DHIS2_RETREAT_TYPE_ATTRIBUTE],
            noOfDays: attributeIdToValueMap[DHIS2_RETREAT_NO_OF_DAYS_ATTRIBUTE],
        };
    });

    retreats.sort((a, b) => a.date - b.date);

    return retreats;
};

let cachedRetreats = undefined;

const useCachedRetreats = () => {
    const [data, setData] = useState(cachedRetreats);
    const [loading, setLoading] = useState(!data);
    const [error, setError] = useState(null);

    const engine = useDataEngine();

    const refetch = useCallback(async () => {
        setLoading(true);
        try {
            const response = await engine.query(retreatsQuery);
            cachedRetreats = transformRetreats(response);
            setData(cachedRetreats);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!cachedRetreats) {
            refetch();
        }
    }, [refetch]);

    return {
        data, loading, error, refetch
    };
};

export const useCachedRetreat = (retreatId) => {
    const { error, loading, data, refetch } = useCachedRetreats();
    const [retreat, setRetreat] = useState();
    const [retreatError, setRetreatError] = useState(error);

    useEffect(() => {
        if (data) {
            let retreatFound = data.find(el => el.id === retreatId);
            if (retreatFound) {
                setRetreat(retreatFound)
            } else {
                setRetreatError("Not Found");
            }
        }
    }, [data, retreatId])


    return {
        retreat, loading, error: retreatError || error, refetch
    };
};

export default useCachedRetreats;

