import {
  DHIS2_API_URL,
  DHIS2_PROGRAM,
  DHIS2_ROOT_ORG_UNIT,
  DHIS2_TRACKED_ENTITY_TYPE,
  SURVEY_JS_NAME_TO_D2_TRACKED_ENTITY_ATTRIBUTES_MAP,
} from "../dhis2";

const onComplete = (survey, options) => {
  options.showSaveInProgress();

  let Photo = survey.data.Photo?.find((el) => el !== undefined)?.content;

  let attributes = {
    ...survey.data,
    PriamaryId: [survey.data.NIC, survey.data.Passport].find(
      (el) => el !== undefined
    ),
    Photo,
  };

  let events = undefined;

  if (attributes.SpecialComment) {
    events = [
      {
        programStage: "owqAYpdS5dr",
        orgUnit: DHIS2_ROOT_ORG_UNIT,
        dataValues: [
          {
            occurredAt: Date.now(),
            dataElement: "PH2ygv78F19",
            value: attributes.SpecialComment,
          },
        ],
      },
    ];
    delete attributes.SpecialComment;
  }

  fetch(new URL("submitForm", DHIS2_API_URL), {
    method: "POST",
    body: JSON.stringify({
      trackedEntities: [
        {
          trackedEntityType: DHIS2_TRACKED_ENTITY_TYPE,
          orgUnit: DHIS2_ROOT_ORG_UNIT,
          attributes: Object.entries(attributes)
            .filter(
              (entry) =>
                SURVEY_JS_NAME_TO_D2_TRACKED_ENTITY_ATTRIBUTES_MAP[entry[0]]
            )
            .map((entry) => {
              return {
                attribute:
                  SURVEY_JS_NAME_TO_D2_TRACKED_ENTITY_ATTRIBUTES_MAP[entry[0]],
                value: entry[1],
              };
            }),
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
  }).then((response) => {
    if (response.status !== 200) {
      options.showSaveError();
    } else {
      options.showSaveSuccess();
    }
  });
};

export default onComplete;
