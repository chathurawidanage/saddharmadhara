import {
  DHIS2_RETREAT_ATTRIBUTE_ACCOMMODATION_NOT_PROVIDED,
  DHIS2_RETREAT_ATTRIBUTE_DATE,
  DHIS2_RETREAT_ATTRIBUTE_DAYS,
  DHIS2_RETREAT_ATTRIBUTE_MEDIUM,
} from "../dhis2";
import { RETREATS_QUESTION_NAME } from "../pages/retreats";
import {
  EXISTING_YOGI_CHECK_DONE,
  EXISTING_YOGI_ENROLLMENT_ID_PROPERTY,
  RETREATS_AVAILABLE_PROPERTY,
  SPECIF_RETREAT_REQUESTED,
} from "../properties";
import { getEligibleRetreats } from "../../../backend/Dhis2Client";
import { SurveyModel } from "survey-core";
import { DHIS2_RETREAT_ATTRIBUTE_CLERGY_ONLY, DHIS2_RETREAT_ATTRIBUTE_TYPE } from "../dhis2";
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

const getSilentRetreatTitleText = (locale: string) => {
  if (locale === ENGLISH_LOCALE) {
    return "(Silent Retreat)";
  }
  return "(ස්වයං භාවනා වැඩසටහන)";
};

const getSilentRetreatSelfPracticeText = (locale: string) => {
  if (locale === ENGLISH_LOCALE) {
    return "The Venerable Monk is not involved in this self-meditation program, and you will have the opportunity to practice in solitude.";
  }
  return "ස්වාමීන් වහන්සේ මෙම ස්වයං භාවනා වැඩසටහන් සඳහා සම්බන්ධ නොවන අතර හුදෙකලාව බවුන් වැඩීමට ඔබට අවස්ථාව හිමිවෙයි.";
};

const getAccommodationNotProvidedText = (locale: string) => {
  if (locale === ENGLISH_LOCALE) {
    return "Accommodation is not provided for this program. Participants must come from home for the program each morning.";
  }
  return "මෙම වැඩසටහන සඳහා නවාතැන් පහසුකම් සපයනු නොලැබේ. නිවසේ සිට දිනපතා උදෑසන වැඩසටහන සඳහා පැමිණිය යුතු ය.";
};

const onPropertyChanged = (survey: SurveyModel, options) => {
  if (options.name === EXISTING_YOGI_CHECK_DONE) {
    getEligibleRetreats(
      survey.getPropertyValue(EXISTING_YOGI_ENROLLMENT_ID_PROPERTY),
      survey.getPropertyValue(SPECIF_RETREAT_REQUESTED)
    ).then((retreats) => {
      survey.setVariable(RETREATS_AVAILABLE_PROPERTY, retreats && retreats.length > 0);
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
            choice.attributes[DHIS2_RETREAT_ATTRIBUTE_CLERGY_ONLY] === "true";
          let isSilentRetreat =
            choice.attributes[DHIS2_RETREAT_ATTRIBUTE_TYPE] === "silent";
          let accommodationNotProvided =
            choice.attributes[DHIS2_RETREAT_ATTRIBUTE_ACCOMMODATION_NOT_PROVIDED] === "true";
          return {
            value: choice.value,
            text: `<div class="retreat-checkbox-item ${onlyForClergy ? "retreat-checkbox-item-only-for-clergy" : ""} ${isSilentRetreat ? "retreat-checkbox-item-silent-retreat" : ""} ${!onlyForClergy && !isSilentRetreat ? "retreat-checkbox-item-general-retreat" : ""}">
              <h4>${choice.text} ${isSilentRetreat ? getSilentRetreatTitleText(survey.locale) : ""}</h4>
              <div class="retreat-checkbox-item-details">
                ${onlyForClergy ? `<div>🛡️ ${getOnlyForClergyText(survey.locale)}</div>` : ""}
                ${isSilentRetreat ? `<div class="text-bold">⚠️ ${getSilentRetreatSelfPracticeText(survey.locale)}</div>` : ""}
                ${accommodationNotProvided ? `<div class="text-bold">⚠️ ${getAccommodationNotProvidedText(survey.locale)}</div>` : ""}
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
