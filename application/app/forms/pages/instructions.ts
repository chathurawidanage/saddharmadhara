import { ENGLISH_LOCALE } from "../locale/english";
import { SINHALA_LOCALE } from "../locale/sinhala";

const instructionsPage = {
  name: "Instructions",
  title: {
    [ENGLISH_LOCALE]: "✍🏼 Instructions",
    [SINHALA_LOCALE]: "✍🏼 උපදෙස්",
  },
  elements: [
    {
      type: "html",
      html: {
        [ENGLISH_LOCALE]: `
      <p>
      We appreciate your honest answers to the following questionnaire. We emphasize that all applications forwarded will be selected for a suitable meditation program.
      </p>
      <p>
      You must provide truthful information on all questions and other matters asked.
      </p>
      <p>
      This application must be completed by the applicant and not submitted by anyone else. You have the option to contact a guide only for the technical support you need.
      </p>
      `,
        [SINHALA_LOCALE]: `
       <p>
       පහතින් දැක්වෙන ප්‍රශ්නාවලිය සඳහා ඔබගේ සත්‍යවාදී පිළිතුරු අගයකොට සළකමු. යොමු කරන සියලු අයදුම්පත් සුදුසු සද්ධර්මධාරා භාවනා වැඩසටහනක් සඳහා තෝරාගන්නා බව සතුටින්  සඳහන් කරමු.
       </p> 
       <p>
       අසන ලද සියලුම ප්‍රශ්නවලට සහ අනෙකුත් කරුණු සඳහා සත්‍යවාදී තොරතුරු ඔබ විසින් ලබාදිය යුතු වෙයි.
       </p>
       <p>
       මෙම අයදුම්පත්‍රය ඔබ විසින් ම සම්පූර්ණ කළ යුතු අතර එය වෙනත් කිසිවකුත් විසින් සම්පූර්ණ කර ඉදිරිපත් නොකළ යුතු ය. ඔබට අවශ්‍ය තාක්ෂණික සහාය සදහා පමණක් මග පෙන්වන්නෙක් සම්බන්ධ කරගැනීමට අවස්ථාව ඇත. 
       </p>
        `,
      },
    },
  ],
};

export default instructionsPage;
