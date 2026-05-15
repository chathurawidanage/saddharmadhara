import { makeAutoObservable, runInAction } from "mobx";
import {
  DHIS2_ACTIVE_RETREATS_SQL_VIEW,
  DHIS2_LANGUAGES_OPTION_SET_ID,
  DHIS2_ROOMS_OPTION_SET_ID,
  DHIS_RETREAT_SELECTION_STATE_OPTION_SET_ID,
  DHIS_RETREAT_TYPE_OPTION_SET_ID,
  DHIS2_RETREAT_FINALIZED_ATTRIBUTE,
  DHIS2_ATTENDANCE_OPTION_SET_ID,
  DHIS2_RETREAT_ATTENDANCE_CONFIRMATION_DATE_ATTRIBUTE,
  DHIS2_DASHBOARD_PARTICIPATION_SUMMARY_SQL_VIEW,
  DHIS2_DASHBOARD_EOI_SUMMARY_SQL_VIEW,
} from "../dhis2";
import {
  transformAttendance,
  transformEoiSummary,
  transformLanguages,
  transformParticipationSummary,
  transformRetreats,
  transformRooms,
} from "../utils/transformers";
import { calculateGeneralRetreatStats } from "../utils/statsUtils";

const bootstrapQuery = {
  retreatTypes: {
    resource: `optionSets/${DHIS_RETREAT_TYPE_OPTION_SET_ID}.json`,
    params: {
      fields: "options[name,code]",
    },
  },
  retreats: {
    resource: `sqlViews/${DHIS2_ACTIVE_RETREATS_SQL_VIEW}/data.json`,
    params: {
      skipPaging: true,
    },
  },
  selectionStates: {
    resource: `optionSets/${DHIS_RETREAT_SELECTION_STATE_OPTION_SET_ID}.json`,
    params: {
      fields: "options[code,name,style]",
    },
  },
};

const supportingMetadataQuery = {
  rooms: {
    resource: `optionSets/${DHIS2_ROOMS_OPTION_SET_ID}.json`,
    params: {
      fields: "options[code,name,attributeValues]",
    },
  },
  languages: {
    resource: `optionSets/${DHIS2_LANGUAGES_OPTION_SET_ID}.json`,
    params: {
      fields: "options[code,name,attributeValues]",
    },
  },
  attendance: {
    resource: `optionSets/${DHIS2_ATTENDANCE_OPTION_SET_ID}.json`,
    params: {
      fields: "options[code,name]",
    },
  },
};

const statsQuery = {
  participationSummary: {
    resource: `sqlViews/${DHIS2_DASHBOARD_PARTICIPATION_SUMMARY_SQL_VIEW}/data.json`,
    params: {
      skipPaging: true,
    },
  },
  eoiSummary: {
    resource: `sqlViews/${DHIS2_DASHBOARD_EOI_SUMMARY_SQL_VIEW}/data.json`,
    params: {
      skipPaging: true,
    },
  },
};

class MetadataStore {
  retreatTypes = [];
  retreats = [];
  selectionStates = [];
  rooms = [];
  languages = [];
  attendance = [];
  participationSummary = [];
  eoiSummary = [];
  smsCredits = null;

  requestStates = {
    loadingBootstrap: false,
    loadingRetreatRefresh: false,
    loadingSupporting: false,
    loadingStats: false,
    loadingSmsCredits: false,
    bootstrapError: null,
    retreatRefreshError: null,
    supportingError: null,
    statsError: null,
    smsCreditsError: null,
  };

  constructor(engine) {
    this.engine = engine;
    makeAutoObservable(this);
  }

  get retreatsMapWithIdKey() {
    let retreatsMap = {};
    this.retreats?.forEach((retreat) => {
      retreatsMap[retreat.id] = retreat;
    });
    return retreatsMap;
  }

  get retreatsMapWithCodeKey() {
    let retreatsMap = {};
    this.retreats?.forEach((retreat) => {
      retreatsMap[retreat.code] = retreat;
    });
    return retreatsMap;
  }

  get currentRetreats() {
    return this.retreats.filter((retreat) => retreat.current);
  }

  get oldRetreats() {
    return this.retreats.filter((retreat) => !retreat.current);
  }

  markRetreatAsFinalized = async (retreat) => {
    const finalized = await this.updateRetreatAttribute(
      retreat,
      DHIS2_RETREAT_FINALIZED_ATTRIBUTE,
      true,
    );

    if (finalized) {
      runInAction(() => {
        const retreatIndex = this.retreats.indexOf(retreat);
        this.retreats[retreatIndex].finalized = true;
      });
    }
  };

  setRetreatAttendanceConfirmationDate = async (retreat, date) => {
    await this.updateRetreatAttribute(
      retreat,
      DHIS2_RETREAT_ATTENDANCE_CONFIRMATION_DATE_ATTRIBUTE,
      date,
    );
  };

  updateRetreatAttribute = async (retreat, attributeId, value) => {
    try {
      const retreatObj = await this.engine.query({
        retreat: {
          resource: `options/${retreat.id}.json`,
          params: {
            fields: "id,code,name,optionSet,attributeValues[attribute[id],value]",
          },
        },
      });

      const existingRetreatOnServer = retreatObj.retreat;
      const updatingAttributeIndex =
        existingRetreatOnServer.attributeValues.findIndex(
          (attributeValue) => attributeValue.attribute.id === attributeId,
        );
      if (updatingAttributeIndex !== -1) {
        // remove
        existingRetreatOnServer.attributeValues.splice(
          updatingAttributeIndex,
          1,
        );
      }

      const mutatedRetreat = {
        ...existingRetreatOnServer,
        attributeValues: [
          ...existingRetreatOnServer.attributeValues,
          {
            attribute: {
              id: attributeId,
            },
            value: value,
          },
        ],
      };

      const mutation = {
        resource: "options",
        id: retreat.id,
        data: mutatedRetreat,
        type: "update",
      };
      let response = await this.engine.mutate(mutation);

      return response.httpStatusCode === 200;
    } catch (error) {
      console.error("Failed to update retreat attribute", error);
      return false;
    }
  };

  fetchSmsCredits = async () => {
    runInAction(() => {
      this.requestStates.loadingSmsCredits = true;
      this.requestStates.smsCreditsError = null;
    });
    try {
      const response = await fetch(
        "https://application.srisambuddhamission.org/api/sms/balance",
      );
      if (response.ok) {
        const data = await response.json();
        runInAction(() => {
          this.smsCredits = data;
        });
      } else {
        runInAction(() => {
          this.requestStates.smsCreditsError = "Failed to fetch SMS credits.";
        });
      }
    } catch (error) {
      runInAction(() => {
        this.requestStates.smsCreditsError = "Failed to fetch SMS credits.";
      });
      console.error("Failed to fetch SMS credits", error);
    } finally {
      runInAction(() => {
        this.requestStates.loadingSmsCredits = false;
      });
    }
  };

  loadRetreats = async () => {
    runInAction(() => {
      this.requestStates.loadingRetreatRefresh = true;
      this.requestStates.retreatRefreshError = null;
    });

    try {
      let response = await this.engine.query({
        retreats: {
          resource: `sqlViews/${DHIS2_ACTIVE_RETREATS_SQL_VIEW}/data.json`,
          params: {
            skipPaging: true,
          },
        },
      });
      runInAction(() => {
        this.retreats = transformRetreats(response.retreats);
      });
    } catch (error) {
      runInAction(() => {
        this.requestStates.retreatRefreshError = "Failed to refresh retreats.";
      });
      console.error("Failed to load retreats", error);
    } finally {
      runInAction(() => {
        this.requestStates.loadingRetreatRefresh = false;
      });
    }
  };

  get generalRetreatStats() {
    return calculateGeneralRetreatStats(
      this.retreats,
      this.participationSummary,
      this.eoiSummary,
    );
  }

  bootstrap = async () => {
    runInAction(() => {
      this.requestStates.loadingBootstrap = true;
      this.requestStates.bootstrapError = null;
    });
    try {
      let response = await this.engine.query(bootstrapQuery);
      runInAction(() => {
        this.retreatTypes = response.retreatTypes.options;
        this.selectionStates = response.selectionStates.options;
        this.retreats = transformRetreats(response.retreats);
      });
    } catch (error) {
      runInAction(() => {
        this.requestStates.bootstrapError = "Failed to bootstrap metadata.";
      });
      console.error(error);
      throw error;
    } finally {
      runInAction(() => {
        this.requestStates.loadingBootstrap = false;
      });
    }
  };

  loadSupportingMetadata = async () => {
    runInAction(() => {
      this.requestStates.loadingSupporting = true;
      this.requestStates.supportingError = null;
    });
    try {
      let response = await this.engine.query(supportingMetadataQuery);
      runInAction(() => {
        this.rooms = transformRooms(response.rooms);
        this.languages = transformLanguages(response.languages);
        this.attendance = transformAttendance(response.attendance);
      });
    } catch (error) {
      runInAction(() => {
        this.requestStates.supportingError =
          "Failed to load supporting metadata.";
      });
      console.error("Failed to load supporting metadata", error);
    } finally {
      runInAction(() => {
        this.requestStates.loadingSupporting = false;
      });
    }
  };

  loadDashboardStats = async () => {
    runInAction(() => {
      this.requestStates.loadingStats = true;
      this.requestStates.statsError = null;
    });
    try {
      let response = await this.engine.query(statsQuery);
      runInAction(() => {
        this.participationSummary = transformParticipationSummary(
          response.participationSummary,
        );
        this.eoiSummary = transformEoiSummary(response.eoiSummary);
      });
    } catch (error) {
      runInAction(() => {
        this.requestStates.statsError = "Failed to load dashboard stats.";
      });
      console.error("Failed to load dashboard stats", error);
    } finally {
      runInAction(() => {
        this.requestStates.loadingStats = false;
      });
    }
  };

  init = async () => {
    await this.bootstrap();
    // These can run in parallel and don't block basic app functionality
    this.loadSupportingMetadata();
    this.loadDashboardStats();
    this.fetchSmsCredits();
  };
}

export default MetadataStore;
