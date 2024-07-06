import {
    useAlert,
    useDataQuery
} from "@dhis2/app-runtime";
import {
    LinearLoader,
    DropdownButton,
    FlyoutMenu,
    Pagination,
    Tab,
    TabBar,
    MenuItem
} from "@dhis2/ui";
import { computed } from "mobx";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import {
    DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE,
    DHIS2_RETREAT_DATA_ELEMENT,
    DHIS2_TEI_ATTRIBUTE_FULL_NAME,
    DHIS2_TEI_ATTRIBUTE_MARITAL_STATE
} from "../../dhis2";
import YogiRow from "./YogiRow";
import "./YogiList.css";

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
    const [yogiIdList, setYogiIdList] = useState([]);
    const [yogisFetched, setYogisFetched] = useState(false);

    const [loadProgress, setLoadProgress] = useState(0);

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

    const countByState = computed(() => {
        let stateMap = {};
        yogiIdList.forEach(yogiId => {
            let state = store.yogis.yogiIdToObjectMap[yogiId].expressionOfInterests[retreat.code]?.state;
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
    }, [selectionState])

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
                // sort by criterias
                yogiIdList.sort((y1, y2) => {
                    // reverands comes first
                    let y1Score = getYogiSortScore(store.yogis.yogiIdToObjectMap[y1]);
                    let y2Score = getYogiSortScore(store.yogis.yogiIdToObjectMap[y2]);

                    if (y1Score == y2Score) {
                        // finally sort by applied date, lowest date comes first
                        let y1RegisteredDate = new Date(store.yogis.yogiIdToObjectMap[y1].expressionOfInterests[retreat.code].occurredAt);
                        let y2RegisteredDate = new Date(store.yogis.yogiIdToObjectMap[y2].expressionOfInterests[retreat.code].occurredAt);
                        return y1RegisteredDate.getTime() - y2RegisteredDate.getTime();
                    }

                    // higest score comes first
                    return y2Score - y1Score;
                });
                setYogiIdList(yogiIdList);
                setYogisFetched(true);
            }).catch(err => {
                console.error("Error in fetching yogis", err);
            });
        }
    }, [data]);

    const onStateChanged = async (yogiId, toStateCode) => {
        let success = await store.yogis.changeRetreatState(yogiId, retreat.code, toStateCode);
        alertStateChangeStatus({
            yogiName:
                store.yogis.yogiIdToObjectMap[yogiId].attributes[DHIS2_TEI_ATTRIBUTE_FULL_NAME],
            toState: toStateCode,
            success
        })
    };

    const pagination = () => {
        return (<Pagination
            page={currentPage}
            pageCount={Math.ceil(countByState[selectionState] / pageSize)}
            pageSize={pageSize}
            total={countByState[selectionState]}
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

    return (
        <div>
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
                        {pagination()}
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
                                {yogiIdList.filter(yogiId => {
                                    return store.yogis.yogiIdToObjectMap[yogiId].expressionOfInterests[retreat.code].state === selectionState
                                }).map(
                                    (yogiId, index) => {
                                        // pagination
                                        if (!(index >= ((currentPage - 1) * pageSize)
                                            && index < currentPage * pageSize)) {
                                            return null;
                                        }

                                        return (
                                            <YogiRow
                                                trackedEntity={store.yogis.yogiIdToObjectMap[yogiId]}
                                                key={yogiId}
                                                currentRetreat={retreat}
                                                store={store}
                                                actions={
                                                    <DropdownButton
                                                        small
                                                        component={
                                                            <FlyoutMenu>
                                                                {store.metadata.selectionStates
                                                                    .filter(
                                                                        (state) =>
                                                                            state.code !== selectionState
                                                                    )
                                                                    .map((state) => {
                                                                        return (
                                                                            <MenuItem key={state.code} onClick={() => {
                                                                                onStateChanged(yogiId, state.code);
                                                                            }} label={state.name} />
                                                                        );
                                                                    })}
                                                            </FlyoutMenu>
                                                        }
                                                    >
                                                        Move to
                                                    </DropdownButton>
                                                }
                                            />
                                        );
                                    }
                                )}
                            </tbody>
                        </Table>
                        {pagination()}
                    </div>
                )}
            </div>
        </div>
    );
});

export default YogisList;