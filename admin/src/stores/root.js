import { makeAutoObservable, runInAction } from "mobx";
import MetadataStore from "./metadata";
import YogiStore from "./yogi";

class RootStore {
  engine = null;
  initialized = false;
  initializing = false;
  initializationError = null;
  metadata = null;
  yogis = null;

  constructor() {
    makeAutoObservable(this);
  }

  init = async (engine) => {
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
