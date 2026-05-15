import React from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import RetreatsDashboard from "./components/RetreatsDashboard";
import RetreatManager from "./components/RetreatManager";
import { observer } from "mobx-react";
import { Button, CircularLoader, NoticeBox } from "@dhis2/ui";
import { StoreProvider, useStore } from "./stores/StoreProvider";

import "./index.css";
import "./App.css";

const router = createHashRouter([
  {
    path: "/",
    element: <RetreatsDashboard />,
  },
  {
    path: "/:retreatId",
    element: <RetreatManager />,
  },
]);

const AppContent = observer(() => {
  const store = useStore();

  if (store.initializing || (!store.initialized && !store.initializationError)) {
    return (
      <div className="app-loader-container">
        <CircularLoader />
      </div>
    );
  }

  if (store.initializationError) {
    return (
      <div className="app-error-container">
        <NoticeBox error title="Unable to load admin data">
          {store.initializationError}
        </NoticeBox>
        <div className="app-error-actions">
          <Button onClick={() => store.init(store.engine)}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
});

const App = () => {
  return (
    <React.StrictMode>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </React.StrictMode>
  );
};

export default App;
