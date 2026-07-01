/**
 * Service for handling retreat invitations and SMS communications
 */

import { Retreat } from "../types/domain";
import { Dhis2Engine } from "../types/dhis2";

/**
 * Interface for a yogi being invited to a retreat
 */
export interface InvitationYogi {
  id: string;
  fullName: string;
  mobile: string;
  eventId: string;
}


/**
 * Normalizes phone number to 07xxxxxxxx format
 * @param {string} phone
 * @returns {string}
 */
export const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return "";
  return phone.replace(/^\+94/, "0");
};

/**
 * Formats a date into a modern Sinhala date string (e.g. "2026 මැයි 15")
 * to avoid inconsistencies in system locales (such as lunar months returned on iOS/Safari).
 * @param {string | Date} dateInput
 * @returns {string}
 */
export const formatSinhalaDate = (dateInput: string | Date): string => {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  const sinhalaMonths = [
    "ජනවාරි",
    "පෙබරවාරි",
    "මාර්තු",
    "අප්‍රේල්",
    "මැයි",
    "ජූනි",
    "ජූලි",
    "අගෝස්තු",
    "සැප්තැම්බර්",
    "ඔක්තෝබර්",
    "නොවැම්බර්",
    "දෙසැම්බර්",
  ];

  return `${year} ${sinhalaMonths[month]} ${day}`;
};

/**
 * Generates the invitation message in Sinhala
 * @param {string} teiId
 * @param {string} teiFullName
 * @param {string} retreatCode
 * @param {string | Date} retreatFrom
 * @param {string | Date} retreatTo
 * @param {string | Date} deadLine
 * @param {string} retreatType
 * @returns {string}
 */
export const getInvitationMessage = (
  teiId: string,
  teiFullName: string,
  retreatCode: string,
  retreatFrom: string | Date,
  retreatTo: string | Date,
  deadLine: string | Date,
  retreatType: string,
): string => {
  const plusDateTo = new Date(retreatTo);
  plusDateTo.setDate(plusDateTo.getDate() + 1);

  const retreatPrefix = retreatType === "silent" ? "ස්වයං " : "";

  return `ඔබ ${formatSinhalaDate(retreatFrom)} සිට ${formatSinhalaDate(
    plusDateTo,
  )} දක්වා පැවැත්වෙන සද්ධර්මධාරා ${retreatPrefix}භාවනා වැඩසටහන හා සම්බන්ධවීමට තේරී පත් ව ඇත. ${formatSinhalaDate(
    deadLine,
  )} දිනට පෙර පහත යොමුව (Link එක) මගින් ඔබගේ සහභාගි වීම/නොවීම තහවුරු කරන්න.

https://application.srisambuddhamission.org/confirm/${retreatCode}/${teiId}

එසේ අපහසු නම් පමණක් ඔබගේ සහභාගිත්වය පහත පරිදි 0743208734 අංකයට SMS හෝ Whatsapp පණිවිඩයක් මගින් තහවුරු කරන්න.

වැඩසටහන් අංකය: ${retreatCode}
නම: ${teiFullName}
ජා.හැ.අ./ගමන් බ.ප.අ:
තහවුරු කිරීම:`;
};

/**
 * Sends an invitation SMS via the external SMS API
 * @param {string} message
 * @param {string} teiMobile
 * @param {string} token
 * @returns {Promise<Response>}
 */
export const sendInvitationSms = async (message: string, teiMobile: string, token: string): Promise<Response> => {
  const formattedMobile = normalizePhoneNumber(teiMobile);
  return await fetch("https://application.srisambuddhamission.org/api/sms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `ApiToken ${token}`,
    },
    body: JSON.stringify({
      to: [formattedMobile],
      message,
    }),
  });
};

/**
 * Creates a temporary DHIS2 API token
 * @param {any} engine
 * @param {number} expireTimestamp
 * @returns {Promise<{ key: string, uid: string }>} { key, uid }
 */
export const createInvitationToken = async (
  engine: Dhis2Engine,
  expireTimestamp: number,
): Promise<{ key: string; uid: string }> => {

  const mutation = {
    type: "create",
    resource: "apiToken",
    data: {
      expire: expireTimestamp,
      attributes: [{ type: "MethodAllowedList", allowedMethods: ["GET"] }],
    },
  };
  const response = await engine.mutate(mutation);

  return {
    key: response?.response?.key,
    uid: response?.response?.uid,
  };
};

/**
 * Deletes a DHIS2 API token
 * @param {any} engine
 * @param {string} tokenId
 */
export const deleteInvitationToken = async (
  engine: Dhis2Engine,
  tokenId: string,
): Promise<void> => {

  await engine.mutate({
    type: "delete",
    resource: "apiToken",
    id: tokenId,
  });
};

/**
 * Records an SMS campaign in the DHIS2 DataStore
 * @param {any} engine
 * @param {string} campaignId
 * @param {string} eventId
 */
export const recordSmsCampaign = async (
  engine: Dhis2Engine,
  campaignId: string,
  eventId: string,
): Promise<void> => {

  await engine.mutate({
    type: "create",
    resource: "dataStore/invitation-sms/" + campaignId,
    data: {
      eventId: eventId,
    },
  });
};

interface SendInvitationsParams {
  engine: Dhis2Engine;
  retreat: Retreat;
  yogis: InvitationYogi[]; // List of yogis to invite

  confirmationDeadline: string | Date;
  onProgress?: (progress: { completed: number; total: number }) => void;
  onResult?: (result: { yogiId: string; sent: boolean }) => Promise<void>;
}

export const sendRetreatInvitations = async ({
  engine,
  retreat,
  yogis,
  confirmationDeadline,
  onProgress,
  onResult,
}: SendInvitationsParams): Promise<void> => {
  if (!yogis.length) {
    return;
  }

  const { key: token, uid: tokenId } = await createInvitationToken(
    engine,
    Date.now() + 60 * 60 * 1000,
  );

  try {
    for (let index = 0; index < yogis.length; index++) {
      const yogi = yogis[index];
      let sent = false;
      try {
        const sentResponse = await sendInvitationSms(
          getInvitationMessage(
            yogi.id,
            yogi.fullName,
            retreat.retreatCode,
            retreat.date,
            retreat.endDate,
            confirmationDeadline,
            retreat.retreatType,
          ),
          yogi.mobile,
          token,
        );

        sent = !!sentResponse?.ok;

        if (sent) {
          const sentResponseJson = await sentResponse.json();
          await recordSmsCampaign(
            engine,
            sentResponseJson.campaignId,
            yogi.eventId,
          );
        }
      } catch (error) {
        console.error(`Failed to send invitation to yogi ${yogi.id}:`, error);
        sent = false;
      }

      await onResult?.({
        yogiId: yogi.id,
        sent,
      });

      onProgress?.({
        completed: index + 1,
        total: yogis.length,
      });
    }
  } finally {
    if (tokenId) {
      await deleteInvitationToken(engine, tokenId);
    }
  }
};
