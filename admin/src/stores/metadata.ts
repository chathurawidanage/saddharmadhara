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
  DHIS2_SEASON_OPTION_SET_ID,
  DHIS2_RETREAT_SEASON_ATTRIBUTE,
} from "../dhis2";
import {
  transformAttendance,
  transformEoiSummary,
  transformLanguages,
  transformParticipationSummary,
  transformRetreats,
  transformRooms,
  transformSeasons,
} from "../utils/transformers";
import { calculateGeneralRetreatStats, GeneralRetreatStats } from "../utils/statsUtils";
import { 
  Retreat, 
  Room, 
  Language, 
  Attendance, 
  ParticipationSummary, 
  EoiSummary,
  MetadataOption,
  Season,
  SelectionState,
  Gender,
  MaritalState
} from "../types/domain";
import { validateOptionSet } from "../utils/schemaValidation";
import { Dhis2Engine, Dhis2SqlViewResponse, Dhis2OptionSetResponse, Dhis2Option } from "../types/dhis2";


interface RequestStates {
  loadingBootstrap: boolean;
  loadingRetreatRefresh: boolean;
  loadingSupporting: boolean;
  loadingStats: boolean;
  loadingSmsCredits: boolean;
  bootstrapError: string | null;
  retreatRefreshError: string | null;
  supportingError: string | null;
  statsError: string | null;
  smsCreditsError: string | null;
}

const bootstrapQuery: object = {

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
  seasons: {
    resource: `optionSets/${DHIS2_SEASON_OPTION_SET_ID}.json`,
    params: {
      fields: "options[id,name,code,attributeValues[attribute[id],value]]",
    },
  },
  me: {
    resource: "me.json",
    params: {
      fields: "id,name,username,authorities,userRoles[id,name]",
    },
  },
};

const supportingMetadataQuery: object = {

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
  genderOptions: {
    resource: "optionSets/t4AsgOgvbi8.json",
    params: {
      fields: "options[code,name]",
    },
  },
  maritalStateOptions: {
    resource: "optionSets/Gv71emLnAwE.json",
    params: {
      fields: "options[code,name]",
    },
  },
};

const statsQuery: object = {

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
  retreatTypes: MetadataOption[] = [];
  retreats: Retreat[] = [];
  selectionStates: MetadataOption[] = [];
  rooms: Room[] = [];
  currentUser: any = null;

  get isAdmin(): boolean {
    if (!this.currentUser) return false;
    const hasAllAuthority = this.currentUser.authorities?.includes("ALL");
    const hasAdminRole = this.currentUser.userRoles?.some((role: any) => 
      role.name?.toLowerCase().includes("admin") || 
      role.name?.toLowerCase().includes("superuser")
    );
    return !!(hasAllAuthority || hasAdminRole);
  }
  languages: Language[] = [];
  attendance: Attendance[] = [];
  seasons: Season[] = [];
  participationSummary: ParticipationSummary[] = [];
  eoiSummary: EoiSummary[] = [];
  smsCredits: { balance: number; currency: string } | null = null;
  engine: Dhis2Engine;


  requestStates: RequestStates = {
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

  constructor(engine: Dhis2Engine) {
    this.engine = engine;

    makeAutoObservable(this);
  }

  get retreatsMapWithIdKey(): Record<string, Retreat> {
    const retreatsMap: Record<string, Retreat> = {};
    this.retreats?.forEach((retreat) => {
      retreatsMap[retreat.id] = retreat;
    });
    return retreatsMap;
  }

  get retreatsMapWithCodeKey(): Record<string, Retreat> {
    const retreatsMap: Record<string, Retreat> = {};
    this.retreats?.forEach((retreat) => {
      retreatsMap[retreat.code] = retreat;
    });
    return retreatsMap;
  }

  get currentRetreats(): Retreat[] {
    return this.retreats.filter((retreat) => retreat.current);
  }

  get oldRetreats(): Retreat[] {
    return this.retreats.filter((retreat) => !retreat.current);
  }

  markRetreatAsFinalized = async (retreat: Retreat): Promise<void> => {
    const finalized = await this.updateRetreatAttribute(
      retreat,
      DHIS2_RETREAT_FINALIZED_ATTRIBUTE,
      true,
    );

    if (finalized) {
      runInAction(() => {
        const retreatIndex = this.retreats.indexOf(retreat);
        if (retreatIndex !== -1) {
          this.retreats[retreatIndex].finalized = true;
        }
      });
    }
  };

  setRetreatAttendanceConfirmationDate = async (retreat: Retreat, date: string): Promise<void> => {
    const updated = await this.updateRetreatAttribute(
      retreat,
      DHIS2_RETREAT_ATTENDANCE_CONFIRMATION_DATE_ATTRIBUTE,
      date,
    );
    if (updated) {
      runInAction(() => {
        const retreatIndex = this.retreats.indexOf(retreat);
        if (retreatIndex !== -1) {
          this.retreats[retreatIndex].confirmationDeadline = date;
        }
      });
    }
  };

  loadSeasons = async (): Promise<void> => {
    try {
      const response = await this.engine.query({
        seasons: {
          resource: `optionSets/${DHIS2_SEASON_OPTION_SET_ID}.json`,
          params: {
            fields: "options[id,name,code,attributeValues[attribute[id],value]]",
          },
        },
      });
      runInAction(() => {
        this.seasons = transformSeasons(response.seasons as Dhis2OptionSetResponse);
      });
    } catch (error) {
      console.error("Failed to load seasons", error);
    }
  };

  assignSeasonToRetreat = async (retreat: Retreat, seasonCode: string): Promise<boolean> => {
    const success = await this.updateRetreatAttribute(
      retreat,
      DHIS2_RETREAT_SEASON_ATTRIBUTE,
      seasonCode || ""
    );

    if (success) {
      runInAction(() => {
        const retreatIndex = this.retreats.findIndex(r => r.id === retreat.id);
        if (retreatIndex !== -1) {
          this.retreats[retreatIndex].season = seasonCode || "";
        }
      });
    }
    return success;
  };

  updateRetreatAttribute = async (
    retreat: Retreat,
    attributeId: string,
    value: string | number | boolean,
  ): Promise<boolean> => {
    try {
      const response = await this.engine.query({
        retreat: {
          resource: `options/${retreat.id}.json`,
          params: {
            fields: "id,code,name,optionSet,attributeValues[attribute[id],value]",
          },
        },
      });

      const existingRetreatOnServer = response.retreat as Dhis2Option;
      if (!existingRetreatOnServer.attributeValues) {
        existingRetreatOnServer.attributeValues = [];
      }

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

      const mutation: object = {
        resource: "options",
        id: retreat.id,
        data: mutatedRetreat,
        type: "update",
      };
      const result = await this.engine.mutate(mutation);


      return result.httpStatusCode === 200;
    } catch (error) {
      console.error("Failed to update retreat attribute", error);
      return false;
    }
  };

  fetchSmsCredits = async (): Promise<void> => {
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

  loadRetreats = async (): Promise<void> => {
    runInAction(() => {
      this.requestStates.loadingRetreatRefresh = true;
      this.requestStates.retreatRefreshError = null;
    });

    try {
      const response = await this.engine.query({
        retreats: {
          resource: `sqlViews/${DHIS2_ACTIVE_RETREATS_SQL_VIEW}/data.json`,
          params: {
            skipPaging: true,
          },
        },
      });
      runInAction(() => {
        this.retreats = transformRetreats(response.retreats as Dhis2SqlViewResponse);
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

  get generalRetreatStats(): GeneralRetreatStats {
    return calculateGeneralRetreatStats(
      this.retreats,
      this.participationSummary,
      this.eoiSummary,
    );
  }

  bootstrap = async (): Promise<void> => {
    runInAction(() => {
      this.requestStates.loadingBootstrap = true;
      this.requestStates.bootstrapError = null;
    });
    try {
      const response = await this.engine.query(bootstrapQuery);
      runInAction(() => {
        this.retreatTypes = (response.retreatTypes as Dhis2OptionSetResponse).options;
        this.selectionStates = (response.selectionStates as Dhis2OptionSetResponse).options;
        this.seasons = transformSeasons(response.seasons as Dhis2OptionSetResponse);
        this.retreats = transformRetreats(response.retreats as Dhis2SqlViewResponse);
        this.currentUser = response.me;

        // Verify that SelectionState enum matches DHIS2 OptionSet
        const selectionMismatches = validateOptionSet(
          DHIS_RETREAT_SELECTION_STATE_OPTION_SET_ID,
          "SelectionState",
          this.selectionStates,
          SelectionState as any
        );
        if (selectionMismatches.length > 0) {
          console.error("SCHEMA MISMATCH: SelectionState enum deviates from DHIS2 option set!", selectionMismatches);
        }

        // Filter out WAITING selection state from active selectionStates to hide it from the UI entirely
        this.selectionStates = this.selectionStates.filter(
          (state) => state.code !== SelectionState.WAITING
        );
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

  loadSupportingMetadata = async (): Promise<void> => {
    runInAction(() => {
      this.requestStates.loadingSupporting = true;
      this.requestStates.supportingError = null;
    });
    try {
      const response = await this.engine.query(supportingMetadataQuery);
      runInAction(() => {
        this.rooms = transformRooms(response.rooms as Dhis2OptionSetResponse);
        this.languages = transformLanguages(response.languages as Dhis2OptionSetResponse);
        this.attendance = transformAttendance(response.attendance as Dhis2OptionSetResponse);

        // Verify that Gender enum matches DHIS2 OptionSet
        if (response.genderOptions) {
          const genderMismatches = validateOptionSet(
            "t4AsgOgvbi8",
            "Gender",
            (response.genderOptions as Dhis2OptionSetResponse).options,
            Gender as any
          );
          if (genderMismatches.length > 0) {
            console.error("SCHEMA MISMATCH: Gender enum deviates from DHIS2 option set!", genderMismatches);
          }
        }

        // Verify that MaritalState enum matches DHIS2 OptionSet
        if (response.maritalStateOptions) {
          const maritalMismatches = validateOptionSet(
            "Gv71emLnAwE",
            "MaritalState",
            (response.maritalStateOptions as Dhis2OptionSetResponse).options,
            MaritalState as any
          );
          if (maritalMismatches.length > 0) {
            console.error("SCHEMA MISMATCH: MaritalState enum deviates from DHIS2 option set!", maritalMismatches);
          }
        }
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

  loadDashboardStats = async (): Promise<void> => {
    runInAction(() => {
      this.requestStates.loadingStats = true;
      this.requestStates.statsError = null;
    });
    try {
      const response = await this.engine.query(statsQuery);
      runInAction(() => {
        this.participationSummary = transformParticipationSummary(
          response.participationSummary as Dhis2SqlViewResponse,
        );
        this.eoiSummary = transformEoiSummary(response.eoiSummary as Dhis2SqlViewResponse);
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

  init = async (): Promise<void> => {
    await this.bootstrap();
    // These can run in parallel and don't block basic app functionality
    this.loadSupportingMetadata();
    this.loadDashboardStats();
    this.fetchSmsCredits();
  };
}

export default MetadataStore;
