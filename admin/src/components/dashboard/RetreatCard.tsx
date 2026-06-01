import { Button, Tag } from "@dhis2/ui";
import React from "react";
import { FiCalendar, FiClock, FiMapPin, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import RetreatLocation from "../RetreatLocation";
import { Retreat } from "../../types/domain";

interface RetreatCardProps {
  retreat: Retreat;
}

const RetreatCard = ({ retreat }: RetreatCardProps) => {
  const navigate = useNavigate();

  const plusDateTo = new Date(retreat.endDate);
  plusDateTo.setDate(plusDateTo.getDate() + 1);

  const typeClass = retreat.retreatType?.toLowerCase().includes("silent")
    ? "silent"
    : retreat.retreatType?.toLowerCase().includes("general")
    ? "general"
    : "default";

  return (
    <div
      className={`retreat-card-wrapper ${typeClass}`}
      onClick={() => navigate(retreat.id)}
    >
      <div className="retreat-card-body">
        <div className="retreat-header">
          <span className="retreat-name">{retreat.name}</span>
          <Tag neutral>{retreat.retreatCode}</Tag>
        </div>

        <div className="tags-row">
          {retreat.finalized && (
            <Tag positive bold>
              Finalized
            </Tag>
          )}
          <Tag positive={!retreat.disabled} negative={retreat.disabled}>
            {retreat.disabled ? "Disabled" : "Active"}
          </Tag>
          <Tag>{retreat.retreatType?.toUpperCase()}</Tag>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <span className="info-icon">
              <FiCalendar />
            </span>
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

          <div className="info-item">
            <span className="info-icon">
              <FiClock />
            </span>
            <span>{retreat.noOfDays} Days</span>
          </div>

          <div className="info-item">
            <span className="info-icon">
              <FiMapPin />
            </span>
            <span>
              <RetreatLocation locationId={retreat.location} />
            </span>
          </div>

          <div className="info-item">
            <span className="info-icon">
              <FiUsers />
            </span>
            <span>{retreat.totalYogis} Yogis</span>
          </div>
        </div>

        <div className="manage-btn-container">
          <Button
            primary
            onClick={(_data: any, e: React.MouseEvent) => {
              e?.stopPropagation();
              navigate(retreat.id);
            }}
          >
            Manage
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RetreatCard;
