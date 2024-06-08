import { RETREATS_LIST_URL } from "../dhis2";
import { RETREATS_QUESTION_NAME } from "../pages/retreats";
import { EXISTING_YOGI_CHECK_DONE, EXISTING_YOGI_ENROLLMENT_ID_PROPERTY } from "../properties";

const onPropertyChanged = (survey, options) => {
  if (options.name === EXISTING_YOGI_CHECK_DONE) {
    // todo send the enrollment to select only relevant retreats
    let url = new URL(RETREATS_LIST_URL);
    if (survey.getPropertyValue(EXISTING_YOGI_ENROLLMENT_ID_PROPERTY)) {
      url.searchParams.set(
        "enrollment",
        survey.getPropertyValue(EXISTING_YOGI_ENROLLMENT_ID_PROPERTY)
      );
    }
    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        survey.getQuestionByName(RETREATS_QUESTION_NAME).choices = res.retreats;
      });
  }
};

export default onPropertyChanged;
