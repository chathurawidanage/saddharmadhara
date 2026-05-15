/**
 * Service for handling retreat invitations and SMS communications
 */

/**
 * Normalizes phone number to 07xxxxxxxx format
 * @param {string} phone
 * @returns {string}
 */
export const normalizePhoneNumber = (phone) => {
  if (!phone) return "";
  return phone.replace(/^\+94/, "0");
};

/**
 * Generates the invitation message in Sinhala
 * @param {string} teiId
 * @param {string} teiFullName
 * @param {string} retreatCode
 * @param {Date} retreatFrom
 * @param {Date} retreatTo
 * @param {string} deadLine
 * @param {string} retreatType
 * @returns {string}
 */
export const getInvitationMessage = (
  teiId,
  teiFullName,
  retreatCode,
  retreatFrom,
  retreatTo,
  deadLine,
  retreatType,
) => {
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
පැමිණීම / නොපැමිණීම:`;
};

/**
 * Sends an invitation SMS via the external SMS API
 * @param {string} message
 * @param {string} teiMobile
 * @param {string} token
 * @returns {Promise<Response>}
 */
export const sendInvitationSms = async (message, teiMobile, token) => {
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
 * @param {Object} engine
 * @param {number} expireTimestamp
 * @returns {Promise<Object>} { key, uid }
 */
export const createInvitationToken = async (engine, expireTimestamp) => {
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
 * @param {Object} engine
 * @param {string} tokenId
 */
export const deleteInvitationToken = async (engine, tokenId) => {
  await engine.mutate({
    type: "delete",
    resource: "apiToken",
    id: tokenId,
  });
};

/**
 * Records an SMS campaign in the DHIS2 DataStore
 * @param {Object} engine
 * @param {string} campaignId
 * @param {string} eventId
 */
export const recordSmsCampaign = async (engine, campaignId, eventId) => {
  await engine.mutate({
    type: "create",
    resource: "dataStore/invitation-sms/" + campaignId,
    data: {
      eventId: eventId,
    },
  });
};

export const sendRetreatInvitations = async ({
  engine,
  retreat,
  yogis,
  confirmationDeadline,
  onProgress,
  onResult,
}) => {
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
          yogi.attributes.fullName,
          retreat.retreatCode,
          retreat.date,
          retreat.endDate,
          confirmationDeadline,
          retreat.retreatType,
        ),
        yogi.attributes.mobile,
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
