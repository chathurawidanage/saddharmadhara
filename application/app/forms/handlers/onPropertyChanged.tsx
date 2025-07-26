import {
  DHIS2_RETREAT_ATTRIBUTE_DATE,
  DHIS2_RETREAT_ATTRIBUTE_DAYS,
  DHIS2_RETREAT_ATTRIBUTE_MEDIUM,
} from "../dhis2";
import { RETREATS_QUESTION_NAME } from "../pages/retreats";
import {
  EXISTING_YOGI_CHECK_DONE,
  EXISTING_YOGI_ENROLLMENT_ID_PROPERTY,
} from "../properties";
import { getEligibleRetreats } from "../../../backend/Dhis2Client";
import { SurveyModel } from "survey-core";
import { DHIS2_RETREAT_CLERGY_ONLY_ATTRIBUTE } from "../../../dhis2Constants";
import { ENGLISH_LOCALE } from "../locale/english";

export const getMediumText = (mediumCode: "sinhala" | "english") => {
  if (mediumCode && mediumCode === "english") {
    return "English Medium(ඉංග්‍රීසි මාධ්‍ය)";
  }
  return "සිංහල මාධ්‍ය";
};

const getOnlyForClergyText = (locale: string) => {
  if (locale === ENGLISH_LOCALE) {
    return "Only for Reverends";
  }
  return "මහා සංඝරත්නය සඳහා පමණි";
};

const onPropertyChanged = (survey: SurveyModel, options) => {
  if (options.name === EXISTING_YOGI_CHECK_DONE) {
    getEligibleRetreats(
      survey.getPropertyValue(EXISTING_YOGI_ENROLLMENT_ID_PROPERTY),
    ).then((retreats) => {
      survey.getQuestionByName(RETREATS_QUESTION_NAME).choices = retreats?.map(
        (choice) => {
          let startDate = new Date(
            choice.attributes[DHIS2_RETREAT_ATTRIBUTE_DATE],
          );
          let noOfDays = parseInt(
            choice.attributes[DHIS2_RETREAT_ATTRIBUTE_DAYS],
          );
          let medium = choice.attributes[DHIS2_RETREAT_ATTRIBUTE_MEDIUM];
          let endDate = new Date(
            startDate.getTime() + (noOfDays + 1) * 24 * 60 * 60 * 1000,
          );
          let onlyForClergy =
            choice.attributes[DHIS2_RETREAT_CLERGY_ONLY_ATTRIBUTE] === "true";
          return {
            value: choice.value,
            text: `<div class="retreat-checkbox-item">
              <h4>${choice.text}</h4>
              <div class="retreat-checkbox-item-details">
                ${onlyForClergy ? `<div>🛡️ ${getOnlyForClergyText(survey.locale)}</div>` : ""}
                <div>📅 ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</div>
                <div>⏲️ ${noOfDays} Days</div>
                <div>🌐 ${getMediumText(medium)}</div>
              </div>
            </div>`,
          };
        },
      );
    });
  }
};

export default onPropertyChanged;
