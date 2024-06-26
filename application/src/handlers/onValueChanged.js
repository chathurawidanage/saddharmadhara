import { ENGLISH_LOCALE } from "../locale/english";
import { SINHALA_LOCALE } from "../locale/sinhala";
import { LANGUAGE_ENGLISH_VALUE } from "../pages/language";

const onValueChanged = (survey, options) => {
  if (survey.data && survey.data.Language) {
    if (survey.data.Language === LANGUAGE_ENGLISH_VALUE) {
      survey.locale = ENGLISH_LOCALE;
    } else {
      survey.locale = SINHALA_LOCALE;
    }
  }
};

export default onValueChanged;
