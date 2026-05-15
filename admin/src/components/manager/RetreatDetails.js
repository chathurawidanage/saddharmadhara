import { Tag } from "@dhis2/ui";
import React from "react";
import RetreatLocation from "../RetreatLocation";

const styles = {
  detailsRow: {
    display: "flex",
    flexDirection: "row",
    gap: 24,
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 24,
    padding: "16px",
    background: "#fff",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
  },
  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#404b5a",
  },
};

const RetreatDetails = ({ retreat }) => {
  return (
    <div style={styles.detailsRow}>
      <div>
        <Tag>{retreat.retreatType?.toUpperCase()}</Tag>
      </div>
      <div>
        <Tag neutral>{retreat.retreatCode}</Tag>
      </div>
      <div style={{ ...styles.detailItem, textTransform: "capitalize" }}>
        🌐 {retreat.medium || "Sinhala"}
      </div>
      <div style={styles.detailItem}>📅 {retreat.date.toDateString()}</div>
      <div style={styles.detailItem}>⛺ {retreat.noOfDays} Days</div>
      <div style={styles.detailItem}>
        📍 <RetreatLocation locationId={retreat.location} />
      </div>
      <div style={styles.detailItem}>🧘‍♂️ {retreat.totalYogis}</div>
    </div>
  );
};

export default RetreatDetails;
