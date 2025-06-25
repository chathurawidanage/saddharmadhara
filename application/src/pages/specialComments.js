import { ENGLISH_LOCALE } from "../locale/english";
import { SINHALA_LOCALE } from "../locale/sinhala";

const SPECIAL_COMMENTS_QUESTION_NAME = "SpecialComments";

const titleForExistingYogi = {
  [ENGLISH_LOCALE]:
    "Since you are a pre-registered applicant, there is no need to complete the questionnaire again. If there is any other information in addition to the previously provided information, it can be mentioned here.",
  [SINHALA_LOCALE]:
    "ඔබ පෙර ලියාපදිංචි වී ඇති අයදුම්කරුවකු වන බැවින් යළි ප්‍රශ්නාවලිය සම්පූර්ණ කිරීම අවශ්‍ය නොවේ. පෙර සපයා ඇති තොරතුරු වලට අමතරව වූ වෙනත් යම් තොරතුරක් වේ නම් මෙහි සදහන් කළහැකිය.",
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
        [ENGLISH_LOCALE]: "If your personal information has changed compared to the previous year, please be kind enough to indicate it here. For example: medical conditions, medication use, physical disabilities, lifestyle changes, phone numbers, personal addresses, etc.",
        [SINHALA_LOCALE]: "ඔබගේ පුද්ගලික තොරතුරු පෙර වර්ෂයට වඩා වෙනස් වන්නේ නම්, එය මෙහි දැක්වීමට කාරුණික වන්න. උදා: රෝගී තත්ත්ව, ඖෂධ භාවිතය, ශාරීරික අපහසුතා, චර්යාමය වෙනස්කම්, දුරකථන අංක, පුද්ගලික ලිපිනයන් ..යනාදිය",
      },
    },
  ],
};

export const changeSpecialCommentPromptToExistingYogi = (survey) => {
  survey.getQuestionByName(SPECIAL_COMMENTS_QUESTION_NAME).title =
    titleForExistingYogi[survey.locale];
};

export default specialCommentsPage;
