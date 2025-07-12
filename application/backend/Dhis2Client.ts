"use server";

/**
 * This file content can be publicly callable. Add only functions that needs to be called from the frontend. Don't expose any PII.
 */
import {
  DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE,
  DHIS2_PARTICIPATION_PROGRAM_STAGE,
  DHIS2_PROGRAM,
  DHIS2_RETREAT_DATA_ELEMENT,
  DHIS2_RETREAT_DATE_ATTRIBUTE,
  DHIS2_RETREAT_DISABLED_ATTRIBUTE,
  DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT,
  DHIS2_RETREATS_CODE_ATTRIBUTE,
  DHIS2_RETREATS_OPTION_SET,
  dhis2Endpoint,
  dhis2Token,
} from "../dhis2Constants";

export async function getRetreatByCode(code: string) {
  const optionsUrl = new URL(
    "optionSets/" + DHIS2_RETREATS_OPTION_SET,
    dhis2Endpoint,
  );
  optionsUrl.searchParams.set("fields", "options[code,attributeValues]");
  const optionsResponse = await fetch(optionsUrl, {
    method: "GET",
    headers: {
      Authorization: dhis2Token,
    },
  }).then((res) => res.json());

  const foundRetreat = optionsResponse?.options?.find(
    (option) =>
      option?.attributeValues?.find(
        (attr) => attr?.attribute?.id === DHIS2_RETREATS_CODE_ATTRIBUTE,
      )?.value === code,
  );

  if (foundRetreat) {
    return flattenRetreatOption(foundRetreat);
  }
  return null;
}

export async function getExpressionOfInterestEvent(
  teiId: string,
  retreatCode: string,
) {
  const trackedEntitiesUrl = new URL(
    "tracker/trackedEntities/" + teiId,
    dhis2Endpoint,
  );
  trackedEntitiesUrl.searchParams.set("fields", "enrollments[events]");

  const trackedEntitiesResponse = await fetch(trackedEntitiesUrl, {
    method: "GET",
    headers: {
      Authorization: dhis2Token,
    },
  }).then((res) => res.json());

  for (const event of trackedEntitiesResponse.enrollments[0].events) {
    if (event?.programStage === DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE) {
      for (const dataValue of event.dataValues) {
        if (
          dataValue?.dataElement === DHIS2_RETREAT_DATA_ELEMENT &&
          dataValue?.value === retreatCode
        ) {
          return event;
        }
      }
    }
  }
  return null;
}

export async function uploadFile(formData: FormData): Promise<string> {
  return fetch(new URL("fileResources", dhis2Endpoint), {
    method: "POST",
    body: formData,
    headers: {
      Authorization: dhis2Token,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data?.httpStatusCode !== 202) {
        throw new Error("Failed to upload the file");
      }
      return data?.response?.fileResource?.id;
    });
}

export async function saveTrackerPayload(trackerPayload) {
  // todo consider adding a captcha if we want to avoid spam
  try {
    let trackerUrl = new URL("tracker", dhis2Endpoint);
    trackerUrl.searchParams.set("async", "false");
    let response = await fetch(trackerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: dhis2Token,
      },
      body: JSON.stringify(trackerPayload),
    });
    return response.ok;
  } catch (error) {
    console.error("Error in saving", error);
    return false;
  }
}

const getRetreatEngagement = async (enrollment?: string) => {
  let retreatEngagement = {
    [DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE]: new Set(),
    [DHIS2_PARTICIPATION_PROGRAM_STAGE]: new Set(),
  };

  if (enrollment === undefined) {
    return retreatEngagement;
  }
  let eventsUrl = new URL("tracker/enrollments/" + enrollment, dhis2Endpoint);
  eventsUrl.searchParams.set(
    "fields",
    "events[programStage,dataValues[dataElement,value]]",
  );
  let enrollmentsResponse = await fetch(eventsUrl, {
    method: "GET",
    headers: {
      Authorization: dhis2Token,
    },
  }).then((res) => res.json());

  enrollmentsResponse?.events.forEach((event) => {
    if (
      event.programStage === DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE ||
      event.programStage === DHIS2_PARTICIPATION_PROGRAM_STAGE
    ) {
      let engagedRetreat = event.dataValues.find(
        (e) => e.dataElement === DHIS2_RETREAT_DATA_ELEMENT,
      )?.value;
      if (engagedRetreat) {
        retreatEngagement[event.programStage].add(engagedRetreat);
      }
    }
  });
  return retreatEngagement;
};

export async function isAcceptingApplications() {
  let dataStoreUrl = new URL(
    "dataStore/saddharmadhara/applications",
    dhis2Endpoint,
  );
  try {
    let response = await fetch(dataStoreUrl, {
      method: "GET",
      headers: {
        Authorization: dhis2Token,
      },
    }).then((res) => res.json());
    return response.accepting;
  } catch (e) {
    return true;
  }
}

export async function getEligibleRetreats(enrollment?: string) {
  let optionSetUrl = new URL(
    "optionSets/" + DHIS2_RETREATS_OPTION_SET,
    dhis2Endpoint,
  );
  optionSetUrl.searchParams.set("fields", "options[code,name,attributeValues]");
  let optionsResponse = await fetch(optionSetUrl, {
    method: "GET",
    headers: {
      Authorization: dhis2Token,
    },
  }).then((res) => res.json());

  let retreatEngagement = await getRetreatEngagement(enrollment);

  return optionsResponse?.options
    ?.map((option) => {
      return flattenRetreatOption(option);
    })
    .filter((option) => {
      let retreatDisabled = option.attributes[DHIS2_RETREAT_DISABLED_ATTRIBUTE];
      return retreatDisabled !== "true";
    })
    .filter((option) => {
      let retreatDate = option.attributes[DHIS2_RETREAT_DATE_ATTRIBUTE];
      return retreatDate && new Date(retreatDate).getTime() > Date.now();
    })
    .filter((option) => {
      return (
        !retreatEngagement[DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE].has(
          option.value,
        ) &&
        !retreatEngagement[DHIS2_PARTICIPATION_PROGRAM_STAGE].has(option.code)
      );
    });
}

export async function getExistingEnrollment(
  attribute: string,
  value: string,
): Promise<string> {
  if (!attribute || !value) {
    return Promise.reject("program, attribute and value are required");
  }

  let url = new URL("trackedEntityInstances.json", dhis2Endpoint);
  url.searchParams.set("fields", "enrollments[enrollment]");
  url.searchParams.set("programStatus", "ACTIVE");
  url.searchParams.set("program", DHIS2_PROGRAM);
  url.searchParams.set("ouMode", "ACCESSIBLE");
  url.searchParams.set("filter", attribute + ":eq:" + value);

  let response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: dhis2Token,
    },
  });

  let responseJson = await response.json();
  if (
    responseJson?.trackedEntityInstances?.[0]?.enrollments?.[0]?.enrollment !==
    undefined
  ) {
    return responseJson.trackedEntityInstances[0].enrollments[0].enrollment;
  } else {
    return Promise.reject("No enrollment found for this attribute and value");
  }
}

export async function confirmAttendance(event: any, attending: boolean) {
  let url = new URL("tracker", dhis2Endpoint);
  url.searchParams.set("async", "false");
  url.searchParams.set("importStrategy", "UPDATE");

  const dataValues = event.dataValues.filter(
    (dv) => dv.dataElement !== DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT,
  );

  let response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: dhis2Token,
    },
    body: JSON.stringify({
      events: [
        {
          ...event,
          dataValues: [
            ...dataValues,
            {
              dataElement: DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT,
              value: attending ? "selected" : "unattending",
            },
          ],
        },
      ],
    }),
  });
  return response.ok;
}

function flattenRetreatOption(option) {
  return {
    value: option?.code,
    text: option?.name,
    attributes: option?.attributeValues?.reduce((map, elem) => {
      map[elem.attribute.id] = elem.value;
      return map;
    }, {}),
  };
}
