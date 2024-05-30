import { RETREAT_CHECKBOX_ITEM_NAME } from "../components/RetreatCheckboxItem";
import { ENGLISH_LOCALE } from "../locale/english";
import { SINHALA_LOCALE } from "../locale/sinhala";

export const RETREATS_QUESTION_NAME = "Retreats";

const retreatsPage = {
  name: "Retreats",
  title: {
    [ENGLISH_LOCALE]: "🗓 Retreats",
    [SINHALA_LOCALE]: "🗓 භාවනා වැඩසටහන්",
  },
  elements: [
    {
      type: "checkbox",
      name: RETREATS_QUESTION_NAME,
      title: {
        [ENGLISH_LOCALE]: "Choose the retreat(s) you wish to join.",
        [SINHALA_LOCALE]:
          "ඔබ සම්බන්ධ වීමට බලාපොරොත්තු වන වැඩසටහන/වැඩසටහන් තෝරන්න.",
      },
      colCount: 1,
      itemComponent: RETREAT_CHECKBOX_ITEM_NAME,
      choices: [],
    },
  ],
};

export default retreatsPage;
