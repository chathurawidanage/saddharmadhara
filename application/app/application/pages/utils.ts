import { ENGLISH_LOCALE } from "../locale/english";
import { SINHALA_LOCALE } from "../locale/sinhala";

const defaultCommentTitle = {
  [ENGLISH_LOCALE]:
    "If you have additional information to provide, please elaborate further.",
  [SINHALA_LOCALE]: "ඒ පිළිබඳ වෙනත් විස්තර තිබේ නම්, කරුණාකර එම විස්තර සපයන්න.",
};

export const yesNoQuestionWithComment = (
  name: string,
  title: {
    [ENGLISH_LOCALE]: string;
    [SINHALA_LOCALE]: string;
  },
  isRequired: boolean,
  showMoreOnYes = true, // show more on `No` if false
  commentTitle = defaultCommentTitle,
  visibleIf = "true",
) => {
  // Note: Not using SurveyJS showCommentArea since it can't be enabled conditionally.
  return [
    {
      name: name,
      type: "boolean",
      title,
      isRequired,
      visibleIf,
    },
    {
      name: name + "Comment",
      type: "comment",
      title: commentTitle,
      visibleIf: `{${name}} = ${showMoreOnYes} and ${visibleIf}`,
      isRequired,
    },
  ];
};

export const agreeDisagreeQuestion = (
  name: string,
  title: {
    [ENGLISH_LOCALE]: string;
    [SINHALA_LOCALE]: string;
  },
  isRequired: boolean,
  validators?: Array<any>,
  visibleIf = "true",
) => {
  return {
    name,
    type: "boolean",
    title,
    isRequired,
    labelTrue: {
      [ENGLISH_LOCALE]: "I Agree",
      [SINHALA_LOCALE]: "එකඟ වෙමි",
    },
    labelFalse: {
      [ENGLISH_LOCALE]: "I Disagree",
      [SINHALA_LOCALE]: "එකඟ නොවෙමි",
    },
    validators,
    visibleIf,
  };
};
