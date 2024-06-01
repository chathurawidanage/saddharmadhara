import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RetreatsDashboard from "./components/RetreatsDashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RetreatsDashboard />,
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
