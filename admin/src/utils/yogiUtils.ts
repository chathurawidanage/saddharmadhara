import { Retreat, Yogi, EoiSummary, MaritalState, SelectionState, YogiPriority, AttendanceState, Gender } from "../types/domain";
import { isGeneralRetreat, isSilentRetreat } from "./retreatUtils";

export const SELECTION_PRIORITY_SORT = "selection-priority";
export const AGE_SORT = "age";
export const PARTICIPATION_DEDUCTION_YEARS = 2;
export const FIRST_TIME_YOGI_BOOST = 25;
export const ORDINATION_INTENDED_BOOST = 25;

export interface StatusBreakdown {
  score: number;
  label: string;
}

export interface AgeBreakdown {
  score: number;
  age: number | null;
  categoryLabel: string;
  details: string;
}

export interface BreakdownLineItem {
  label: string;
  points: number;
  type?: "base" | "deduction" | "bonus" | "penalty" | "info";
}

export interface ParticipationBreakdown {
  score: number;
  items: BreakdownLineItem[];
}

export interface PenaltyBreakdown {
  score: number;
  items: BreakdownLineItem[];
}

export interface FlexBreakdown {
  multiplier: number;
  seasonRetreatCount: number;
  openRequestsCount: number;
  isApplicable: boolean;
  details: string;
}

export interface YogiSortScoreBreakdown {
  status: StatusBreakdown;
  age: AgeBreakdown;
  participation: ParticipationBreakdown;
  penalty: PenaltyBreakdown;
  flexibility: FlexBreakdown;

  // Primitive properties preserved for backwards compatibility
  statusScore: number;
  statusReason: string;
  ageScore: number;
  ageReason: string;
  participationScore: number;
  participationReason: string;
  penaltyScore: number;
  penaltyReason: string;
  mFlex: number;
  mFlexReason: string;
}

export const getYogiSortScore = (
  yogiObj: Yogi,
  allRetreats: Retreat[] = [],
  eoiSummary: EoiSummary[] = [],
  currentRetreat?: Retreat,
): { total: number; breakdown: YogiSortScoreBreakdown } => {
  // 1. Status Score (S_status)
  let sStatus = 0;
  let statusReason = "Normal Status";

  if (yogiObj.attributes.maritalState === MaritalState.REVEREND) {
    sStatus = 9999;
    statusReason = "Reverend Status";
  } else {
    const statusReasons: string[] = [];

    if (yogiObj.attributes.priority === YogiPriority.TRUST_MEMBER) {
      sStatus += 40;
      statusReasons.push("Trust / Saddharmasena Member");
    } else if (yogiObj.attributes.priority === YogiPriority.TRUST_MEMBERS_FAMILY) {
      sStatus += 40;
      statusReasons.push("Trust / Saddharmasena Member's Family");
    }

    if (yogiObj.attributes.ordinationIntended) {
      const specifiedOn = yogiObj.attributes.ordinationIntentionSpecifiedOn;
      let isWithinLastTwoYears = true;
      if (specifiedOn) {
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        const specifiedDate = specifiedOn instanceof Date ? specifiedOn : new Date(specifiedOn);
        if (!isNaN(specifiedDate.getTime())) {
          isWithinLastTwoYears = specifiedDate >= twoYearsAgo;
        }
      }

      if (isWithinLastTwoYears) {
        sStatus += ORDINATION_INTENDED_BOOST;
        let dateDetail = "";
        if (specifiedOn) {
          const d = specifiedOn instanceof Date ? specifiedOn : new Date(specifiedOn);
          if (!isNaN(d.getTime())) {
            dateDetail = ` (specified on ${d.toISOString().split("T")[0]})`;
          }
        }
        statusReasons.push(`Intends Ordination in coming 2 years${dateDetail} (+${ORDINATION_INTENDED_BOOST})`);
      }
    }

    if (statusReasons.length > 0) {
      statusReason = statusReasons.join(", ");
    }
  }

  const statusBreakdown: StatusBreakdown = {
    score: sStatus,
    label: statusReason,
  };

  // 2. Age Score (S_age)
  let sAge = 0;
  let ageReason = "Date of Birth not provided";
  let yogiAge: number | null = null;
  let ageCategoryLabel = "Not provided";
  let ageDetails = "Date of birth not provided";

  if (yogiObj.attributes.dob) {
    const age = Math.floor(
      (Date.now() - new Date(yogiObj.attributes.dob).getTime()) / 31557600000,
    );
    yogiAge = age;
    if (age >= 20 && age <= 40) {
      sAge = 50;
      ageCategoryLabel = "Young adult (20-40)";
      ageDetails = `Age ${age} • Young adult priority (20-40)`;
      ageReason = `Age ${age} (Young adult: 20-40)`;
    } else if (age > 40 && age <= 70) {
      sAge = 30 + 1.33 * Math.abs(55 - age);
      ageCategoryLabel = "Priority age range (41-70)";
      ageDetails = `Age ${age} • Formula: 30 + 1.33 × |55 - ${age}| = ${sAge.toFixed(2)}`;
      ageReason = `Age ${age} (Formula: 30 + 1.33 * |55 - age| = ${sAge.toFixed(2)})`;
    } else {
      sAge = 0;
      ageCategoryLabel = "Outside priority range";
      ageDetails = `Age ${age} • Outside priority range (0 pts)`;
      ageReason = `Age ${age} (Outside priority range)`;
    }
  }

  const ageBreakdown: AgeBreakdown = {
    score: sAge,
    age: yogiAge,
    categoryLabel: ageCategoryLabel,
    details: ageDetails,
  };

  // 3. Participation Score (S_participation)
  const deductionCutoffDate = new Date();
  deductionCutoffDate.setFullYear(deductionCutoffDate.getFullYear() - PARTICIPATION_DEDUCTION_YEARS);

  let nGeneral = 0;
  let nSilent = 0;
  const attendedGeneralRetreats: string[] = [];
  const attendedSilentRetreats: string[] = [];

  Object.values(yogiObj.participation || {}).forEach((p) => {
    if (p.attendance === AttendanceState.ATTENDED) {
      const retreat = allRetreats.find((r) => r.code === p.retreat);
      if (retreat && retreat.date) {
        const retreatDate = new Date(retreat.date);
        if (retreatDate >= deductionCutoffDate) {
          const retreatNameOrCode = retreat.retreatCode || p.retreat;
          if (isGeneralRetreat(retreat)) {
            nGeneral++;
            attendedGeneralRetreats.push(retreatNameOrCode);
          } else {
            nSilent++;
            attendedSilentRetreats.push(retreatNameOrCode);
          }
        }
      }
    }
  });

  let sParticipation = 100;
  let participationReason = `Base 100 (considering last ${PARTICIPATION_DEDUCTION_YEARS} years)`;
  const participationItems: BreakdownLineItem[] = [
    { label: "Base score", points: 100, type: "base" },
  ];

  if (currentRetreat && isGeneralRetreat(currentRetreat)) {
    sParticipation = 100 - 20 * nGeneral + 10 * nSilent;
    participationReason = `Attended: ${nGeneral} General (${-20} each), ${nSilent} Silent (${10} each) with base 100 (last ${PARTICIPATION_DEDUCTION_YEARS} years)`;
    if (nGeneral > 0) {
      participationItems.push({
        label: `Attended General (${attendedGeneralRetreats.join(", ")})`,
        points: -20 * nGeneral,
        type: "deduction",
      });
    }
    if (nSilent > 0) {
      participationItems.push({
        label: `Attended Silent (${attendedSilentRetreats.join(", ")})`,
        points: 10 * nSilent,
        type: "bonus",
      });
    }
  } else if (currentRetreat && isSilentRetreat(currentRetreat)) {
    sParticipation = 100 - 10 * nSilent;
    participationReason = `Attended: ${nSilent} Silent (${-10} each) with base 100 (last ${PARTICIPATION_DEDUCTION_YEARS} years)`;
    if (nSilent > 0) {
      participationItems.push({
        label: `Attended Silent (${attendedSilentRetreats.join(", ")})`,
        points: -10 * nSilent,
        type: "deduction",
      });
    }
  } else {
    if (nGeneral > 0) {
      participationItems.push({
        label: `Attended General (${attendedGeneralRetreats.join(", ")})`,
        points: -20 * nGeneral,
        type: "deduction",
      });
    }
    if (nSilent > 0) {
      participationItems.push({
        label: `Attended Silent (${attendedSilentRetreats.join(", ")})`,
        points: 10 * nSilent,
        type: "bonus",
      });
    }
  }

  const hasParticipationEver = Object.keys(yogiObj.participation || {}).length > 0;
  const hasBeenSelectedOrPendingEver = Object.entries(
    yogiObj.expressionOfInterests || {}
  ).some(([code, eoi]) => {
    if (currentRetreat && code === currentRetreat.code) {
      return false;
    }
    const stateStr = String(eoi?.state || "").toLowerCase();
    return (
      stateStr === SelectionState.SELECTED ||
      stateStr === SelectionState.PENDING
    );
  });

  if (!hasParticipationEver && !hasBeenSelectedOrPendingEver) {
    sParticipation += FIRST_TIME_YOGI_BOOST;
    participationReason += `, First-time boost (never attended, selected or pending: +${FIRST_TIME_YOGI_BOOST})`;
    participationItems.push({
      label: "First-time Yogi Boost",
      points: FIRST_TIME_YOGI_BOOST,
      type: "bonus",
    });
  }

  const participationBreakdown: ParticipationBreakdown = {
    score: sParticipation,
    items: participationItems,
  };

  // 3b. Penalties (S_penalty)
  let sPenalty = 0;
  let penaltyReason = "No penalties";
  const penaltyItems: BreakdownLineItem[] = [];

  let hasNoShowLastYear = false;
  const noShowRetreatCodes: string[] = [];
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  Object.values(yogiObj.participation || {}).forEach((p) => {
    if (p.attendance === AttendanceState.NOSHOW) {
      const retreat = allRetreats.find((r) => r.code === p.retreat);
      if (retreat && retreat.date) {
        const retreatDate = new Date(retreat.date);
        if (retreatDate >= oneYearAgo) {
          hasNoShowLastYear = true;
          const retreatNameOrCode = retreat.retreatCode || p.retreat;
          noShowRetreatCodes.push(retreatNameOrCode);
        }
      }
    }
  });

  const penaltyReasons: string[] = [];
  if (hasNoShowLastYear) {
    sPenalty += -25;
    const noShowStr = noShowRetreatCodes.length > 0 ? ` (${noShowRetreatCodes.join(", ")})` : "";
    penaltyReasons.push("No-show within last year (-25)");
    penaltyItems.push({
      label: `No-show within last year${noShowStr}`,
      points: -25,
      type: "penalty",
    });
  }

  let selectionInSeasonCount = 0;
  const inSeasonPenaltyItems: string[] = [];
  if (currentRetreat?.season) {
    Object.entries(yogiObj.expressionOfInterests || {}).forEach(([code, eoi]) => {
      if (code === currentRetreat.code) {
        return;
      }
      const retreat = allRetreats.find((r) => r.code === code);
      if (retreat && retreat.season === currentRetreat.season) {
        const rCodeStr = retreat.retreatCode || retreat.name || code;
        if (eoi.state === SelectionState.SELECTED) {
          selectionInSeasonCount++;
          penaltyReasons.push(`SELECTED for retreat: ${rCodeStr}`);
          inSeasonPenaltyItems.push(`SELECTED for ${rCodeStr}`);
        } else if (eoi.state === SelectionState.PENDING) {
          const isPastRetreat = retreat.date && new Date(retreat.date).getTime() < Date.now();
          if (isPastRetreat) {
            penaltyReasons.push(`PENDING (stale: retreat started/ended - no deduction) for retreat: ${rCodeStr}`);
          } else {
            selectionInSeasonCount++;
            penaltyReasons.push(`PENDING for retreat: ${rCodeStr}`);
            inSeasonPenaltyItems.push(`PENDING for ${rCodeStr}`);
          }
        }
      }
    });
  }

  if (selectionInSeasonCount > 0) {
    const seasonPenalty = -25 - 50 * (selectionInSeasonCount - 1);
    sPenalty += seasonPenalty;
    penaltyReasons.push(`Already selected/pending in this season (${inSeasonPenaltyItems.join(", ")}, Penalty: ${seasonPenalty})`);
    penaltyItems.push({
      label: `In-season activity (${inSeasonPenaltyItems.join(", ")})`,
      points: seasonPenalty,
      type: "penalty",
    });
  }

  if (penaltyReasons.length > 0) {
    penaltyReason = penaltyReasons.join(", ");
  }

  const penaltyBreakdown: PenaltyBreakdown = {
    score: sPenalty,
    items: penaltyItems,
  };

  // 4. Dynamic Flexibility Multiplier (M_flex)
  // D_effective: count of active/upcoming retreats requested by the yogi that still have open capacity for their gender
  let dEffective = 0;
  const requestedRetreatCodes = Object.keys(yogiObj.expressionOfInterests || {});

  requestedRetreatCodes.forEach((code) => {
    const retreat = allRetreats.find((r) => r.code === code);
    if (retreat) {
      if (currentRetreat?.season && retreat.season !== currentRetreat.season) {
        return;
      }

      // Exclude retreats already started or finished
      const isPastRetreat = retreat.date && new Date(retreat.date).getTime() < Date.now();
      if (isPastRetreat) {
        return;
      }

      let capacity = parseInt(retreat.totalYogis, 10) || 0;
      if (yogiObj.attributes.gender === Gender.FEMALE && retreat.femaleYogis) {
        capacity = parseInt(retreat.femaleYogis, 10) || 0;
      } else if (yogiObj.attributes.gender === Gender.MALE && retreat.maleYogis) {
        capacity = parseInt(retreat.maleYogis, 10) || 0;
      }

      // Filter by the current yogi's gender to calculate gender-specific occupancy
      const currentCount = eoiSummary.filter(
        (e) =>
          e.retreatCode === code &&
          e.gender === yogiObj.attributes.gender &&
          (e.state === SelectionState.SELECTED ||
            e.state === SelectionState.PENDING),
      ).length;

      if (currentCount < capacity) {
        dEffective++;
      }
    }
  });

  let mFlex = 1;
  let mFlexReason = "Not applicable (Season not defined)";
  let activeSeasonCount = 0;

  if (currentRetreat?.season) {
    let seasonRetreatCount = 4;
    // Exclude past retreats from the active retreats in the season
    const activeRetreatsInSeason = allRetreats.filter(
      (r) => r.season === currentRetreat.season && !(r.date && new Date(r.date).getTime() < Date.now()),
    );
    if (activeRetreatsInSeason.length > 0) {
      seasonRetreatCount = activeRetreatsInSeason.length;
    }
    activeSeasonCount = seasonRetreatCount;
    mFlex = 1 + 0.1 * (seasonRetreatCount - dEffective);
    mFlexReason = `Formula: 1 + 0.1 * (${seasonRetreatCount} active season retreats - ${dEffective} open requests) = ${mFlex.toFixed(2)}`;
  }

  const flexBreakdown: FlexBreakdown = {
    multiplier: mFlex,
    seasonRetreatCount: activeSeasonCount,
    openRequestsCount: dEffective,
    isApplicable: !!currentRetreat?.season,
    details: mFlexReason,
  };

  const total = Math.floor((sStatus + sAge + sParticipation + sPenalty) * mFlex);

  return {
    total,
    breakdown: {
      status: statusBreakdown,
      age: ageBreakdown,
      participation: participationBreakdown,
      penalty: penaltyBreakdown,
      flexibility: flexBreakdown,
      statusScore: sStatus,
      statusReason,
      ageScore: sAge,
      ageReason,
      participationScore: sParticipation,
      participationReason,
      penaltyScore: sPenalty,
      penaltyReason,
      mFlex,
      mFlexReason,
    },
  };
};

export const selectionPrioritySorter = (
  y1: Yogi,
  y2: Yogi,
  retreat: Retreat,
  allRetreats: Retreat[] = [],
  eoiSummary: EoiSummary[] = [],
) => {
  const y1Score = getYogiSortScore(y1, allRetreats, eoiSummary, retreat).total;
  const y2Score = getYogiSortScore(y2, allRetreats, eoiSummary, retreat).total;

  if (y1Score === y2Score) {
    // finally sort by applied date, lowest date comes first
    const y1RegisteredDate = new Date(
      y1.expressionOfInterests[retreat.code].occurredAt,
    );
    const y2RegisteredDate = new Date(
      y2.expressionOfInterests[retreat.code].occurredAt,
    );
    return y1RegisteredDate.getTime() - y2RegisteredDate.getTime();
  }

  // highest score comes first
  return y2Score - y1Score;
};

export const ageSorter = (
  y1: Yogi,
  y2: Yogi,
  retreat: Retreat,
  allRetreats: Retreat[] = [],
  eoiSummary: EoiSummary[] = [],
) => {
  const dobY1 = new Date(y1.attributes.dob || "");
  const dobY2 = new Date(y2.attributes.dob || "");

  let diff = dobY1.getTime() - dobY2.getTime();

  if (isNaN(diff)) diff = 0;

  if (diff === 0) {
    return selectionPrioritySorter(y1, y2, retreat, allRetreats, eoiSummary);
  } else {
    return diff;
  }
};

export const sortYogiList = (
  yogiList: Yogi[],
  retreat: Retreat,
  sortBy: string = SELECTION_PRIORITY_SORT,
  allRetreats: Retreat[] = [],
  eoiSummary: EoiSummary[] = [],
) => {
  if (sortBy === SELECTION_PRIORITY_SORT) {
    yogiList.sort((a, b) => {
      return selectionPrioritySorter(
        a,
        b,
        retreat,
        allRetreats,
        eoiSummary,
      );
    });
  } else if (sortBy === AGE_SORT) {
    yogiList.sort((a, b) => {
      return ageSorter(a, b, retreat, allRetreats, eoiSummary);
    });
  }
};
