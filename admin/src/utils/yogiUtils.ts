import { Retreat, Yogi, EoiSummary, MaritalState, SelectionState, YogiPriority, AttendanceState } from "../types/domain";
import { isGeneralRetreat, isSilentRetreat } from "./retreatUtils";

export const SELECTION_PRIORITY_SORT = "selection-priority";
export const AGE_SORT = "age";

export interface YogiSortScoreBreakdown {
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
  } else if (
    yogiObj.attributes.priority === YogiPriority.TRUST_MEMBER ||
    yogiObj.attributes.priority === YogiPriority.TRUST_MEMBERS_FAMILY
  ) {
    sStatus = 40;
    statusReason = `Trust Member / Trust Member's Family`;
  }

  // 2. Age Score (S_age)
  let sAge = 0;
  let ageReason = "Date of Birth not provided";
  if (yogiObj.attributes.dob) {
    const age = Math.floor(
      (Date.now() - new Date(yogiObj.attributes.dob).getTime()) / 31557600000,
    );
    if (age >= 20 && age <= 40) {
      sAge = 50;
      ageReason = `Age ${age} (Young adult: 20-40)`;
    } else if (age > 40 && age <= 70) {
      sAge = 30 + 1.33 * Math.abs(55 - age);
      ageReason = `Age ${age} (Formula: 30 + 1.33 * |55 - age| = ${sAge.toFixed(2)})`;
    } else {
      sAge = 0;
      ageReason = `Age ${age} (Outside priority range)`;
    }
  }

  // 3. Participation Score (S_participation)
  let nGeneral = 0;
  let nSilent = 0;
  Object.values(yogiObj.participation || {}).forEach((p) => {
    if (p.attendance === AttendanceState.ATTENDED) {
      const retreat = allRetreats.find((r) => r.code === p.retreat);
      if (retreat) {
        if (isGeneralRetreat(retreat)) {
          nGeneral++;
        } else {
          nSilent++;
        }
      }
    }
  });

  let sParticipation = 100;
  let participationReason = `Base 100`;
  if (currentRetreat && isGeneralRetreat(currentRetreat)) {
    sParticipation = 100 - 20 * nGeneral + 10 * nSilent;
    participationReason = `Attended: ${nGeneral} General (${-20} each), ${nSilent} Silent (${10} each) with base 100`;
  } else if (currentRetreat && isSilentRetreat(currentRetreat)) {
    sParticipation = 100 - 10 * nSilent;
    participationReason = `Attended: ${nSilent} Silent (${-10} each) with base 100`;
  }

  // 3b. Penalties (S_penalty)
  let sPenalty = 0;
  let penaltyReason = "No penalties";

  let hasNoShowLastYear = false;
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  Object.values(yogiObj.participation || {}).forEach((p) => {
    if (p.attendance === AttendanceState.NOSHOW) {
      const retreat = allRetreats.find((r) => r.code === p.retreat);
      if (retreat && retreat.date) {
        const retreatDate = new Date(retreat.date);
        if (retreatDate >= oneYearAgo) {
          hasNoShowLastYear = true;
        }
      }
    }
  });

  if (hasNoShowLastYear) {
    sPenalty = -25;
    penaltyReason = "No-show within last year (-25)";
  }

  // 4. Dynamic Flexibility Multiplier (M_flex)
  // D_effective: count of retreats requested by the yogi that still have open capacity for their gender
  let dEffective = 0;
  const requestedRetreatCodes = Object.keys(yogiObj.expressionOfInterests || {});

  requestedRetreatCodes.forEach((code) => {
    const retreat = allRetreats.find((r) => r.code === code);
    if (retreat) {
      if (currentRetreat?.season && retreat.season !== currentRetreat.season) {
        return;
      }
      const totalCapacity = parseInt(retreat.totalYogis, 10) || 0;
      // We don't have gender-specific occupancy in eoiSummary, using total as proxy
      const currentCount = eoiSummary.filter(
        (e) =>
          e.retreatCode === code &&
          (e.state === SelectionState.SELECTED ||
            e.state === SelectionState.WAITING),
      ).length;

      if (currentCount < totalCapacity) {
        dEffective++;
      }
    }
  });

  // todo if yogi has been selected (pending or selected) 
  // to a retreat in this season, that yogi should get a huge nerf like -500

  let mFlex = 1;
  let mFlexReason = "Not applicable (Season not defined)";

  if (currentRetreat?.season) {
    let seasonRetreatCount = 4;
    const retreatsInSeason = allRetreats.filter(
      (r) => r.season === currentRetreat.season,
    );
    if (retreatsInSeason.length > 0) {
      seasonRetreatCount = retreatsInSeason.length;
    }
    mFlex = 1 + 0.1 * (seasonRetreatCount - dEffective);
    mFlexReason = `Formula: 1 + 0.1 * (${seasonRetreatCount} season retreats - ${dEffective} open requests) = ${mFlex.toFixed(2)}`;
  }

  const total = Math.floor((sStatus + sAge + sParticipation + sPenalty) * mFlex);

  return {
    total,
    breakdown: {
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
