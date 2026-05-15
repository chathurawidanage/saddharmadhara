/**
 * Retreat related utility functions
 */

/**
 * Calculates the end date of a retreat
 * @param {Date} startDate
 * @param {number} noOfDays
 * @returns {Date}
 */
export const getRetreatEndDate = (startDate, noOfDays) => {
  if (!startDate || !noOfDays) return startDate;
  let endDate = new Date(startDate.getTime() + noOfDays * 24 * 60 * 60 * 1000);
  return endDate;
};

/**
 * Checks if a retreat can be finalized
 * @param {Object} retreat
 * @returns {boolean}
 */
export const canFinalizeRetreat = (retreat) => {
  if (!retreat || retreat.finalized) return false;
  const endDate = getRetreatEndDate(retreat.date, retreat.noOfDays);
  return Date.now() >= endDate.getTime();
};

/**
 * Checks if a retreat is a general retreat
 * @param {Object} retreat
 * @returns {boolean}
 */
export const isGeneralRetreat = (retreat) => {
  return (
    retreat?.retreatType?.toLowerCase().includes("general") ||
    retreat?.retreatType?.toLowerCase().includes("වැඩසටහන")
  );
};

/**
 * Returns a formatted display range for the retreat dates
 * @param {Object} retreat
 * @param {string} locale
 * @returns {string}
 */
export const getRetreatDisplayRange = (retreat, locale = "en-LK") => {
  if (!retreat?.date) return "";
  const startDate = retreat.date;
  const endDate = getRetreatEndDate(startDate, retreat.noOfDays);

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
