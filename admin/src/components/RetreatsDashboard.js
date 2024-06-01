import React, { useState } from "react";
import { DataQuery } from "@dhis2/app-runtime";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, CircularLoader, Tag } from "@dhis2/ui";
import { Container, Card, Row, Col } from "react-bootstrap";
import RetreatModel from "./RetreatModal";
import { DHIS_RETREATS_OPTION_SET_ID, mapRetreatFromD2 } from "../dhis2";
import { useNavigate } from "react-router-dom";

const styles = {
  headerRow: {
    textAlign: "right",
    marginTop: 5,
    marginBottom: 5,
  },
  manageButton: {
    textAlign: "right",
  },
};

const query = {
  retreats: {
    resource: `optionSets/${DHIS_RETREATS_OPTION_SET_ID}.json`,
    params: {
      fields: "options[id,name,code,attributeValues]",
    },
  },
};

const Retreat = (props) => {
  const retreat = mapRetreatFromD2(props.retreat);
  const navigate = useNavigate();
  return (
    <Col md={3}>
      <Card>
        <Card.Body>
          <Card.Title>
            {retreat.name}
            <Tag positive={!retreat.disabled} negative={retreat.disabled}>
              {retreat.disabled ? "Disabled" : "Active"}
            </Tag>
          </Card.Title>
          <Row>
            <Col xs={2}>📅</Col>
            <Col>{retreat.date.toDateString()}</Col>
          </Row>
          <Row>
            <Col xs={2}>📍</Col>
            <Col>{retreat.location}</Col>
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

const RetreatsDashboard = () => {
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
                onCancel={() => {
                  setHideRetreatModel(true);
                }}
              />
            )}
          </Col>
        </Row>
      </div>
      <DataQuery query={query}>
        {({ error, loading, data }) => {
          if (error) return <span>ERROR</span>;
          if (loading) return <CircularLoader extrasmall />;

          return (
            <Row>
              {data.retreats.options.map((retreat) => {
                return <Retreat retreat={retreat} key={retreat.id} />;
              })}
            </Row>
          );
        }}
      </DataQuery>
    </Container>
  );
};

export default RetreatsDashboard;
