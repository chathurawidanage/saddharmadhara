import {
  DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE,
  DHIS2_PROGRAM,
  DHIS2_RETREAT_DATA_ELEMENT,
  DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT,
  DHIS2_ROOT_ORG_UNIT,
  DHIS2_SPECIAL_COMMENT_DATA_ELEMENT,
  DHIS2_SPECIAL_COMMENT_PROGRAM_STAGE,
  DHIS2_SUBMIT_FORM_URL,
  DHIS2_TRACKED_ENTITY_TYPE,
  SURVEY_JS_NAME_TO_D2_TRACKED_ENTITY_ATTRIBUTES_MAP,
} from "../dhis2";
import { EXISTING_YOGI_ENROLLMENT_ID_PROPERTY, SURVEY_TIME_LIMIT_SECONDS } from "../properties";
import { SurveyModel } from "survey-core";

const dataToAttributesAndEvents = (data) => {
  let Photo = data.Photo?.find((el) => el !== undefined)?.content;

  let surveyJsAttributes = {
    ...data,
    // Primary ID is used to enforce a mandatory Id in DHIS2 end since
    // it can't make either nic or passport mandatory out of box
    PrimaryId: [data.NIC, data.Passport].find((el) => el !== undefined),
    Photo,
  };

  let events = [];

  // special comment is saved as an event and applicants can send them multiple times
  if (surveyJsAttributes.SpecialComments) {
    events.push({
      occurredAt: Date.now(),
      programStage: DHIS2_SPECIAL_COMMENT_PROGRAM_STAGE,
      orgUnit: DHIS2_ROOT_ORG_UNIT,
      status: "COMPLETED",
      dataValues: [
        {
          occurredAt: Date.now(),
          dataElement: DHIS2_SPECIAL_COMMENT_DATA_ELEMENT,
          value: surveyJsAttributes.SpecialComments,
        },
      ],
    });
    delete surveyJsAttributes.SpecialComments;
  }

  // retreats are saved as events and applicants can send them multiple times
  if (surveyJsAttributes.Retreats) {
    for (let retreat of surveyJsAttributes.Retreats) {
      events.push({
        occurredAt: Date.now(),
        programStage: DHIS2_EXPRESSION_OF_INTEREST_PROGRAM_STAGE,
        orgUnit: DHIS2_ROOT_ORG_UNIT,
        status: "COMPLETED",
        dataValues: [
          {
            occurredAt: Date.now(),
            dataElement: DHIS2_RETREAT_DATA_ELEMENT,
            value: retreat,
          },
          {
            occurredAt: Date.now(),
            dataElement: DHIS2_RETREAT_SELECTION_STATE_DATA_ELEMENT,
            value: "applied",
          },
        ],
      });
    }
    delete surveyJsAttributes.Retreats;
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
    headers: new Headers({ "content-type": "application/json" }),
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
    headers: new Headers({ "content-type": "application/json" }),
    body: JSON.stringify({
      events: events.map((event) => {
        event.enrollment = enrollment;
        return event;
      }),
    }),
  });
};

const onComplete = (survey:SurveyModel, options) => {
  if (survey.timeSpent >= SURVEY_TIME_LIMIT_SECONDS) {
    options.showSaveError("You spent more time on the application than allocated.");
    return;
  }

  options.showSaveInProgress();

  let { attributes, events } = dataToAttributesAndEvents(survey.data);

  let existingYogiId = survey.getPropertyValue(EXISTING_YOGI_ENROLLMENT_ID_PROPERTY);

  (existingYogiId
    ? postEventsOnlyForExistingYogi(existingYogiId, events)
    : postNewYogi(attributes, events)
  )
    .then((response) => {
      if (!response.ok) {
        options.showSaveError();
      } else {
        options.showSaveSuccess();
      }
    })
    .catch((err) => {
      console.error("Error in saving", err);
      options.showSaveError();
    });
};

export default onComplete;
