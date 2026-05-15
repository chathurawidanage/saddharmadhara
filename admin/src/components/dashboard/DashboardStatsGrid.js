import { CircularLoader } from "@dhis2/ui";
import React from "react";
import { FiActivity, FiAlertCircle, FiLayers, FiMessageSquare } from "react-icons/fi";
import { observer } from "mobx-react";

const DashboardStatsGrid = observer(({ store }) => {
  return (
    <div className="stats-grid">
      <div className="stat-card-wrapper">
        <div className="stat-title">SMS Credits</div>
        <div className="stat-value">
          {store.metadata.requestStates.loadingSmsCredits ? (
            <CircularLoader small />
          ) : store.metadata.smsCredits ? (
            `LKR ${store.metadata.smsCredits.balance}`
          ) : (
            "N/A"
          )}
        </div>
        {store.metadata.requestStates.smsCreditsError && (
          <div style={{ marginTop: 8, fontSize: "0.8rem", color: "#d14343" }}>
            {store.metadata.requestStates.smsCreditsError}
          </div>
        )}
        <FiMessageSquare className="stat-icon" />
      </div>
      <div className="stat-card-wrapper">
        <div className="stat-title">Active Retreats</div>
        <div className="stat-value">
          {store.metadata.currentRetreats.length}
        </div>
        <FiActivity className="stat-icon" />
      </div>
      <div className="stat-card-wrapper">
        <div className="stat-title">Total Retreats</div>
        <div className="stat-value">{store.metadata.retreats.length}</div>
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "8px",
            fontSize: "0.85em",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "#e6fffa",
              padding: "2px 8px",
              borderRadius: "12px",
              color: "#28a745",
            }}
          >
            <span>General:</span>
            <strong>
              {
                store.metadata.retreats.filter((r) =>
                  r.retreatType?.toLowerCase().includes("general"),
                ).length
              }
            </strong>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "#f3e8ff",
              padding: "2px 8px",
              borderRadius: "12px",
              color: "#6610f2",
            }}
          >
            <span>Silent:</span>
            <strong>
              {
                store.metadata.retreats.filter((r) =>
                  r.retreatType?.toLowerCase().includes("silent"),
                ).length
              }
            </strong>
          </div>
        </div>
        <FiLayers className="stat-icon" />
      </div>

      <div className="stat-card-wrapper bg-danger-light">
        <div className="stat-title text-danger-custom">Unfinalized</div>
        <div className="stat-value text-danger-custom">
          {store.metadata.retreats.filter((r) => !r.finalized).length}
        </div>
        <FiAlertCircle className="stat-icon text-danger-custom" />
      </div>
    </div>
  );
});

export default DashboardStatsGrid;
