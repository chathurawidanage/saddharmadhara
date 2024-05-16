import {
  DHIS2_CHECK_EXISTS_URL,
  DHIS2_PROGRAM,
  SURVEY_JS_NAME_TO_D2_TRACKED_ENTITY_ATTRIBUTES_MAP,
} from "../dhis2";
import agreementPage from "../pages/agreement";
import identificationPage from "../pages/identification";
import instructionsPage from "../pages/instructions";
import languagePage from "../pages/language";
import specialCommentsPage from "../pages/specialComments";
import {
  EXISTING_YOGI_CHECK_DONE,
  EXISTING_YOGI_ID_PROPERTY,
} from "../properties";

const visiblePageNamesForExistingYogis = new Set([
  languagePage.name,
  identificationPage.name,
  instructionsPage.name,
  specialCommentsPage.name,
  agreementPage.name,
]);

const trySearch = async (attribute, value) => {
  let url = new URL(DHIS2_CHECK_EXISTS_URL);
  url.searchParams.set("program", DHIS2_PROGRAM);
  url.searchParams.set("attribute", attribute);
  url.searchParams.set("value", value);

  if (value === undefined) {
    return;
  }

  return fetch(url).then((res) => {
    if (res.status == 200) {
      return res.json();
    }
  });
};

const searchExisting = async (data) => {
  let responses = await Promise.all([
    trySearch(
      SURVEY_JS_NAME_TO_D2_TRACKED_ENTITY_ATTRIBUTES_MAP["NIC"],
      data?.NIC
    ),
    trySearch(
      SURVEY_JS_NAME_TO_D2_TRACKED_ENTITY_ATTRIBUTES_MAP["Passport"],
      data?.Passport
    ),
  ]);

  let foundAny = responses.find((x) => x !== undefined);
  if (foundAny === undefined) {
    return Promise.reject("Couldn't find an existing yogi");
  } else {
    return foundAny;
  }
};

const onCurrentPageChanging = (survey, options) => {
  if (
    options.oldCurrentPage.name === identificationPage.name &&
    !survey.getPropertyValue(EXISTING_YOGI_CHECK_DONE) &&
    !options.oldCurrentPage.readOnly // has already set to an existing yogi
  ) {
    options.allowChanging = false;
    survey.setLoading(true);
    searchExisting(survey.data)
      .then((found) => {
        console.log("Found an existing yogi", found);
        options.oldCurrentPage.readOnly = true;
        survey.setPropertyValue(EXISTING_YOGI_ID_PROPERTY, found.enrollment);
        // hide pages
        for (let page of survey.pages) {
          if (!visiblePageNamesForExistingYogis.has(page.name)) {
            page.visible = false;
          }
        }

        // user clicked a specific page instead of clicking next
        if (visiblePageNamesForExistingYogis.has(options.newCurrentPage.name)) {
          survey.currentPage = options.newCurrentPage;
        } else {
          survey.currentPage = survey.getPageByName(specialCommentsPage.name);
        }
      })
      .catch((err) => {
        // didn't find an existing one
        console.log("Couldn't find an existing yogi");
        survey.currentPage = options.newCurrentPage;
      })
      .finally(() => {
        survey.setPropertyValue(EXISTING_YOGI_CHECK_DONE, true);
        survey.setLoading(false);
      });
  } else if (
    options.newCurrentPage?.name === identificationPage.name &&
    !options.newCurrentPage.readOnly
  ) {
    console.log("reset");
    // set to false, so the it will recheck since applicant can edit the values
    survey.setPropertyValue(EXISTING_YOGI_CHECK_DONE, false);
  }
};

export default onCurrentPageChanging;
