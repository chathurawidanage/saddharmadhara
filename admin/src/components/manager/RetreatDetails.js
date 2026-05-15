import { Tag } from "@dhis2/ui";
import React from "react";
import RetreatLocation from "../RetreatLocation";

const RetreatDetails = ({ retreat }) => {
  return (
    <div className="retreat-details-row">
      <div>
        <Tag>{retreat.retreatType?.toUpperCase()}</Tag>
      </div>
      <div>
        <Tag neutral>{retreat.retreatCode}</Tag>
      </div>
      <div className="retreat-detail-item capitalize">
        🌐 {retreat.medium || "Sinhala"}
      </div>
      <div className="retreat-detail-item">📅 {retreat.date.toDateString()}</div>
      <div className="retreat-detail-item">⛺ {retreat.noOfDays} Days</div>
      <div className="retreat-detail-item">
        📍 <RetreatLocation locationId={retreat.location} />
      </div>
      <div className="retreat-detail-item">🧘‍♂️ {retreat.totalYogis}</div>
    </div>
  );
};

export default RetreatDetails;
