import React, { useState, useEffect } from "react";
import { Col, Container, Row, Table } from "react-bootstrap";
import { useParams } from "react-router";
import {
  DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE,
  DHIS2_RETREAT_DATA_ELEMENT,
  DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT,
  DHIS2_TEI_ATTRIBUTE_FULL_NAME,
  DHIS2_TEI_ATTRIBUTE_GENDER,
  DHIS2_TEI_ATTRIBUTE_MOBILE,
  DHIS_PROGRAM,
  DHIS_RETREAT_SELECTION_STATE_OPTION_SET_ID,
  mapRetreatFromD2,
} from "../dhis2";
import {
  DataQuery,
  useAlert,
  useConfig,
  useDataMutation,
  useDataQuery,
} from "@dhis2/app-runtime";
import {
  Button,
  CircularLoader,
  Tag,
  DropdownButton,
  TabBar,
  Tab,
  FlyoutMenu,
  MenuItem,
} from "@dhis2/ui";

const styles = {
  container: {
    marginTop: 5,
  },
  actionButton: {
    marginRight: 2,
  },
};

const YogiRow = (props) => {
  const { baseUrl } = useConfig();
  const query = {
    trackedEntity: {
      resource: `tracker/trackedEntities/${props.trackedEntity}`,
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

        let dateApplied = new Date(props.dateApplied);

        return (
          <tr>
            <td>{attributeIdToValueMap[DHIS2_TEI_ATTRIBUTE_FULL_NAME]}</td>
            <td>{attributeIdToValueMap[DHIS2_TEI_ATTRIBUTE_GENDER]}</td>
            <td>{attributeIdToValueMap[DHIS2_TEI_ATTRIBUTE_MOBILE]}</td>
            <td>
              {dateApplied.toDateString()} {dateApplied.toLocaleTimeString()}
            </td>
            <td>
              <Button
                small
                onClick={() => {
                  //TODO: change ou
                  window.open(
                    new URL(
                      `dhis-web-tracker-capture/index.html#/dashboard?tei=${props.trackedEntity}&program=${DHIS_PROGRAM}&ou=GRcUwrSIcZv`,
                      baseUrl
                    ),
                    "_blank"
                  );
                }}
                style={styles.actionButton}
              >
                View Profile
              </Button>
              {props.actions}
            </td>
          </tr>
        );
      }}
    </DataQuery>
  );
};

const StateChangeButton = ({
  label,
  event,
  selectionState,
  retreatCode,
  onComplete,
  onError,
}) => {
  const mutation = {
    resource: "events",
    id: event,
    data: {
      program: DHIS_PROGRAM,
      programStage: DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE,
      status: "COMPLETED",
      dataValues: [
        {
          dataElement: DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT,
          value: selectionState,
        },
        {
          dataElement: DHIS2_RETREAT_DATA_ELEMENT,
          value: retreatCode,
        },
      ],
    },
    type: "update",
  };
  const [mutate, { called, loading, error, data }] = useDataMutation(mutation, {
    onComplete,
    onError,
  });

  return <MenuItem onClick={mutate} label={label} />;
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

  useEffect(() => {
    refetch({ retreatName: retreat.name });
  }, []);

  useEffect(() => {
    if (data) {
      const instances = data.yogis?.instances;
      instances?.sort((a, b) => {
        return (
          new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
        );
      });

      // optional: remove duplicates. Only first interest will be considered
      // TODO: Ideally this should be prevented when applying
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
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Phone</th>
                  <th>Date Applied</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {yogisByStateMap[selectionState.code]?.map(
                  (instance, index) => {
                    return (
                      <YogiRow
                        trackedEntity={instance.trackedEntity}
                        dateApplied={instance.occurredAt}
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
          </div>
        )}
      </div>
    </div>
  );
};

const RetreatManager = () => {
  const params = useParams();

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
                  <Col>
                    <h3>{retreat.name}</h3>
                  </Col>
                </Row>
                <Row>
                  <Col>📅 {retreat.date.toDateString()}</Col>
                  <Col>📍 {retreat.location}</Col>
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
