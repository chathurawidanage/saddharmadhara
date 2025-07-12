import { ENGLISH_LOCALE } from "../locale/english";
import { SINHALA_LOCALE } from "../locale/sinhala";
import {
  DHIS2_RETREAT_ATTRIBUTE_DATE,
  DHIS2_RETREAT_ATTRIBUTE_DAYS,
} from "../dhis2";

const agreementPage = (retreatObj, teiName: string) => {
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
        name: "RSVP",
        type: "boolean",
        title: {
          [ENGLISH_LOCALE]: `You (${teiName}) have been selected to attend the ${noOfDays} days Saddharmadhara retreat from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}. Please confirm you attendance below.`,
          [SINHALA_LOCALE]: `ඔබ (${teiName}) ${startDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })} සිට ${endDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })} දක්වා දක්වා පැවැත්වෙන දින ${noOfDays}ක සද්ධර්මධාරා නේවාසික වැඩසටහන හා සම්බන්ධවීමට තේරී පත් ව ඇත. කරුණාකර ඔබගේ සහභාගිත්වය තහවුරු කරන්න.`,
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
