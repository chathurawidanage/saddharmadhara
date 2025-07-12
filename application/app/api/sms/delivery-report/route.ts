import {
  DHIS2_RETREAT_INVITATION_SENT_DATA_ELEMENT,
  dhis2Endpoint,
  dhis2Token,
} from "../../../../dhis2Constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const campaignId = searchParams.get("campaignId");
  const msisdn = searchParams.get("msisdn");
  const status = searchParams.get("status");

  console.log("Delivery Report Received:", {
    campaignId,
    msisdn,
    status,
  });

  if (status === "1") {
    // sent
    // ignore as we have handled that already during the send call
    return new Response("OK", {
      status: 200,
    });
  }

  // get event id from dhis2 datastore
  const eventId = await getEventIdForSmsCampaignId(campaignId);

  if (eventId) {
    await changeRetreatInvitationStatus(
      eventId,
      getDhis2InvitationStatus(status),
    );
  }

  return new Response("OK", {
    status: 200,
  });
}

async function changeRetreatInvitationStatus(eventId: string, status: string) {
  console.log("changing status of", eventId, "to", status);
  const getEventUrl = new URL("tracker/events/" + eventId, dhis2Endpoint);
  let eventResponse = await fetch(getEventUrl, {
    method: "GET",
    headers: {
      Authorization: dhis2Token,
    },
  });

  if (!eventResponse.ok) {
    return false;
  }

  const eventJson = await eventResponse.json();

  const dataValues = eventJson.dataValues.filter(
    (dv) => dv.dataElement !== DHIS2_RETREAT_INVITATION_SENT_DATA_ELEMENT,
  );

  const url = new URL("events/" + eventId, dhis2Endpoint);
  let response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: dhis2Token,
    },
    body: JSON.stringify({
      program: eventJson.program,
      programStage: eventJson.programStage,
      status: "COMPLETED",
      dataValues: [
        ...dataValues,
        {
          dataElement: DHIS2_RETREAT_INVITATION_SENT_DATA_ELEMENT,
          value: status,
        },
      ],
    }),
  });
  return response.ok;
}

async function getEventIdForSmsCampaignId(smsCampaignId: string) {
  const url = new URL(
    "dataStore/invitation-sms/" + smsCampaignId,
    dhis2Endpoint,
  );
  let response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: dhis2Token,
    },
  }).then((res) => res.json());
  return response.eventId;
}

function getDhis2InvitationStatus(status: string) {
  if (status === "2" || status === "4") {
    return "failed";
  } else if (status === "3") {
    return "delivered";
  }
  return "sent";
}
