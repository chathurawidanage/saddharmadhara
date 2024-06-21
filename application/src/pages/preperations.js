import { ENGLISH_LOCALE } from "../locale/english";
import { SINHALA_LOCALE } from "../locale/sinhala";
import { agreeDisagreeQuestion } from "./utils";

const preperationsPage = (isRequired) => {
  return {
    name: "Preperations",
    title: {
      [ENGLISH_LOCALE]: "☑️ Preparation for the meditation program",
      [SINHALA_LOCALE]: "☑️ භාවනා වැඩසටහන සඳහා මුලික සුදානම් වීම",
    },
    description: {
      [ENGLISH_LOCALE]:
        "If you intend to join the meditation program, indicate whether you are able to follow the following instructions prepared according to the instructions given by Most Reverend Bambalapitiya Gnanaloka Thero.",
      [SINHALA_LOCALE]:
        "භාවනා වැඩසටහන සඳහා සම්බන්වීමට අදහස් කරන ඔබ, අපගේ අතිපූජනීය බම්බලපිටියේ ඤාණාලෝක ස්වාමීන් වහන්සේගේ අනුශාසනා අනුව සකස් කරන ලද පහත සදහන් උපදෙස් සහ ඒවා පිළිපැදීමට ඔබට හැකියාවක් තිබේද යන්න සඳහන් කරන්න.",
    },
    elements: [
      agreeDisagreeQuestion(
        "NoPhones",
        {
          [ENGLISH_LOCALE]:
            "You should try to reduce the use of cell phones, the internet, and other sense-stimulating activities for some time (preferably two weeks, otherwise at least five days) prior to the retreat date.",
          [SINHALA_LOCALE]:
            "ඔබ භාවනා වැඩසටහන සහභාගී වීමට නියමිත දිනට පෙර යම් කාලයක් (වඩාත් සුදුසු සති දෙකක්, එසේ නොමැති නම් අවම වශයෙන් දින පහක්) ජංගම දුරකථන, අන්තර්ජාලය සහ අනෙකුත් සංවේදී ක්‍රියාකාරකම් භාවිතය අවම කිරීමට උත්සාහ කළ යුතු ය.",
        },
        isRequired
      ),
      agreeDisagreeQuestion(
        "NoBadHabbits",
        {
          [ENGLISH_LOCALE]:
            "You should try to avoid bad habits like masturbation or any kind of sexual activity at a physical level for at least two weeks prior to the retreat.",
          [SINHALA_LOCALE]:
            "භාවනා වැඩසටහන පෙර අවම වශයෙන් සති දෙකකටවත් පෙර ශාරීරික මට්ටමේ ලිංගික ක්‍රියාකාරකම් වලින් වැළකී සිටීමට මෙන්ම ස්වයංවින්දනය වැනි නරක පුරුදුවලින් වැළකී සිටීමට හෝ ඔබ උත්සාහ කිරීම.",
        },
        isRequired,
        null,
        "!({MaritalStatus} = 'reverend')"
      ),
      agreeDisagreeQuestion(
        "DoAshubaBhavana",
        {
          [ENGLISH_LOCALE]:
            "Practice 'Ashuba Bhavana' (reflection on unattractiveness) at least two weeks prior to the retreat.",
          [SINHALA_LOCALE]:
            "භාවනා වැඩසටහන පෙර අවම වශයෙන් සති දෙකකට පෙර සිටම අසුබ භාවනාව පුහුණු කිරීම.",
        },
        isRequired
      ),
      agreeDisagreeQuestion(
        "DoMaithreeBhavana",
        {
          [ENGLISH_LOCALE]:
            "Practice compassion (Maithree Bhavana) at least two weeks prior to the retreat.",
          [SINHALA_LOCALE]:
            "භාවනා වැඩසටහන පෙර අවම වශයෙන් සති දෙකකට පෙර සිටම මෛ​​ත්‍රේය භාවනාව පුහුණු කිරීම.",
        },
        isRequired
      ),
      agreeDisagreeQuestion(
        "UnderstandTrividaRathna",
        {
          [ENGLISH_LOCALE]:
            "With the understanding of the virtues of 'Trivida Rathna', cultivate pure and honest faith and practice Buddhanussathi, Dhammanussathi, Sanghanussathi at least two weeks prior to the retreat in advance.",
          [SINHALA_LOCALE]:
            "'ත්‍රිවිධ රත්නයේ' ගුණ අවබෝධ කරගෙන එකී ගුණයන් ශ්‍රද්ධා සම්ප්‍රයුක්තව වඩවාගෙන බුද්ධානුස්සති, ධම්මානුස්සති, සංඝානුස්සති යන පිළිවෙත් පුරුදු පුහුණු වීම.",
        },
        isRequired
      ),
      agreeDisagreeQuestion(
        "ReadFourNobleTruths",
        {
          [ENGLISH_LOCALE]:
            "Have some Dhamma knowledge about the basic facts (four noble truths) of Buddhism - (Peruse the book 'The Word of the Buddha' written by the German monk Most Venerable Nyanatiloka Thero)",
          [SINHALA_LOCALE]:
            "බුදුදහමේ මූලික කරුණු (උතුම් චතුරාර්ය සත්‍යය) පිළිබඳ යම් දහම් දැනුමක් ලබා ගැනීම - (ඒ සඳහා ඔබට ගෞරවනීය ස්වාමීන්වහන්සේ විසින් අනුදැන වදාළ පරිදි ජර්මානු ජාතික අතිපූජනීය ඤාණතිලෝක ස්වාමීන් වහන්සේ විසින් ලියන ලද ‘බුද්ධ වචනය’ ග්‍රන්ථය පරිශීලනය කළ හැකිය)",
        },
        isRequired
      ),
    ],
  };
};

export default preperationsPage;
