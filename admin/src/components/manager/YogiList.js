import {
    useAlert,
    useDataQuery
} from "@dhis2/app-runtime";
import {
    Checkbox,
    DropdownButton,
    FlyoutMenu,
    LinearLoader,
    MenuItem,
    Pagination,
    Tab,
    TabBar
} from "@dhis2/ui";
import { computed } from "mobx";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import {
    DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE,
    DHIS2_RETREAT_DATA_ELEMENT,
    DHIS2_TEI_ATTRIBUTE_FULL_NAME,
    DHIS2_TEI_ATTRIBUTE_GENDER,
    DHIS2_TEI_ATTRIBUTE_MARITAL_STATE
} from "../../dhis2";
import GenderIndicator from "../indicators/GenderIndicator";
import ReverendIndicator from "../indicators/ReverendIndicator";
import "./YogiList.css";
import YogiRow from "./YogiRow";

const styles = {
    filtersMenu: {
        marginTop: 20
    }
}

const yogiListquery = {
    yogis: {
        lazy: true,
        resource: `tracker/events.json`,
        params: ({ retreatName }) => {
            return {
                programStage: DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE,
                filter: `${DHIS2_RETREAT_DATA_ELEMENT}:eq:${retreatName}`,
                fields: "trackedEntity",
                skipPaging: true,
            };
        },
    }
};

const getYogiSortScore = (yogiObj) => {
    // reverands comes first
    let score = 0;
    if (yogiObj.attributes[DHIS2_TEI_ATTRIBUTE_MARITAL_STATE] === 'reverend') {
        score += Math.pow(10, 5);
    }
    return score;
};

const YogisList = observer(({ retreat, store }) => {
    const { loading, error, data, refetch } = useDataQuery(yogiListquery);

    const [selectionState, setSelectionState] = useState(store.metadata.selectionStates[0].code);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [yogiList, setYogiList] = useState([]);
    const [yogisFetched, setYogisFetched] = useState(false);

    const [loadProgress, setLoadProgress] = useState(0);

    const [filters, setFilters] = useState({
        male: true,
        female: true,
        reverend: true
    });

    const countByState = computed(() => {
        let stateMap = {};
        yogiList.forEach(yogi => {
            let state = yogi.expressionOfInterests[retreat.code]?.state;
            if (!stateMap[state]) {
                stateMap[state] = 0;
            }
            stateMap[state]++;
        });
        return stateMap;
    }).get();

    useEffect(() => {
        refetch({ retreatName: retreat.name });
    }, [retreat]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectionState, filters]);

    useEffect(() => {
        if (data) {
            setYogisFetched(false);
            // optional: remove duplicates. Only first interest will be considered
            const yogiIdList = [...new Set(data.yogis?.instances.map(i => i.trackedEntity))];

            let completion = 0;

            let yogiFetchPromoises = yogiIdList.map((yogiId) => {
                return store.yogis.fetchYogi(yogiId)
                    .then(() => {
                        completion++;
                        setLoadProgress(completion * 100 / yogiIdList.length)
                    });
            });

            Promise.all(yogiFetchPromoises).then(() => {

                let yogiList = yogiIdList.map(yogiId => store.yogis.yogiIdToObjectMap[yogiId]);

                // sort by criterias
                yogiList.sort((y1, y2) => {
                    // reverands comes first
                    let y1Score = getYogiSortScore(y1);
                    let y2Score = getYogiSortScore(y2);

                    if (y1Score === y2Score) {
                        // finally sort by applied date, lowest date comes first
                        let y1RegisteredDate = new Date(y1.expressionOfInterests[retreat.code].occurredAt);
                        let y2RegisteredDate = new Date(y2.expressionOfInterests[retreat.code].occurredAt);
                        return y1RegisteredDate.getTime() - y2RegisteredDate.getTime();
                    }

                    // higest score comes first
                    return y2Score - y1Score;
                });
                setYogiList(yogiList);
                setYogisFetched(true);
            }).catch(err => {
                console.error("Error in fetching yogis", err);
            });
        }
    }, [data]);

    const pagination = (total) => {
        return (<Pagination
            page={currentPage}
            pageCount={Math.ceil(total / pageSize)}
            pageSize={pageSize}
            total={total}
            hidePageSizeSelect
            onPageChange={(page) => {
                setCurrentPage(page);
            }}
            className="pagination"
        />);
    };

    if (error) return <span>ERROR</span>;
    if (loading || !yogisFetched) return (
        <LinearLoader width="100%" amount={loadProgress} margin="0" />
    );

    let filteredYogis = yogiList.filter(yogi => yogi.expressionOfInterests[retreat.code].state === selectionState)
        .filter(yogi => filters.male || yogi.attributes[DHIS2_TEI_ATTRIBUTE_GENDER].toLowerCase() !== "male")
        .filter(yogi => filters.female || yogi.attributes[DHIS2_TEI_ATTRIBUTE_GENDER].toLowerCase() !== "female")
        .filter(yogi => filters.reverend || yogi.attributes[DHIS2_TEI_ATTRIBUTE_MARITAL_STATE].toLowerCase() !== "reverend");

    return (
        <div>
            <div style={styles.filtersMenu}>
                <DropdownButton component={(
                    <FlyoutMenu>
                        <MenuItem label={(
                            <Checkbox label={(
                                <ReverendIndicator />
                            )} checked={filters.reverend} />
                        )} onClick={() => {
                            setFilters({ ...filters, reverend: !filters.reverend })
                        }} />
                        <MenuItem label={(
                            <Checkbox label={(
                                <GenderIndicator gender="male" />
                            )} checked={filters.male} />
                        )} onClick={() => {
                            setFilters({ ...filters, male: !filters.male })
                        }} />
                        <MenuItem label={(
                            <Checkbox label={(
                                <GenderIndicator gender="female" />
                            )} checked={filters.female} />
                        )} onClick={() => {
                            setFilters({ ...filters, female: !filters.female })
                        }} />
                    </FlyoutMenu>
                )}>
                    Filters
                </DropdownButton>
            </div>
            <div>
                <TabBar>
                    {store.metadata.selectionStates.map((state) => {
                        return (
                            <Tab
                                key={state.code}
                                selected={selectionState === state.code}
                                onClick={() => {
                                    setSelectionState(state.code);
                                }}
                            >
                                {state.name} [{countByState[state.code] || "0"}]
                            </Tab>
                        );
                    })}
                </TabBar>
            </div>
            <div>
                {data && (
                    <div>
                        {pagination(filteredYogis.length)}
                        <Table bordered hover className="yogi-table">
                            <thead>
                                <tr>
                                    <th width="40%">Name</th>
                                    <th>Indicators</th>
                                    <th>Phone</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredYogis.map(
                                    (yogi, index) => {
                                        // pagination
                                        if (!(index >= ((currentPage - 1) * pageSize)
                                            && index < currentPage * pageSize)) {
                                            return null;
                                        }

                                        return (
                                            <YogiRow
                                                trackedEntity={yogi}
                                                key={yogi.id}
                                                currentRetreat={retreat}
                                                store={store}
                                                actions={
                                                    <StateChangeButton store={store} yogi={yogi} currentState={selectionState} retreat={retreat} />
                                                }
                                            />
                                        );
                                    }
                                )}
                            </tbody>
                        </Table>
                        {pagination(filteredYogis.length)}
                    </div>
                )}
            </div>
        </div>
    );
});

const StateChangeButton = ({ currentState, yogi, retreat, store }) => {

    const { show: alertStateChangeStatus } = useAlert(({ yogiName, toState, success }) => {
        if (success) {
            return `${yogiName} moved to ${toState}`
        }
        return `Failed to move ${yogiName}`;
    }, ({ success }) => {
        return {
            success,
            critical: !success,
            duration: 2000
        }
    });

    const onStateChanged = async (toStateCode) => {
        let success = await store.yogis.changeRetreatState(yogi.id, retreat.code, toStateCode);
        alertStateChangeStatus({
            yogiName: yogi.attributes[DHIS2_TEI_ATTRIBUTE_FULL_NAME],
            toState: toStateCode,
            success
        })
    };


    return (
        <DropdownButton
            small
            component={
                <FlyoutMenu>
                    {store.metadata.selectionStates
                        .filter(
                            (state) =>
                                state.code !== currentState
                        )
                        .map((state) => {
                            return (
                                <MenuItem key={state.code} onClick={() => {
                                    onStateChanged(state.code);
                                }} label={state.name} />
                            );
                        })}
                </FlyoutMenu>
            }>
            Move to
        </DropdownButton>
    );
};

export default YogisList;