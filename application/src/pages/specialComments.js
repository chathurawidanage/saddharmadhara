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
    },
  ],
};

export const changeSpecialCommentPromptToExistingYogi = (survey) => {
  survey.getQuestionByName(SPECIAL_COMMENTS_QUESTION_NAME).title =
    titleForExistingYogi[survey.locale];
};

export default specialCommentsPage;
