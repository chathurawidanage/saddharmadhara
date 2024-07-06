import React, { useEffect } from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import RetreatsDashboard from "./components/RetreatsDashboard";
import RetreatManager from "./components/RetreatManager";
import { observer } from "mobx-react"
import {
  CircularLoader
} from "@dhis2/ui";
import RootStore from "./stores/root";
import { useDataEngine } from "@dhis2/app-runtime";

const rootStore = new RootStore();

const router = createHashRouter([
  {
    path: "/",
    element: <RetreatsDashboard store={rootStore} />,
  },
  {
    path: "/:retreatId",
    element: <RetreatManager store={rootStore} />,
  },
]);

const App = observer(() => {

  const engine = useDataEngine();

  useEffect(() => {
    rootStore.init(engine);
  }, [engine]);

  if (!rootStore.initialized) {
    return <CircularLoader />
  }

  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
});

export default App;
