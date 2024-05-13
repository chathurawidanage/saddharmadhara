import { ENGLISH_LOCALE } from "../locale/english";
import { SINHALA_LOCALE } from "../locale/sinhala";

const specialCommentsPage = {
  name: "SpecialComments",
  title: {
    [ENGLISH_LOCALE]: "💬 Special Comments",
    [SINHALA_LOCALE]: "💬 වෙනත් තොරතුරු",
  },
  elements: [
    {
      name: "SpecialComment",
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

export default specialCommentsPage;
