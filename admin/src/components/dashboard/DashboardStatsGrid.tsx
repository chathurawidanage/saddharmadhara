import { CircularLoader } from "@dhis2/ui";
import React from "react";
import { FiActivity, FiAlertCircle, FiLayers, FiMessageSquare } from "react-icons/fi";
import { observer } from "mobx-react";
import RootStore from "../../stores/root";
import { Retreat } from "../../types/domain";

interface DashboardStatsGridProps {
  store: RootStore;
}

const DashboardStatsGrid = observer(({ store }: DashboardStatsGridProps) => {
  if (!store.metadata) return null;
  
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
          <div className="stat-error-msg">
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
        <div className="stat-breakdown-row">
          <div className="breakdown-tag general">
            <span>General:</span>
            <strong>
              {
                store.metadata.retreats.filter((r: Retreat) =>
                  r.retreatType?.toLowerCase().includes("general"),
                ).length
              }
            </strong>
          </div>
          <div className="breakdown-tag silent">
            <span>Silent:</span>
            <strong>
              {
                store.metadata.retreats.filter((r: Retreat) =>
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
          {store.metadata.retreats.filter((r: Retreat) => !r.finalized).length}
        </div>
        <FiAlertCircle className="stat-icon text-danger-custom" />
      </div>
    </div>
  );
});

export default DashboardStatsGrid;
