import { Retreat, Yogi } from "../types/domain";

export const SELECTION_PRIORITY_SORT = "selection-priority";
export const AGE_SORT = "age";

export const getYogiSortScore = (yogiObj: Yogi) => {
  console.log(yogiObj);
  // reverends comes first
  let score = 0;
  if (yogiObj.attributes.maritalState === "reverend") {
    score += Math.pow(10, 5);
  }

  if (
    yogiObj.attributes.priority?.toLowerCase() ===
    "trust_member"
  ) {
    score += Math.pow(10, 4);
  }

  if (
    yogiObj.attributes.priority?.toLowerCase() ===
    "trust_members_family"
  ) {
    score += Math.pow(10, 3);
  }

  return score;
};

export const selectionPrioritySorter = (y1: Yogi, y2: Yogi, retreat: Retreat) => {
  const y1Score = getYogiSortScore(y1);
  const y2Score = getYogiSortScore(y2);

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

export const ageSorter = (y1: Yogi, y2: Yogi, retreat: Retreat) => {
  const dobY1 = new Date(y1.attributes.dob || "");
  const dobY2 = new Date(y2.attributes.dob || "");

  let diff = dobY1.getTime() - dobY2.getTime();

  if (isNaN(diff)) diff = 0;

  if (diff === 0) {
    return selectionPrioritySorter(y1, y2, retreat);
  } else {
    return diff;
  }
};

export const sortYogiList = (
  yogiList: Yogi[],
  retreat: Retreat,
  sortBy: string = SELECTION_PRIORITY_SORT,
) => {
  if (sortBy === SELECTION_PRIORITY_SORT) {
    yogiList.sort((a, b) => {
      return selectionPrioritySorter(a, b, retreat);
    });
  } else if (sortBy === AGE_SORT) {
    yogiList.sort((a, b) => {
      return ageSorter(a, b, retreat);
    });
  }
};
