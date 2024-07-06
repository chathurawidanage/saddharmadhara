import {
  Button,
  IconArrowLeft16,
  Tag
} from "@dhis2/ui";
import { observer } from "mobx-react";
import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import RetreatLocation from "./RetreatLocation";
import "./RetreatManager.css";
import YogisList from "./manager/YogiList";

const styles = {
  container: {
    marginTop: 5,
  },
  backButton: {
    marginBottom: 10,
  },
};


const RetreatManager = observer(({ store }) => {
  const params = useParams();
  const navigate = useNavigate();

  const retreat = store.metadata.retreatsMapWithIdKey[params.retreatId];

  return (
    <Container style={styles.container}>
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
            <Col>
              <Tag neutral>{retreat.retreatCode}</Tag>
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
            store={store}
          />
        </div>
      </div>
    </Container>
  );
});

export default RetreatManager;
