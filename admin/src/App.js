import React from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import RetreatsDashboard from "./components/RetreatsDashboard";
import RetreatManager from "./components/RetreatManager";
import { observer } from "mobx-react";
import { Button, CircularLoader, NoticeBox } from "@dhis2/ui";
import { StoreProvider, useStore } from "./stores/StoreProvider";

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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw",
        }}
      >
        <CircularLoader />
      </div>
    );
  }

  if (store.initializationError) {
    return (
      <div
        style={{
          maxWidth: 640,
          margin: "80px auto",
          padding: "0 24px",
        }}
      >
        <NoticeBox error title="Unable to load admin data">
          {store.initializationError}
        </NoticeBox>
        <div style={{ marginTop: 16 }}>
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
