import {
  DHIS2_PROGRAM,
  DHIS2_ROOT_ORG_UNIT,
  DHIS2_SPECIAL_COMMENT_DATA_ELEMENT,
  DHIS2_SPECIAL_COMMENT_PROGRAM_STAGE,
  DHIS2_SUBMIT_FORM_URL,
  DHIS2_TRACKED_ENTITY_TYPE,
  SURVEY_JS_NAME_TO_D2_TRACKED_ENTITY_ATTRIBUTES_MAP,
} from "../dhis2";
import { EXISTING_YOGI_ID_PROPERTY } from "../properties";

const dataToAttributesAndEvents = (data) => {
  let Photo = data.Photo?.find((el) => el !== undefined)?.content;

  let surveyJsAttributes = {
    ...data,
    // Primary ID is used to enforce a mandatory Id in DHIS2 end since
    // it can't make either nic or passport mandatory out of box
    PriamaryId: [data.NIC, data.Passport].find((el) => el !== undefined),
    Photo,
  };

  let events = undefined;

  // special comment is saved as an event and applicants can send them multiple times
  if (surveyJsAttributes.SpecialComment) {
    events = [
      {
        occurredAt: Date.now(),
        programStage: DHIS2_SPECIAL_COMMENT_PROGRAM_STAGE,
        orgUnit: DHIS2_ROOT_ORG_UNIT,
        status: "COMPLETED",
        dataValues: [
          {
            occurredAt: Date.now(),
            dataElement: DHIS2_SPECIAL_COMMENT_DATA_ELEMENT,
            value: surveyJsAttributes.SpecialComment,
          },
        ],
      },
    ];
    delete surveyJsAttributes.SpecialComment;
  }

  let dhis2Attributes = Object.entries(surveyJsAttributes)
    .filter(
      (entry) => SURVEY_JS_NAME_TO_D2_TRACKED_ENTITY_ATTRIBUTES_MAP[entry[0]]
    )
    .map((entry) => {
      return {
        attribute: SURVEY_JS_NAME_TO_D2_TRACKED_ENTITY_ATTRIBUTES_MAP[entry[0]],
        value: entry[1],
      };
    });

  return {
    attributes: dhis2Attributes,
    events,
  };
};

const postNewYogi = (attributes, events) => {
  return fetch(DHIS2_SUBMIT_FORM_URL, {
    method: "POST",
    headers: new Headers({'content-type': 'application/json'}),
    body: JSON.stringify({
      trackedEntities: [
        {
          trackedEntityType: DHIS2_TRACKED_ENTITY_TYPE,
          orgUnit: DHIS2_ROOT_ORG_UNIT,
          attributes,
          enrollments: [
            {
              orgUnit: DHIS2_ROOT_ORG_UNIT,
              program: DHIS2_PROGRAM,
              enrolledAt: Date.now(),
              occurredAt: Date.now(),
              events,
            },
          ],
        },
      ],
    }),
  });
};

const postEventsOnlyForExistingYogi = (enrollment, events) => {
  return fetch(DHIS2_SUBMIT_FORM_URL, {
    method: "POST",
    headers: new Headers({'content-type': 'application/json'}),
    body: JSON.stringify({
      events: events.map((event) => {
        event.enrollment = enrollment;
        return event;
      }),
    }),
  });
};

const onComplete = (survey, options) => {
  options.showSaveInProgress();

  let { attributes, events } = dataToAttributesAndEvents(survey.data);

  let existingYogiId = survey.getPropertyValue(EXISTING_YOGI_ID_PROPERTY);

  (existingYogiId
    ? postEventsOnlyForExistingYogi(existingYogiId, events)
    : postNewYogi(attributes, events)
  ).then((response) => {
    if (response.status !== 200) {
      options.showSaveError();
    } else {
      options.showSaveSuccess();
    }
  });
};

export default onComplete;
