import { Button, NoticeBox } from "@dhis2/ui";
import { observer } from "mobx-react";
import React, { useState } from "react";
import RetreatModal from "./RetreatModal";
import "./RetreatsDashboard.css";
import { useStore } from "../stores/StoreProvider";
import DashboardStatsGrid from "./dashboard/DashboardStatsGrid";
import GeneralRetreatStatsPanel from "./dashboard/GeneralRetreatStatsPanel";
import RetreatSection from "./dashboard/RetreatSection";

import { useNavigate } from "react-router-dom";

const RetreatsDashboard = observer(() => {
  const store = useStore();
  const navigate = useNavigate();
  const [hideRetreatModel, setHideRetreatModel] = useState(true);

  if (!store.metadata) return null;

  return (
    <div className="retreats-dashboard-container">
      <div className="dashboard-header-row">
        <div>
          <h2 className="dashboard-header-title">All Retreats List</h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#6e7a8a" }}>
            Flat view of all historical and active meditation retreats
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button
            secondary
            onClick={() => {
              navigate("/");
            }}
          >
            Back to Seasons Landing
          </Button>
          <Button
            primary
            onClick={() => {
              setHideRetreatModel(false);
            }}
          >
            Create Retreat
          </Button>
          {!hideRetreatModel && (
            <RetreatModal
              onCancel={() => {
                setHideRetreatModel(true);
              }}
            />
          )}
        </div>
      </div>

      <DashboardStatsGrid store={store} />

      <GeneralRetreatStatsPanel store={store} />

      {store.metadata.requestStates.retreatRefreshError && (
        <div className="notice-box-wrapper">
          <NoticeBox error title="Retreat refresh failed">
            {store.metadata.requestStates.retreatRefreshError}
          </NoticeBox>
        </div>
      )}

      <RetreatSection 
        title="Current Retreats"
        retreats={store.metadata.currentRetreats}
        emptyMessage="There are no current retreats"
      />

      <RetreatSection 
        title="Past Retreats"
        retreats={store.metadata.oldRetreats}
        emptyMessage="There are no past retreats"
      />
    </div>
  );
});

export default RetreatsDashboard;
