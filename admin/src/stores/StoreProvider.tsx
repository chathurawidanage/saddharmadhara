import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import RootStore from "./root";
import { useDataEngine } from "@dhis2/app-runtime";

const StoreContext = createContext<RootStore | null>(null);

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const engine = useDataEngine();
  const [rootStore] = useState(() => new RootStore());

  useEffect(() => {
    rootStore.init(engine);
  }, [engine, rootStore]);

  return (
    <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
  );
};

export const useStore = (): RootStore => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return store;
};
