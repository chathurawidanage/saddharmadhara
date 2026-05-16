/**
 * Service for handling retreat invitations and SMS communications
 */

import { Yogi, Retreat } from "../types/domain";

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

  return `ඔබ ${new Date(retreatFrom).toLocaleDateString("si-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })} සිට ${plusDateTo.toLocaleDateString("si-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })} දක්වා පැවැත්වෙන සද්ධර්මධාරා ${retreatPrefix}භාවනා වැඩසටහන හා සම්බන්ධවීමට තේරී පත් ව ඇත. ${new Date(
    deadLine,
  ).toLocaleDateString("si-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })} දිනට පෙර පහත යොමුව (Link එක) මගින් ඔබගේ සහභාගි වීම/නොවීම තහවුරු කරන්න.

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
export const createInvitationToken = async (engine: any, expireTimestamp: number): Promise<{ key: string, uid: string }> => {
  const mutation = {
    type: "create",
    resource: "apiToken",
    data: {
      expire: expireTimestamp,
      attributes: [{ type: "MethodAllowedList", allowedMethods: ["GET"] }],
    },
  };
  const response: any = await engine.mutate(mutation);
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
export const deleteInvitationToken = async (engine: any, tokenId: string): Promise<void> => {
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
export const recordSmsCampaign = async (engine: any, campaignId: string, eventId: string): Promise<void> => {
  await engine.mutate({
    type: "create",
    resource: "dataStore/invitation-sms/" + campaignId,
    data: {
      eventId: eventId,
    },
  });
};

interface SendInvitationsParams {
  engine: any;
  retreat: Retreat;
  yogis: any[]; // List of yogis to invite
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
      const sentResponse = await sendInvitationSms(
        getInvitationMessage(
          yogi.id,
          yogi.fullName,
          retreat.code,
          retreat.date,
          retreat.endDate,
          confirmationDeadline,
          retreat.retreatType,
        ),
        yogi.mobile,
        token,
      );

      const sent = sentResponse?.ok;

      if (sent) {
        const sentResponseJson = await sentResponse.json();
        await recordSmsCampaign(
          engine,
          sentResponseJson.campaignId,
          yogi.eventId,
        );
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
