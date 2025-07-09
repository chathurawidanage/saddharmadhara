import { ENGLISH_LOCALE } from "../locale/english";
import { SINHALA_LOCALE } from "../locale/sinhala";
import { agreeDisagreeQuestion } from "./utils";
import {
  DHIS2_RETREAT_ATTRIBUTE_DATE,
  DHIS2_RETREAT_ATTRIBUTE_DAYS,
  DHIS2_RETREAT_ATTRIBUTE_MEDIUM,
} from "../dhis2";
import { getMediumText } from "../handlers/onPropertyChanged";

const agreementPage = (retreatObj) => {
  let startDate = new Date(retreatObj.attributes[DHIS2_RETREAT_ATTRIBUTE_DATE]);
  let noOfDays = parseInt(retreatObj.attributes[DHIS2_RETREAT_ATTRIBUTE_DAYS]);
  let endDate = new Date(
    startDate.getTime() + (noOfDays + 1) * 24 * 60 * 60 * 1000,
  );
  return {
    name: "Attendance",
    title: {
      [ENGLISH_LOCALE]: "📨 RSVP",
      [SINHALA_LOCALE]: "📨 පැමිණීම/නොපැමිණීම",
    },
    elements: [
      {
        name: "rsvp",
        type: "boolean",
        title: {
          [ENGLISH_LOCALE]: `You have been selected to attend the ${noOfDays} days retreat from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}. Please confirm you attendance below.`,
          [SINHALA_LOCALE]: `ඔබ ${startDate.toLocaleDateString()} සිට ${endDate.toLocaleDateString()} දක්වා පැවැත්වෙන දින ${noOfDays} ක සද්ධර්මධාරා වැඩසටහනට සහභාගී වීමට තේරී ඇත. කරුණාකර ඔබගේ සහභාගිත්වය තහවුරු කරන්න.`,
        },
        isRequired: true,
        labelTrue: {
          [ENGLISH_LOCALE]: "Attending",
          [SINHALA_LOCALE]: "පැමිණේ",
        },
        labelFalse: {
          [ENGLISH_LOCALE]: "Not Attending",
          [SINHALA_LOCALE]: "නොපැමිණේ",
        },
      },
    ],
  };
};
export default agreementPage;
