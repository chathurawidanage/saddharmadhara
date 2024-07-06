import { makeAutoObservable, runInAction } from 'mobx';
import MetadataStore from './metadata';
import YogiStore from './yogi';

class RootStore {
    initialized = false;

    constructor() {
        makeAutoObservable(this);
    }

    init = async (engine) => {
        this.metadata = new MetadataStore(engine);
        this.yogis = new YogiStore(engine);

        await this.metadata.init();
        runInAction(() => {
            this.initialized = true;
        });
    };
};

export default RootStore;