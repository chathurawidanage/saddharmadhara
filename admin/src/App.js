import React from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import RetreatsDashboard from "./components/RetreatsDashboard";
import RetreatManager from "./components/RetreatManager";

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

const App = () => {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
};

export default App;
