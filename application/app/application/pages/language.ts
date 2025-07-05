import { ENGLISH_LOCALE } from "../locale/english";
import { SINHALA_LOCALE } from "../locale/sinhala";

export const LANGUAGE_ENGLISH_VALUE = "English";

const languagePage = {
  name: "Language",
  title: {
    [ENGLISH_LOCALE]: "🌐 Language",
    [SINHALA_LOCALE]: "🌐 භාෂාව",
  },
  elements: [
    {
      name: "Language",
      title: {
        [ENGLISH_LOCALE]: "Select a language for filling the application.",
        [SINHALA_LOCALE]: "අයදුම්පත සම්පූර්ණ කිරීමට භාෂාවක් තෝරාගන්න.",
      },
      colCount: 2,
      type: "radiogroup",
      choices: ["සිංහල", "English"],
      defaultValue: "සිංහල",
      isRequired: true,
    },
  ],
};

export default languagePage;
