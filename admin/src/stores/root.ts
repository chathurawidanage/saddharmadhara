import { makeAutoObservable, runInAction } from "mobx";
import MetadataStore from "./metadata";
import YogiStore from "./yogi";

import { Dhis2Engine } from "../types/dhis2";

class RootStore {
  engine: Dhis2Engine | null = null;
  initialized = false;
  initializing = false;
  initializationError: string | null = null;
  metadata: MetadataStore | null = null;
  yogis: YogiStore | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  init = async (engine: Dhis2Engine): Promise<void> => {
    runInAction(() => {
      this.engine = engine;
      this.initializing = true;
      this.initializationError = null;
      this.initialized = false;
    });

    try {
      this.metadata = new MetadataStore(engine);
      this.yogis = new YogiStore(engine);

      await this.metadata.init();

      runInAction(() => {
        this.initialized = true;
      });
    } catch (error) {
      runInAction(() => {
        this.initializationError =
          this.metadata?.requestStates.bootstrapError ||
          "Failed to initialize the admin app.";
      });
      console.error("RootStore initialization failed", error);
    } finally {
      runInAction(() => {
        this.initializing = false;
      });
    }
  };
}

export default RootStore;
