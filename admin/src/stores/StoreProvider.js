import React, { createContext, useContext, useEffect, useState } from "react";
import RootStore from "./root";
import { useDataEngine } from "@dhis2/app-runtime";

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const engine = useDataEngine();
  const [rootStore] = useState(() => new RootStore());

  useEffect(() => {
    rootStore.init(engine);
  }, [engine, rootStore]);

  return (
    <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
  );
};

export const useStore = () => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return store;
};
