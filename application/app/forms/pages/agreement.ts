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
        [ENGLISH_LOCALE]: `I affirm that the information I have provided is true and accurate. I understand that providing false information will lead to my disqualification from this meditation program and future opportunities to reapply.

Additionally, I voluntarily confirm my complete willingness and readiness to participate in this residential meditation program with full dedication, adhering to the rules and traditions of the forest during the designated meditation period.

I also acknowledge that this meditation program is not intended as a recommendation, remedy, or approved treatment for any physical or mental illness, complication, pain, or problem that I may currently have.`,
        [SINHALA_LOCALE]: `තොරතුරු වල සත්‍යතාව: මා විසින් ඉහත සපයා ඇති සියලු තොරතුරු සත්‍ය හා නිවැරදි බව තහවුරු කරමි. අසත්‍ය තොරතුරු ඉදිරිපත් කිරීම මෙම භාවනා වැඩසටහනට නුසුදුසු වීමට මෙන්ම, ඉදිරියේදී පැවැත්වෙන භාවනා වැඩසටහනක් සඳහා අයදුම් කිරීමේ අවස්ථාව අහිමි වීමට ද හේතු වන බව දනිමි.

වැඩසටහනට කැපවීම: නියමිත කාලසීමාව තුළ ආරණ්‍යයේ නීති රීති සහ සම්ප්‍රදායන්ට අනුව යමින්, පූර්ණ කැපවීමෙන් යුතුව මෙම නේවාසික භාවනා වැඩසටහනට සහභාගි වීමට මාගේ පූර්ණ කැමැත්ත ස්වකැමැත්තෙන්ම ප්‍රකාශ කරමි.

සෞඛ්‍ය තත්ත්වය පිළිබඳ අවබෝධය: මා තුළ පවතින යම් ශාරීරික හෝ මානසික රෝගී තත්ත්වයකට, සංකූලතාවයකට හෝ ගැටලුවකට මෙම භාවනා වැඩසටහන වෛද්‍ය නිර්දේශයක්, ප්‍රතිකර්මයක් හෝ ඖෂධයක් නොවන බව මැනවින් අවබෝධ කරගෙන සිටිමි.`,
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
      ],
    ),
  ],
};

export default agreementPage;
