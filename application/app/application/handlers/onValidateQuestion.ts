import { PHONE_NUMBER_QUESTION_VALIDITY_PROPERTY } from "../components/PhoneNumberTextBox";
import { SurveyModel } from "survey-core";

const onValidateQuestion = (survey: SurveyModel, options) => {
  if (options?.question?.classMetaData?.name === "phone-number") {
    // the intl-tel-input library marks an empty phone number as invalid too. For this app,
    // empty phone numbers are fine as long as the field is not required
    if (
      !options.question.isRequired &&
      (options.question.value === "" || options.question.value === undefined)
    ) {
      // do nothing
    } else if (
      options.question.getPropertyValue(
        PHONE_NUMBER_QUESTION_VALIDITY_PROPERTY,
      ) === false
    ) {
      options.error = "Invalid phone number";
    }
  }
};

export default onValidateQuestion;
