import {
  DataQuery,
  useAlert,
  useDataQuery
} from "@dhis2/app-runtime";
import {
  Button,
  CircularLoader,
  DropdownButton,
  FlyoutMenu,
  IconArrowLeft16,
  Tab,
  TabBar,
  Tag,
  Pagination
} from "@dhis2/ui";
import React, { useEffect, useState } from "react";
import { Col, Container, Row, Table } from "react-bootstrap";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import {
  DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE,
  DHIS2_RETREAT_DATA_ELEMENT,
  DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT,
  DHIS_RETREAT_SELECTION_STATE_OPTION_SET_ID,
  mapRetreatFromD2,
} from "../dhis2";
import RetreatLocation from "./RetreatLocation";
import StateChangeButton from "./manager/StateChangeButton";
import YogiRow from "./manager/YogiRow";

const styles = {
  container: {
    marginTop: 5,
  },
  backButton: {
    marginBottom: 10,
  },
};

const yogiListquery = {
  yogis: {
    lazy: true,
    resource: `tracker/events.json`,
    params: ({ retreatName }) => {
      return {
        programStage: DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE,
        filter: `${DHIS2_RETREAT_DATA_ELEMENT}:eq:${retreatName}`,
        fields: "event,trackedEntity,dataValues[dataElement,value],occurredAt",
        skipPaging: true,
      };
    },
  },
};

const YogisList = ({ retreat, selectionStates }) => {
  const { showError } = useAlert("Failed to change the state.", {
    duration: 3000,
    critical: true,
  });

  const { loading, error, data, refetch } = useDataQuery(yogiListquery);
  const [selectionState, setSelectionState] = useState(selectionStates[0]);
  const [yogisByStateMap, setYogisByStateMap] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    refetch({ retreatName: retreat.name });
  }, []);

  useEffect(()=>{
    setCurrentPage(1);
  }, [selectionState])

  useEffect(() => {
    if (data) {
      const instances = data.yogis?.instances;
      instances?.sort((a, b) => {
        return (
          new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
        );
      });

      // optional: remove duplicates. Only first interest will be considered
      let alreadyConsideredYogis = new Set();
      let yogisByStateMap = {};
      instances.forEach((yogi) => {
        if (!alreadyConsideredYogis.has(yogi.trackedEntity)) {
          alreadyConsideredYogis.add(yogi.trackedEntity);
          let selectionState = yogi.dataValues?.find(
            (el) =>
              el.dataElement === DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT
          );
          if (yogisByStateMap[selectionState?.value]) {
            yogisByStateMap[selectionState?.value].push(yogi);
          } else {
            yogisByStateMap[selectionState?.value] = [yogi];
          }
        }
      });
      setYogisByStateMap(yogisByStateMap);
    }
  }, [data]);

  const onStateChanged = (index, toStateCode) => {
    let toRemove = yogisByStateMap[selectionState.code][index];
    yogisByStateMap[selectionState.code].splice(index, 1);
    if (yogisByStateMap[toStateCode]) {
      yogisByStateMap[toStateCode].push(toRemove);
    } else {
      yogisByStateMap[toStateCode] = [toRemove];
    }
    setYogisByStateMap({ ...yogisByStateMap });
  };

  return (
    <div>
      <div>
        <TabBar>
          {selectionStates.map((state) => {
            return (
              <Tab
                key={state.code}
                selected={selectionState.code === state.code}
                onClick={() => {
                  setSelectionState(state);
                }}
              >
                {state.name} [{yogisByStateMap[state.code]?.length || "0"}]
              </Tab>
            );
          })}
        </TabBar>
      </div>
      <div>
        {loading && <CircularLoader extrasmall />}
        {error && <span>ERROR</span>}
        {data && (
          <div>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th width="40%">Name</th>
                  <th>Indicators</th>
                  <th>Phone</th>
                  <th>Date Applied</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {yogisByStateMap[selectionState.code]?.map(
                  (instance, index) => {
                    // pagination
                    if (!(index >= ((currentPage - 1) * pageSize)
                      && index < currentPage * pageSize)) {
                      return null;
                    }

                    return (
                      <YogiRow
                        trackedEntity={instance.trackedEntity}
                        dateApplied={new Date(instance.occurredAt)}
                        key={instance.trackedEntity}
                        actions={
                          <DropdownButton
                            small
                            component={
                              <FlyoutMenu>
                                {selectionStates
                                  .filter(
                                    (state) =>
                                      state.code !== selectionState.code
                                  )
                                  .map((state) => {
                                    return (
                                      <StateChangeButton
                                        key={state.code}
                                        onComplete={() => {
                                          onStateChanged(index, state.code);
                                        }}
                                        onError={showError}
                                        label={state.name}
                                        event={instance.event}
                                        selectionState={state.code}
                                        retreatCode={retreat.code}
                                      />
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
            <Pagination
              page={currentPage}
              pageCount={Math.ceil(yogisByStateMap[selectionState.code]?.length / pageSize)}
              pageSize={pageSize}
              total={yogisByStateMap[selectionState.code]?.length}
              hidePageSelect
              hidePageSizeSelect
              onPageChange={(page) => {
                setCurrentPage(page);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const RetreatManager = () => {
  const params = useParams();
  const navigate = useNavigate();

  const query = {
    retreat: {
      resource: `options/${params.retreatId}.json`,
      params: {
        fields: "id,name,code,attributeValues",
      },
    },
    selectionStates: {
      resource: `optionSets/${DHIS_RETREAT_SELECTION_STATE_OPTION_SET_ID}.json`,
      params: {
        fields: "options[code,name,style]",
      },
    },
  };

  return (
    <Container style={styles.container}>
      <DataQuery query={query}>
        {({ error, loading, data }) => {
          if (error) return <span>ERROR</span>;
          if (loading) return <CircularLoader extrasmall />;

          const retreat = mapRetreatFromD2(data.retreat);
          return (
            <div>
              <div>
                <Row>
                  <Col style={styles.backButton}>
                    <Button
                      small
                      icon={<IconArrowLeft16 />}
                      onClick={() => {
                        navigate("/");
                      }}
                    >
                      Back to Retreats List
                    </Button>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <h3>{retreat.name} </h3>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Tag>{retreat.retreatType?.toUpperCase()}</Tag>
                  </Col>
                  <Col>📅 {retreat.date.toDateString()}</Col>
                  <Col>⛺ {retreat.noOfDays} Days</Col>
                  <Col>
                    📍 <RetreatLocation locationId={retreat.location} />
                  </Col>
                  <Col>🧘‍♂️ {retreat.totalYogis}</Col>
                </Row>
              </div>
              <div>
                <YogisList
                  retreat={retreat}
                  selectionStates={data.selectionStates?.options}
                />
              </div>
            </div>
          );
        }}
      </DataQuery>
    </Container>
  );
};

export default RetreatManager;
