import { RETREATS_LIST_URL } from "../dhis2";
import { RETREATS_QUESTION_NAME } from "../pages/retreats";
import {
  EXISTING_YOGI_CHECK_DONE,
} from "../properties";

const onPropertyChanged = (survey, options) => {
  if (options.name === EXISTING_YOGI_CHECK_DONE) {
    // if (survey.getPropertyValue(EXISTING_YOGI_ID_PROPERTY)) {
    // }
    // todo send the enrollment to select only relevant retreats
    fetch(RETREATS_LIST_URL)
      .then((res) => res.json())
      .then((res) => {
        survey.getQuestionByName(RETREATS_QUESTION_NAME).choices = res.retreats;
      });
  }
};

export default onPropertyChanged;
