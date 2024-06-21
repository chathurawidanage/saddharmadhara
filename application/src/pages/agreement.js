import { ENGLISH_LOCALE } from "../locale/english";
import { SINHALA_LOCALE } from "../locale/sinhala";
import { agreeDisagreeQuestion } from "./utils";

const agreementPage = {
  name: "Agreement",
  title: {
    [ENGLISH_LOCALE]: "🤝 Declaration of Consent",
    [SINHALA_LOCALE]: "🤝 එකඟතා ප්‍රකාශනය",
  },
  elements: [
    agreeDisagreeQuestion(
      "FinalAgreement",
      {
        [ENGLISH_LOCALE]:
          `I affirm that the information I have provided is true and accurate. I understand that providing false information will lead to my disqualification from this meditation program and future opportunities to reapply.

Additionally, I voluntarily confirm my complete willingness and readiness to participate in this residential meditation program with full dedication, adhering to the rules and traditions of the forest during the designated meditation period.

I also acknowledge that this meditation program is not intended as a recommendation, remedy, or approved treatment for any physical or mental illness, complication, pain, or problem that I may currently have.`,
        [SINHALA_LOCALE]:
          `මා විසින් ඉහත සපයා ඇති තොරතුරු සියල්ල සත්‍ය හා නිවැරදි බව මින් තහවුරු කරමි. අසත්‍ය තොරතුරු ඉදිරිපත් කිරීම මෙම භාවනා වැඩසටහනට නුසුදුස්සකු වන බවත් නැවත භාවනා වැඩසටහනකට අයදුම් කිරීමේ ඇති අවස්ථාව ද ඉන් මගහැරී යන බව ත් දනිමි.

නියමිත භාවනා කාලසීමාව තුළ ආරණ්‍යයේ නීති රීති හා සම්ප්‍රදායන්ට එකඟව හා පූර්ණ කැපවීමෙන් යුතුව මෙම නේවාසික භාවනා වැඩසටහනට සහභාගි  වීමට මාගේ පූර්ණ කැමැත්ත හා සූදානම ද මින් ස්වකැමැත්තෙන් තහවුරු කරමි.

තවද මා තුළ දැනට පවත්නා යම්  ශාරීරික හෝ මානසික රෝගී තත්වයක්,  සංකූලතාවයක් ,වේදනාවක් හෝ යම් ගැටලුවක්  සඳහා මෙම භාවනා වැඩසටහන නිර්දේශයක් ප්‍රතිකර්මයක් හෝ අනුමත ඖෂධයක් හෝ නොවන බව ද අවබෝධ කරගෙන සිටිමි.
          `,
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
