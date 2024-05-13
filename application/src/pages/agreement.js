import { ENGLISH_LOCALE } from "../locale/english";
import { SINHALA_LOCALE } from "../locale/sinhala";
import { agreeDisagreeQuestion } from "./utils";

const agreementPage = {
  name: "Agreement",
  title: {
    [ENGLISH_LOCALE]: "🤝 Agreement",
    [SINHALA_LOCALE]: "🤝 එකගතාව​ය",
  },
  elements: [
    agreeDisagreeQuestion(
      "FinalAgreement",
      {
        [ENGLISH_LOCALE]:
          "I hereby affirm the accuracy of the information provided above, to the best of my knowledge. I know that providing false information would reject my application. I willingly confirm my readiness to participate in the residential meditation program without any interruptions and with full commitment for the specified duration.",
        [SINHALA_LOCALE]:
          "ඉහතින් සපයා ඇති තොරතුරුවල නිරවද්‍යතාවය මම මෙයින් තහවුරු කරමි. අසත්‍ය තොරතුරු ඉදිරිපත් කිරීම භාවනා වැඩසටහන් සදහා තෝරා ගැනීමට නුසුදුසුකමක් වන අතර, නැවත භාවනා වැඩසටහනකට අයදුම් කිර්‍රමට ඇති අවස්ථාවද මග හැරෙන බව දනිමි. කිසිදු බාධාවකින් තොරව සහ නියමිත කාලසීමාව සඳහා පූර්ණ කැපවීමෙන් නේවාසික භාවනා වැඩසටහනට සහභාගී වීමට මගේ සූදානම මම කැමැත්තෙන් තහවුරු කරමි.",
      },
      true,
      [
        {
          type: "expression",
          expression: "{FinalAgreement}",
          text: {
            [ENGLISH_LOCALE]:
              "Sorry. You can't submit the application without agreeing to these terms.",
            [SINHALA_LOCALE]:
              "සමාවන්න. මෙම නියමයන්ට එකඟ නොවී ඔබට අයදුම්පත ඉදිරිපත් කළ නොහැක.",
          },
        },
      ]
    ),
  ],
};

export default agreementPage;
