import { Retreat } from "../types/domain";

/**
 * Retreat related utility functions
 */

/**
 * Calculates the end date of a retreat
 * @param {Date} startDate
 * @param {number | string} noOfDays
 * @returns {Date}
 */
export const getRetreatEndDate = (startDate: Date | null, noOfDays: number | string | null): Date | null => {
  if (!startDate || !noOfDays) return startDate;
  const days = typeof noOfDays === "string" ? parseInt(noOfDays, 10) : noOfDays;
  if (isNaN(days)) return startDate;

  const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
  return endDate;
};

/**
 * Checks if a retreat can be finalized
 * @param {Retreat} retreat
 * @returns {boolean}
 */
export const canFinalizeRetreat = (retreat: Retreat | null): boolean => {
  if (!retreat || retreat.finalized) return false;
  const endDate = getRetreatEndDate(retreat.date, retreat.noOfDays);
  return !!endDate && Date.now() >= endDate.getTime();
};

export const isGeneralRetreat = (retreat: Partial<Retreat> | null): boolean => {
  return retreat?.retreatType?.toLowerCase() === "general";
};

export const isSilentRetreat = (retreat: Partial<Retreat> | null): boolean => {
  return retreat?.retreatType?.toLowerCase() === "silent";
};

/**
 * Returns a formatted display range for the retreat dates
 * @param {Retreat} retreat
 * @param {string} locale
 * @returns {string}
 */
export const getRetreatDisplayRange = (retreat: Partial<Retreat> | null, locale = "en-LK"): string => {
  if (!retreat?.date) return "";
  const startDate = retreat.date;
  const endDate = getRetreatEndDate(startDate, retreat.noOfDays ?? null);
  if (!endDate) return "";

  const startFormatted = startDate.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const endFormatted = endDate.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return `${startFormatted} - ${endFormatted}`;
};
