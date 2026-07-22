import { IconClock16, Tag } from "@dhis2/ui";
import { observer } from "mobx-react";
import React from "react";
import RetreatLocation from "../RetreatLocation";
import { Retreat } from "../../types/domain";

interface RetreatDetailsProps {
  retreat: Retreat;
}

const RetreatDetails = observer(({ retreat }: RetreatDetailsProps) => {
  const isRetreatDatePassed = (() => {
    if (!retreat.date) return false;
    const dateStr = retreat.date.toISOString().split("T")[0];
    return new Date(`${dateStr}T23:59:59.999+05:30`).getTime() < Date.now();
  })();

  const isDeadlineExpired = (() => {
    if (!retreat.confirmationDeadline) return false;
    const dateStr = retreat.confirmationDeadline.split("T")[0];
    return new Date(`${dateStr}T23:59:59.999+05:30`).getTime() < Date.now();
  })();

  const formattedDeadline = (() => {
    if (!retreat.confirmationDeadline) return "";
    const dateStr = retreat.confirmationDeadline.split("T")[0];
    const dateObj = new Date(`${dateStr}T00:00:00`);
    if (isNaN(dateObj.getTime())) return retreat.confirmationDeadline;
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  })();

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
      {retreat.confirmationDeadline && !isRetreatDatePassed ? (
        <div className="retreat-details-deadline-wrapper">
          <Tag positive={!isDeadlineExpired} negative={isDeadlineExpired} icon={<IconClock16 />}>
            Confirmation Deadline: {formattedDeadline}
          </Tag>
        </div>
      ) : null}
    </div>
  );
});

export default RetreatDetails;
