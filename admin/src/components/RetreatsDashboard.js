import { Button, NoticeBox } from "@dhis2/ui";
import { observer } from "mobx-react";
import { useState } from "react";
import RetreatModel from "./RetreatModal";
import "./RetreatsDashboard.css";
import { useStore } from "../stores/StoreProvider";
import DashboardStatsGrid from "./dashboard/DashboardStatsGrid";
import GeneralRetreatStatsPanel from "./dashboard/GeneralRetreatStatsPanel";
import RetreatSection from "./dashboard/RetreatSection";

const RetreatsDashboard = observer(() => {
  const store = useStore();
  const [hideRetreatModel, setHideRetreatModel] = useState(true);

  return (
    <div className="retreats-dashboard-container">
      <div className="dashboard-header-row">
        <h2 className="dashboard-header-title">Dashboard</h2>
        <div>
          <Button
            primary
            onClick={() => {
              setHideRetreatModel(false);
            }}
          >
            Create Retreat
          </Button>
          {!hideRetreatModel && (
            <RetreatModel
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
        <NoticeBox error title="Retreat refresh failed" style={{ marginTop: 24 }}>
          {store.metadata.requestStates.retreatRefreshError}
        </NoticeBox>
      )}

      <RetreatSection 
        title="Current Retreats"
        retreats={store.metadata.currentRetreats}
        emptyMessage="There are no current retreats"
      />

      <RetreatSection 
        title="Past Retreats"
        retreats={store.metadata.retreats.filter((retreat) => !retreat.current)}
        emptyMessage="There are no past retreats"
      />
    </div>
  );
});

export default RetreatsDashboard;
