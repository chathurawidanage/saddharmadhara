import {
  CHECK_EXISTS_URL,
  DHIS2_PROGRAM,
  SURVEY_JS_NAME_TO_D2_TRACKED_ENTITY_ATTRIBUTES_MAP,
} from "../dhis2";
import agreementPage from "../pages/agreement";
import identificationPage from "../pages/identification";
import instructionsPage from "../pages/instructions";
import languagePage from "../pages/language";
import retreatsPage from "../pages/retreats";
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
  retreatsPage.name,
  agreementPage.name,
]);

const trySearch = async (attribute, value) => {
  if (value === undefined || attribute === undefined) {
    throw new Error("value and attribute can't be undefined");
  }

  let url = new URL(CHECK_EXISTS_URL);
  url.searchParams.set("program", DHIS2_PROGRAM);
  url.searchParams.set("attribute", attribute);
  url.searchParams.set("value", value);

  let response = await fetch(url);
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error("Couldn't find an existing entity");
  }
};

const searchExisting = ({ NIC, Passport }) => {
  return Promise.any([
    trySearch(SURVEY_JS_NAME_TO_D2_TRACKED_ENTITY_ATTRIBUTES_MAP["NIC"], NIC),
    trySearch(
      SURVEY_JS_NAME_TO_D2_TRACKED_ENTITY_ATTRIBUTES_MAP["Passport"],
      Passport
    ),
  ]);
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
        console.info("Found an existing yogi", found);
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
        console.error("Couldn't find an existing yogi", err);
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
    // set to false, so the it will recheck since applicant can edit the values
    survey.setPropertyValue(EXISTING_YOGI_CHECK_DONE, false);
  }
};

export default onCurrentPageChanging;
