import { Tag } from "@dhis2/ui";
import { observer } from "mobx-react";
import React from "react";
import {
  FaGlobe,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaSlidersH,
  FaHourglassHalf,
} from "react-icons/fa";
import RetreatLocation from "../RetreatLocation";
import { Retreat } from "../../types/domain";
import { useStore } from "../../stores/StoreProvider";
import {
  DISCRETIONARY_QUOTA_PERCENTAGE,
  DISCRETIONARY_QUOTA_MAX_CAP,
} from "../../utils/yogiUtils";

interface RetreatDetailsProps {
  retreat: Retreat;
}

const RetreatDetails = observer(({ retreat }: RetreatDetailsProps) => {
  const store = useStore();
  const discretionaryInfo = store.yogis?.getDiscretionaryQuota(retreat.code);

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
        <FaGlobe className="retreat-detail-icon globe" />
        <span>{retreat.medium || "Sinhala"}</span>
      </div>
      <div className="retreat-detail-item">
        <FaCalendarAlt className="retreat-detail-icon calendar" />
        <span>{retreat.date.toDateString()}</span>
      </div>
      <div className="retreat-detail-item">
        <FaClock className="retreat-detail-icon clock" />
        <span>{retreat.noOfDays} Days</span>
      </div>
      <div className="retreat-detail-item">
        <FaMapMarkerAlt className="retreat-detail-icon location" />
        <RetreatLocation locationId={retreat.location} />
      </div>
      <div className="retreat-detail-item">
        <FaUsers className="retreat-detail-icon users" />
        <span>{retreat.totalYogis} Yogis</span>
      </div>
      {discretionaryInfo && (
        <div
          className="discretionary-quota-pill"
          title={`Dynamic wildcard quota based on ${Math.round(DISCRETIONARY_QUOTA_PERCENTAGE * 100)}% of active Pending/Selected yogis across retreat (max ${DISCRETIONARY_QUOTA_MAX_CAP})`}
        >
          <FaSlidersH className="discretionary-pill-icon" />
          <span className="discretionary-pill-label">Selector's Discretions</span>
          <span className="discretionary-pill-value">
            {discretionaryInfo.usedSlots}/{discretionaryInfo.maxSlots}
          </span>
        </div>
      )}
      {retreat.confirmationDeadline && !isRetreatDatePassed ? (
        <div className={`confirmation-deadline-pill retreat-details-deadline-wrapper ${isDeadlineExpired ? "expired" : ""}`}>
          <FaHourglassHalf className="deadline-pill-icon" />
          <span className="deadline-pill-label">Confirmation Deadline</span>
          <span className="deadline-pill-value">{formattedDeadline}</span>
        </div>
      ) : null}
    </div>
  );
});

export default RetreatDetails;
