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
import YogisList from "./manager/YogiList";
import RetreatFinaliseModal from "./RetreatFinaliseModal";
import { getFinalExcelDownloadLink } from "../dhis2";
import { useConfig } from "@dhis2/app-runtime";

const styles = {
  container: {
    marginTop: 5,
  },
  backButton: {
    marginBottom: 10,
  },
  mediumText: {
    textTransform: "capitalize"
  },
  retreatHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  retreatHeaderButtons: {
    display: "flex",
    flexDirection: "row",
    columnGap: 10
  },
  retreatHeaderTitle: {
    display: "flex",
    flexDirection: "row",
    columnGap: 10,
    alignItems: "center"
  }
};


const RetreatManager = observer(({ store }) => {
  const { baseUrl } = useConfig();
  const params = useParams();
  const navigate = useNavigate();

  const [showFinaliseModel, setShowFinaliseModel] = React.useState(false);

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
            <Col style={styles.retreatHeader}>
              <div style={styles.retreatHeaderTitle}>
                <h3 style={{ padding: 0, margin: 0 }}>{retreat.name} </h3>
                {retreat.finalized ? <Tag positive bold>Finalized</Tag> : null}
              </div>
              <div style={styles.retreatHeaderButtons}>
                <Button onClick={() => {
                  let tempElement = document.createElement("a");
                  tempElement.href = baseUrl;
                  window.open(
                    new URL(
                      getFinalExcelDownloadLink(retreat.code),
                      tempElement.href
                    ),
                    "_blank"
                  );
                }}>Download Selected</Button>
                <Button primary disabled={(Date.now() - retreat.date.getTime()) < retreat.noOfDays * 24 * 60 * 60 * 1000 || retreat.finalized} onClick={() => setShowFinaliseModel(true)}>Finalise Retreat</Button>
                {showFinaliseModel && <RetreatFinaliseModal retreat={retreat} store={store} onCancel={() => setShowFinaliseModel(false)} />}
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <Tag>{retreat.retreatType?.toUpperCase()}</Tag>
            </Col>
            <Col>
              <Tag neutral>{retreat.retreatCode}</Tag>
            </Col>
            <Col style={styles.mediumText}>
              🌐 {retreat.medium || "Sinhala"}
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
