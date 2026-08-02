import { ENGLISH_LOCALE } from "../locale/english";
import { SINHALA_LOCALE } from "../locale/sinhala";
import { SurveyModel } from "survey-core";

const SPECIAL_COMMENTS_QUESTION_NAME = "SpecialComments";

const titleForExistingYogi = {
  [ENGLISH_LOCALE]:
    "If you have any additional or updated information beyond what was provided in previous years, you may mention it here.",
  [SINHALA_LOCALE]:
    "පෙර වසරවල ලබා දුන් තොරතුරුවලට අමතරව වෙනත් යම් තොරතුරක් හෝ වෙනස් වූ තොරතුරක් වේ නම් මෙහි සඳහන් කළ හැකිය.",
};

const specialCommentsPage = {
  name: "SpecialComments",
  title: {
    [ENGLISH_LOCALE]: "💬 Special Comments",
    [SINHALA_LOCALE]: "💬 වෙනත් තොරතුරු",
  },
  elements: [
    {
      name: SPECIAL_COMMENTS_QUESTION_NAME,
      type: "comment",
      title: {
        [ENGLISH_LOCALE]:
          "Please state if you have any special comments regarding the applicant.",
        [SINHALA_LOCALE]:
          "අයදුම්කරු පිළිබඳ විශේෂයෙන් දැනුවත් කිරීමට යමක් ඇති නම් ඒ පිළිබඳ තොරතුරු.",
      },
      description: {
        [ENGLISH_LOCALE]:
          "Examples: medical conditions, medication use, physical disabilities, lifestyle changes, phone numbers, personal addresses, etc.",
        [SINHALA_LOCALE]:
          "උදා: රෝගී තත්ත්ව, ඖෂධ භාවිතය, ශාරීරික අපහසුතා, චර්යාමය වෙනස්කම්, දුරකථන අංක, පුද්ගලික ලිපිනයන් යනාදිය",
      },
    },
  ],
};

export const changeSpecialCommentPromptToExistingYogi = (
  survey: SurveyModel,
) => {
  survey.getQuestionByName(SPECIAL_COMMENTS_QUESTION_NAME).title =
    titleForExistingYogi[survey.locale];
};

export default specialCommentsPage;
