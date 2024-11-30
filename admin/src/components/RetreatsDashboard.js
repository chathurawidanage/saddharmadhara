import { Button, Tag, DropdownButton, Switch, FlyoutMenu, MenuItem } from "@dhis2/ui";
import "bootstrap/dist/css/bootstrap.min.css";
import { observer } from "mobx-react";
import React, { useState } from "react";
import {Card, Col, Container, Row} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import RetreatLocation from "./RetreatLocation";
import RetreatModel from "./RetreatModal";

const styles = {
  headerRow: {
    textAlign: "right",
    marginTop: 5,
    marginBottom: 5,
  },
  manageButton: {
    textAlign: "right",
  },
  tags: {
    display: "flex",
    columnGap: 5,
  },
  retreatCard: {
    marginBottom: 10,
  },
  retreatTitle: {
    marginBottom: 5,
  },
  olderRetreats: {
    marginTop: 20
  }
};

const Retreat = ({ retreat }) => {
  const navigate = useNavigate();

  return (
    <Col md={3}>
      <Card style={styles.retreatCard}>
        <Card.Body>
          <Card.Title>
            <Row>
              <Col style={styles.retreatTitle}>{retreat.name}</Col>
            </Row>
            <Row>
              <Col style={styles.tags}>
                {retreat.finalized ? <Tag positive bold>Finalized</Tag> : null}
                <Tag positive={!retreat.disabled} negative={retreat.disabled}>
                  {retreat.disabled ? "Disabled" : "Active"}
                </Tag>
                <Tag>{retreat.retreatType?.toUpperCase()}</Tag>
                <Tag neutral>{retreat.retreatCode}</Tag>
              </Col>
            </Row>
          </Card.Title>
          <Row>
            <Col xs={2}>📅</Col>
            <Col>
              {retreat.date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}{" "}
              -{" "}
              {retreat.endDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Col>
          </Row>
          <Row>
            <Col xs={2}>⛺</Col>
            <Col>{retreat.noOfDays} Days</Col>
          </Row>
          <Row>
            <Col xs={2}>📍</Col>
            <Col>
              <RetreatLocation locationId={retreat.location} />
            </Col>
          </Row>
          <Row>
            <Col xs={2}>🧘‍♂️</Col>
            <Col>{retreat.totalYogis}</Col>
          </Row>
          <Row>
            <Col style={styles.manageButton}>
              <Button
                variant="primary"
                onClick={() => {
                  navigate(retreat.id);
                }}
              >
                Manage
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Col>
  );
};

const RetreatsDashboard = observer(({ store }) => {
  const [hideRetreatModel, setHideRetreatModel] = useState(true);

  return (
    <Container>
      <div style={styles.headerRow}>
        <Row>
          <Col>
            <Button
              primary={true}
              onClick={() => {
                setHideRetreatModel(false);
              }}
            >
              Create Retreat
            </Button>
            {!hideRetreatModel && (
              <RetreatModel
                store={store}
                onCancel={() => {
                  setHideRetreatModel(true);
                }}
              />
            )}
          </Col>
        </Row>
      </div>
      <Row>
        <Col>
          <h3>Current Retreats</h3>
        </Col>
      </Row>
      {store.metadata.currentRetreats.length === 0 && (
        <Row>
          <Col>
            <p>There are no current retreats</p>
          </Col>
        </Row>
      )}
      <Row>
        {store.metadata.currentRetreats.map((retreat) => {
          return <Retreat retreat={retreat} key={retreat.id} />;
        })}
      </Row>
      <Row style={styles.olderRetreats}>
        <Col>
          <h3>Old Retreats</h3>
        </Col>
      </Row>
      <Row>
        {store.metadata.retreats.filter(retreat => !retreat.current).map((retreat) => {
          return <Retreat retreat={retreat} key={retreat.id} />;
        })}
      </Row>
    </Container>
  );
});

export default RetreatsDashboard;
