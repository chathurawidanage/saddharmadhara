import { CircularLoader, NoticeBox } from "@dhis2/ui";
import React from "react";
import { FiUsers } from "react-icons/fi";
import { observer } from "mobx-react";

const GeneralRetreatStatsPanel = observer(({ store }) => {
  return (
    <div
      style={{
        marginTop: "24px",
        background: "white",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <h5
        style={{
          margin: "0 0 16px 0",
          color: "#404b5a",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <FiUsers /> General Retreat Stats
      </h5>
      {store.metadata.requestStates.statsError && (
        <NoticeBox error title="Dashboard stats unavailable">
          {store.metadata.requestStates.statsError}
        </NoticeBox>
      )}
      {(() => {
        if (store.metadata.requestStates.loadingStats) {
          return (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "20px",
              }}
            >
              <CircularLoader small />
            </div>
          );
        }
        const stats = store.metadata.generalRetreatStats;
        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "24px",
            }}
          >
            <div>
              <div style={{ color: "#6e7a8a", fontSize: "0.9rem" }}>
                Total Unique Applicants
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#2c3e50",
                }}
              >
                {stats.totalApplicants}
              </div>
            </div>
            <div>
              <div style={{ color: "#6e7a8a", fontSize: "0.9rem" }}>
                Total Participants
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#28a745",
                }}
              >
                {stats.totalParticipants}
              </div>
            </div>
            <div>
              <div style={{ color: "#6e7a8a", fontSize: "0.9rem" }}>
                One-time Participants
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#17a2b8",
                }}
              >
                {stats.oneTimeParticipants}
              </div>
            </div>
            <div>
              <div style={{ color: "#6e7a8a", fontSize: "0.9rem" }}>
                Repeat Participants
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#6610f2",
                }}
              >
                {stats.repeatParticipants}
              </div>
            </div>
            <div>
              <div style={{ color: "#6e7a8a", fontSize: "0.9rem" }}>
                Waiting for Invitation
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#dc3545",
                }}
              >
                {stats.unableToParticipate}
              </div>
            </div>
            <div
              style={{
                gridColumn: "1 / -1",
                borderTop: "1px solid #eee",
                paddingTop: "12px",
              }}
            >
              <div
                style={{
                  color: "#6e7a8a",
                  fontSize: "0.9rem",
                  marginBottom: "8px",
                }}
              >
                Repeat Participation Breakdown
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {Object.entries(stats.repeatBreakdown || {}).map(
                  ([count, users]) => (
                    <div
                      key={count}
                      style={{
                        background: "#f8f9fa",
                        padding: "4px 12px",
                        borderRadius: "16px",
                        fontSize: "0.85rem",
                      }}
                    >
                      <strong style={{ color: "#6610f2" }}>{count}x</strong>:{" "}
                      {users} yogis
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
