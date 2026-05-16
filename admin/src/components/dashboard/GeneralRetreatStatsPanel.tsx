import { CircularLoader, NoticeBox } from "@dhis2/ui";
import React from "react";
import { FiUsers } from "react-icons/fi";
import { observer } from "mobx-react";
import "./GeneralRetreatStatsPanel.css";
import RootStore from "../../stores/root";

interface GeneralRetreatStatsPanelProps {
  store: RootStore;
}

const GeneralRetreatStatsPanel = observer(({ store }: GeneralRetreatStatsPanelProps) => {
  if (!store.metadata) return null;

  return (
    <div className="stats-panel-container">
      <h5 className="stats-panel-title">
        <FiUsers /> General Retreat Stats
      </h5>
      {store.metadata.requestStates.statsError && (
        <NoticeBox error title="Dashboard stats unavailable">
          {store.metadata.requestStates.statsError}
        </NoticeBox>
      )}
      {(() => {
        if (store.metadata!.requestStates.loadingStats) {
          return (
            <div className="stats-panel-loader-wrapper">
              <CircularLoader small />
            </div>
          );
        }
        const stats = store.metadata!.generalRetreatStats;
        if (!stats) return null;

        return (
          <div className="stats-panel-grid">
            <div>
              <div className="stats-item-label">
                Total Unique Applicants
              </div>
              <div className="stats-item-value applicants">
                {stats.totalApplicants}
              </div>
            </div>
            <div>
              <div className="stats-item-label">
                Total Participants
              </div>
              <div className="stats-item-value participants">
                {stats.totalParticipants}
              </div>
            </div>
            <div>
              <div className="stats-item-label">
                One-time Participants
              </div>
              <div className="stats-item-value onetime">
                {stats.oneTimeParticipants}
              </div>
            </div>
            <div>
              <div className="stats-item-label">
                Repeat Participants
              </div>
              <div className="stats-item-value repeat">
                {stats.repeatParticipants}
              </div>
            </div>
            <div>
              <div className="stats-item-label">
                Waiting for Invitation
              </div>
              <div className="stats-item-value waiting">
                {stats.unableToParticipate}
              </div>
            </div>
            <div className="stats-breakdown-section">
              <div className="stats-breakdown-label">
                Repeat Participation Breakdown
              </div>
              <div className="stats-breakdown-list">
                {Object.entries(stats.repeatBreakdown || {}).map(
                  ([count, users]) => (
                    <div key={count} className="stats-breakdown-tag">
                      <strong>{count}x</strong>: {users} yogis
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
});

export default GeneralRetreatStatsPanel;
