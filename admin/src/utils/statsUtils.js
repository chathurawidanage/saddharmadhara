import { isGeneralRetreat } from "./retreatUtils";

/**
 * Calculates general retreat stats from metadata
 * @param {Array} retreats
 * @param {Array} participationSummary
 * @param {Array} eoiSummary
 * @returns {Object}
 */
export const calculateGeneralRetreatStats = (
  retreats,
  participationSummary,
  eoiSummary,
) => {
  if (!participationSummary || !eoiSummary || !retreats) {
    return {
      totalParticipants: 0,
      totalApplicants: 0,
      oneTimeParticipants: 0,
      repeatParticipants: 0,
      unableToParticipate: 0,
      repeatBreakdown: {},
    };
  }

  // Filter General Retreats
  const generalRetreatCodes = new Set(
    retreats
      .filter((r) => isGeneralRetreat(r))
      .flatMap((r) => [r.code, r.name]),
  );

  // Process Participation
  const participantCounts = {};
  const processedUids = new Set(); // To count unique participants efficiently

  participationSummary.forEach(({ yogiUid, retreatCode }) => {
    if (generalRetreatCodes.has(retreatCode)) {
      participantCounts[yogiUid] = (participantCounts[yogiUid] || 0) + 1;
      processedUids.add(yogiUid);
    }
  });

  const totalParticipants = processedUids.size;
  let oneTimeParticipants = 0;
  let repeatParticipants = 0;

  const repeatBreakdown = {};

  Object.values(participantCounts).forEach((count) => {
    if (count === 1) oneTimeParticipants++;
    else if (count > 1) {
      repeatParticipants++;
      repeatBreakdown[count] = (repeatBreakdown[count] || 0) + 1;
    }
  });

  // Process EOI for "Unable to Participate" (aka Waiting for Invitation)
  // Logic: Applied to a General retreat (in EOI) AND never invited to ANY General Retreat AND never participated
  const invitedUids = new Set();
  const applicantUids = new Set();

  eoiSummary.forEach(({ yogiUid, retreatCode, invitationSent }) => {
    if (generalRetreatCodes.has(retreatCode)) {
      applicantUids.add(yogiUid);
      if (invitationSent) {
        invitedUids.add(yogiUid);
      }
    }
  });

  const waitingForInvitationUids = new Set();
  applicantUids.forEach((uid) => {
    // If never invited AND never participated
    if (!invitedUids.has(uid) && !processedUids.has(uid)) {
      waitingForInvitationUids.add(uid);
    }
  });

  return {
    totalParticipants,
    totalApplicants: applicantUids.size,
    repeatBreakdown,
    oneTimeParticipants,
    repeatParticipants,
    unableToParticipate: waitingForInvitationUids.size,
  };
};
