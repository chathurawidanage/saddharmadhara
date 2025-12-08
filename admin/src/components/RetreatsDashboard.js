import { Button, Tag } from "@dhis2/ui";
import "bootstrap/dist/css/bootstrap.min.css";
import { observer } from "mobx-react";
import { useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import RetreatLocation from "./RetreatLocation";
import RetreatModel from "./RetreatModal";

const styles = {
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  sectionTitle: {
    marginBottom: 15,
    marginTop: 30,
    fontWeight: "600",
    color: "#495057",
  },
  retreatCard: {
    marginBottom: 20,
    border: "none",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    borderRadius: "10px",
    transition: "transform 0.2s",
  },
  retreatCardBody: {
    padding: "20px",
  },
  retreatTitle: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: {
    marginRight: "8px",
    fontSize: "1.1rem",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "8px",
    color: "#6c757d",
  },
  manageButtonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "15px",
  },
  statCard: {
    border: "none",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    borderRadius: "10px",
    marginBottom: 20,
    backgroundColor: "#ffffff",
  },
  statTitle: {
    fontSize: "0.9rem",
    color: "#6c757d",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "5px",
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#212529",
  },
};

const Retreat = ({ retreat }) => {
  const navigate = useNavigate();

  const plusDateTo = new Date(retreat.endDate);
  plusDateTo.setDate(plusDateTo.getDate() + 1);

  return (
    <Col md={4} lg={3}>
      <Card style={styles.retreatCard} className="h-100">
        <Card.Body style={styles.retreatCardBody}>
          <div style={styles.retreatTitle}>
            <span>{retreat.name}</span>
            <Tag neutral>{retreat.retreatCode}</Tag>
          </div>

          <div className="mb-3">
            {retreat.finalized && <Tag positive bold className="mr-1">Finalized</Tag>}
            <Tag positive={!retreat.disabled} negative={retreat.disabled}>
              {retreat.disabled ? "Disabled" : "Active"}
            </Tag>
            <Tag>{retreat.retreatType?.toUpperCase()}</Tag>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.icon}>📅</span>
            <span>
              {retreat.date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}{" "}
              -{" "}
              {plusDateTo.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.icon}>⛺</span>
            <span>{retreat.noOfDays} Days</span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.icon}>📍</span>
            <span><RetreatLocation locationId={retreat.location} /></span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.icon}>🧘‍♂️</span>
            <span>{retreat.totalYogis} Yogis</span>
          </div>

          <div style={styles.manageButtonContainer}>
            <Button
              primary
              onClick={() => {
                navigate(retreat.id);
              }}
            >
              Manage
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
};

const RetreatsDashboard = observer(({ store }) => {
  const [hideRetreatModel, setHideRetreatModel] = useState(true);

  return (
    <Container fluid className="p-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div style={styles.headerRow}>
        <h2 className="m-0">Dashboard</h2>
        <div>
          <Button
            primary
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
        </div>
      </div>

      <Row className="mb-4">
        <Col md={3}>
          <Card style={styles.statCard}>
            <Card.Body>
              <div style={styles.statTitle}>SMS Credits</div>
              <div style={styles.statValue}>
                {store.metadata.smsCredits ? store.metadata.smsCredits.balance : "Loading..."}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card style={styles.statCard}>
            <Card.Body>
              <div style={styles.statTitle}>Active Retreats</div>
              <div style={styles.statValue}>{store.metadata.currentRetreats.length}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h5 style={styles.sectionTitle}>Current Retreats</h5>
      {store.metadata.currentRetreats.length === 0 && (
        <p className="text-muted">There are no current retreats</p>
      )}
      <Row>
        {store.metadata.currentRetreats.map((retreat) => {
          return <Retreat retreat={retreat} key={retreat.id} />;
        })}
      </Row>

      <h5 style={styles.sectionTitle}>Past Retreats</h5>
      <Row>
        {store.metadata.retreats.filter(retreat => !retreat.current).map((retreat) => {
          return <Retreat retreat={retreat} key={retreat.id} />;
        })}
      </Row>
    </Container>
  );
});

export default RetreatsDashboard;
