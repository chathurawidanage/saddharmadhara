import { DHIS2_RETREAT_ATTRIBUTE_DATE, DHIS2_RETREAT_ATTRIBUTE_DAYS, RETREATS_LIST_URL } from "../dhis2";
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
        survey.getQuestionByName(RETREATS_QUESTION_NAME).choices = res?.retreats?.map(choice => {
          let startDate = new Date(choice.attributes[DHIS2_RETREAT_ATTRIBUTE_DATE]);
          let noOfDays = parseInt(choice.attributes[DHIS2_RETREAT_ATTRIBUTE_DAYS]);
          let endDate = new Date(startDate.getTime() + ((noOfDays + 1) * 24 * 60 * 60 * 1000));
          return {
            value: choice.value,
            text: `<div class="retreat-checkbox-item">
              <h4>${choice.text}</h4>
              <div class="retreat-checkbox-item-details">
                <div>📅 ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</div>
                <div>⏲️ ${noOfDays} Days</div>
              </div>
            </div>`
          }
        });
      });
  }
};

export default onPropertyChanged;
