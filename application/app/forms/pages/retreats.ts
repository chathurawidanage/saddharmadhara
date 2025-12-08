import { RETREAT_CHECKBOX_ITEM_NAME } from "../components/RetreatCheckboxItem";
import { ENGLISH_LOCALE } from "../locale/english";
import { SINHALA_LOCALE } from "../locale/sinhala";
import { RETREATS_AVAILABLE_PROPERTY } from "../properties";

export const RETREATS_QUESTION_NAME = "Retreats";

const retreatsPage = {
  name: "Retreats",
  title: {
    [ENGLISH_LOCALE]: "🗓 Retreats",
    [SINHALA_LOCALE]: "🗓 භාවනා වැඩසටහන්",
  },
  elements: [
    {
      type: "html",
      name: "noRetreatsAvailable",
      visibleIf: `{${RETREATS_AVAILABLE_PROPERTY}} = false`,
      html: {
        [ENGLISH_LOCALE]: `No retreats are currently open for registration. You may still submit this form, and we will store your information for future registrations so you won't need to fill it out again.`,
        [SINHALA_LOCALE]: `ලියාපදිංචිය සඳහා දැනට කිසිදු වැඩසටහනක් විවෘත නැත. ඔබට තවමත් මෙම පෝරමය ඉදිරියට යා හැකි අතර, අනාගත ලියාපදිංචි කිරීම් සඳහා අපි ඔබේ තොරතුරු ගබඩා කරන්නෙමු, එබැවින් ඔබට එය නැවත පිරවීමට අවශ්‍ය නොවනු ඇත.`,
      },
    },
    {
      type: "checkbox",
      name: RETREATS_QUESTION_NAME,
      visibleIf: `{${RETREATS_AVAILABLE_PROPERTY}} = true`,
      title: {
        [ENGLISH_LOCALE]: "Choose the retreat(s) you wish to join.",
        [SINHALA_LOCALE]:
          "ඔබ සම්බන්ධ වීමට බලාපොරොත්තු වන වැඩසටහන/වැඩසටහන් තෝරන්න.",
      },
      description: {
        [ENGLISH_LOCALE]:
          "You may apply for up to four programs that are most convenient for you; however, you will be offered only one opportunity. Once the committee assigns a date based on your preferences, if you choose not to accept that date, your opportunity for this year will be forfeited.",
        [SINHALA_LOCALE]:
          "මහිදී ඔබට වඩාත් පහසු වැඩසටහන් හතරක් සඳහා අයදුම් කළ හැක. ඒ අතරින් ඔබට හිමි වන්නේ එක් අවස්ථාවක් පමණි. ඔබගේ කැමැත්ත පරිදි ඉල්ලුම් කරණ එම දිනය කමිටුව විසින් ලබා දුන් පසුව, ඔබ විසින් එම දිනය පිළිනොගන්නේ නම් මෙම වර්ෂයට හිමි අවස්ථාව ඔබ වෙතින් ගිලිහී යනු ඇත.",
      },
      colCount: 1,
      maxSelectedChoices: 4,
      itemComponent: RETREAT_CHECKBOX_ITEM_NAME,
      choices: [],
    },
  ],
};

export default retreatsPage;
