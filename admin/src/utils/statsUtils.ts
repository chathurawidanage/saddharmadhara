import { isGeneralRetreat } from "./retreatUtils";
import { Retreat, ParticipationSummary, EoiSummary } from "../types/domain";

export interface GeneralRetreatStats {
  totalParticipants: number;
  totalApplicants: number;
  oneTimeParticipants: number;
  repeatParticipants: number;
  unableToParticipate: number;
  repeatBreakdown: Record<number, number>;
}

/**
 * Calculates general retreat stats from metadata
 * @param {Retreat[]} retreats
 * @param {ParticipationSummary[]} participationSummary
 * @param {EoiSummary[]} eoiSummary
 * @returns {GeneralRetreatStats}
 */
export const calculateGeneralRetreatStats = (
  retreats: Retreat[],
  participationSummary: ParticipationSummary[],
  eoiSummary: EoiSummary[],
): GeneralRetreatStats => {
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
  const generalRetreatCodes = new Set<string>(
    retreats
      .filter((r) => isGeneralRetreat(r))
      .flatMap((r) => [r.code, r.name]),
  );

  // Process Participation
  const participantCounts: Record<string, number> = {};
  const processedUids = new Set<string>(); // To count unique participants efficiently

  participationSummary.forEach(({ yogiUid, retreatCode }) => {
    if (generalRetreatCodes.has(retreatCode)) {
      participantCounts[yogiUid] = (participantCounts[yogiUid] || 0) + 1;
      processedUids.add(yogiUid);
    }
  });

  const totalParticipants = processedUids.size;
  let oneTimeParticipants = 0;
  let repeatParticipants = 0;

  const repeatBreakdown: Record<number, number> = {};

  Object.values(participantCounts).forEach((count) => {
    if (count === 1) oneTimeParticipants++;
    else if (count > 1) {
      repeatParticipants++;
      repeatBreakdown[count] = (repeatBreakdown[count] || 0) + 1;
    }
  });

  // Process EOI for "Unable to Participate" (aka Waiting for Invitation)
  // Logic: Applied to a General retreat (in EOI) AND never invited to ANY General Retreat AND never participated
  const invitedUids = new Set<string>();
  const applicantUids = new Set<string>();

  eoiSummary.forEach(({ yogiUid, retreatCode, invitationSent }) => {
    if (generalRetreatCodes.has(retreatCode)) {
      applicantUids.add(yogiUid);
      if (invitationSent) {
        invitedUids.add(yogiUid);
      }
    }
  });

  const waitingForInvitationUids = new Set<string>();
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
