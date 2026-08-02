import { ENGLISH_LOCALE } from "../locale/english";
import { SINHALA_LOCALE } from "../locale/sinhala";

const spiritualPursuitsPage = (isRequired: boolean) => {
  return {
    name: "SpiritualPursuits",
    title: {
      [ENGLISH_LOCALE]: "🧘 Nature of the Spiritual Pursuits",
      [SINHALA_LOCALE]: "🧘 අධ්‍යාත්මික කටයුතු වල ස්වභාවය",
    },
    elements: [
      {
        name: "OrdinationIntended",
        type: "boolean",
        title: {
          [ENGLISH_LOCALE]:
            "Do you plan to dedicate yourself to the spiritual path (to be ordained) in the coming two years?",
          [SINHALA_LOCALE]:
            "ආධ්‍යාත්මික ජීවිතයකට (පැවිදි වීමට) ඊළඟ වසර දෙක තුළ කැපවීමට ඔබට කිසියම් අදහසක් තිබේද?",
        },
        visibleIf: "({MaritalStatus} <> 'reverend')",
        isRequired: isRequired,
      },
      {
        name: "Objective",
        type: "comment",
        title: {
          [ENGLISH_LOCALE]:
            "State your objectives for participating in a meditation program.",
          [SINHALA_LOCALE]:
            "භාවනා වැඩසටහනට සම්බන්ධ වීමේ අරමුණ කෙටියෙන් සඳහන් කරන්න.",
        },
        visibleIf: "({MaritalStatus} <> 'reverend')",
        isRequired: isRequired,
      },
      {
        name: "PastInvolvementComment",
        type: "comment",
        title: {
          [ENGLISH_LOCALE]:
            "Please state the nature and dates of involvement in the past with Most Ven. Gnanavimala Maha Thero and Most Ven. Bambalapitiye Gnanaloka Thero.",
          [SINHALA_LOCALE]:
            "අතිපූජනීය බම්බලපිටියේ ඤාණාලෝක ස්වාමීන්වහන්සේ ගේ හෝ ආචාර්ය ජර්මන් ජාතික අතිපූජනීය ඤාණවිමල ස්වාමීන් වහන්සේලා සමඟ ඔබ අතීතයේ දී කිනම් ආකාරයකට සම්බන්ධ වී ඇති ද? එසේනම් එයට අදාළ දින වකවානු සඳහන් කරන්න.",
        },
      },
      {
        name: "MedicalConditionsComment",
        type: "comment",
        title: {
          [ENGLISH_LOCALE]:
            "Please share details regarding any existing medical conditions or disabilities, if applicable.",
          [SINHALA_LOCALE]:
            "ඔබ ගේ සෞඛ්‍ය තත්වයේ ගැටලු හා අපහසුතා ඇත්නම් ඒ පිළිබඳ තොරතුරු සඳහන් කරන්න.",
        },
      },
      {
        name: "MedicalTreatmentsComment",
        type: "comment",
        title: {
          [ENGLISH_LOCALE]:
            "Please specify the treatments currently being administered for the mentioned ailments and disabilities.",
          [SINHALA_LOCALE]:
            "ඔබ දැනට යම් රෝගාබාධ තත්වයකට බෙහෙත් ඖෂධ/විශේෂ ප්‍රතිකාර ආදිය ලබා ගනී නම් ඒ පිළිබඳ තොරතුරු සඳහන් කරන්න.",
        },
      },
      {
        name: "OtherIssuesComment",
        type: "comment",
        title: {
          [ENGLISH_LOCALE]:
            "Are there any other issues or challenges you are currently facing that we should be aware of?",
          [SINHALA_LOCALE]:
            "අප දැනුවත් විය යුතු වෙනත් ඔබගේ යම් විශේෂ ගැටලු ඇති නම් ඒ පිළිබඳ තොරතුරු සඳහන් කරන්න.",
        },
        description: {
          [ENGLISH_LOCALE]:
            "These could include personal, financial, social, legal, or any other relevant concerns.",
          [SINHALA_LOCALE]:
            "පෞද්ගලික/ ආර්ථික/ සමාජයීය/නීතිමය ආදී ඕනෑම කාරණයකට අදාළ විය හැක.",
        },
      },
    ],
  };
};

export default spiritualPursuitsPage;
