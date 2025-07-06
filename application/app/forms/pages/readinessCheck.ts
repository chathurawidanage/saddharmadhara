import { ENGLISH_LOCALE } from "../locale/english";
import { SINHALA_LOCALE } from "../locale/sinhala";
import { yesNoQuestionWithComment } from "./utils";

const readinessCheckPage = (isRequired: boolean) => {
  return {
    name: "ReadinessCheck",
    title: {
      [ENGLISH_LOCALE]:
        "❤️‍🩹 Physical and psychological attachments and health conditions",
      [SINHALA_LOCALE]: "❤️‍🩹 කායික/මානසික බැඳියාවන් සහ සෞඛ්‍ය තත්වයන්",
    },
    description: {
      [ENGLISH_LOCALE]:
        "Record you truthful and honest response to the following questions.",
      [SINHALA_LOCALE]:
        "පහත සඳහන් ප්‍රශ්නවලට ඔබගේ අවංක සත්‍යවාදී ප්‍රතිචාරය අදාළ කොටුව තුළ සටහන් කරන්න.",
    },
    elements: [
      ...yesNoQuestionWithComment(
        "HasPermission",
        {
          [ENGLISH_LOCALE]:
            "Do you have full permission from your spouse/parents/guardian/employer or any such duty-bound relationships (for venerables, this could be the Monastery Head, Upajjhāya, or Ācariya) to attend the residential meditation program?",
          [SINHALA_LOCALE]:
            "ඔබට මෙම නේවාසික භාවනා වැඩසටහන හා සම්බන්ධ වීමට දෙමව්පියන්ගෙන්/භාරකරුගෙන්/රැකියා කරන ස්ථානයෙන් සහ වෙනත් එවැනි විශේෂ වගකිවයුතු සම්බන්ධතාවලින් සම්පූර්ණ අවසරය ලැබී තිබේ ද? පූජ්‍ය පක්ෂය  සඳහා විහාරාධිපති ස්වාමින්වහන්සේ ගේ හෝ උපාධ්‍යන්වහන්සේගේ සම්පූර්ණ අවසරය අවශ්‍ය වේ.", // TODO
        },
        isRequired,
        false,
      ),
      ...yesNoQuestionWithComment(
        "HaveKids",
        {
          [ENGLISH_LOCALE]: "Do you have children under the age of 12?",
          [SINHALA_LOCALE]: "වයස අවුරුදු 12ට අඩු දරුවන් සිටී ද?",
        },
        isRequired,
        true,
        {
          [ENGLISH_LOCALE]:
            "Please provide the details about their age groups. Have formal measures been taken for their protection during the meditation program?",
          [SINHALA_LOCALE]:
            "ඔවුන්ගේ වයස් කාණ්ඩ පිළිබඳව විස්තර සදහන් කරන්න. භාවනා වැඩසටහන් කාලය තුළ ඔවුන්ගේ රැකවරණය සදහා විධිමත් ක්‍රියාමාර්ග ගෙන තිබේද?",
        },

        "!({MaritalStatus} = 'reverend')",
      ),
      ...yesNoQuestionWithComment(
        "UnattendedDeformities",
        {
          [ENGLISH_LOCALE]:
            "If you have suffered any diseases or disabilities since childhood, or have later developed them in life, with no remedies or treatment proving to be helpful?",
          [SINHALA_LOCALE]:
            "ඔබ උපතේ සිටම පවතින රෝගාබාධවලින් හෝ විකෘතිතාවලින් පෙළෙන්නේද, එසේත් නැතිනම් ජීවිතයේ පසු කාලයක ඇති වූ මෙතෙක් සුව නොවූ හෝ මෙතෙක් ඖෂධ සොයාගෙන නොමැති සංකූලතාවයන් ඇති වී තිබේද?",
        },
        isRequired,
        true,
      ),
      ...yesNoQuestionWithComment(
        "HaveTakenDrugs",
        {
          [ENGLISH_LOCALE]:
            "Are you now taking, or have you taken within the past two years, any alcohol or drugs (such as cigarettes, marijuana, amphetamines, barbiturates, cocaine, heroin, or other intoxicants) or mind-altering plants and substances (such as ayahuasca, peyote, LSD, etc.)?",
          [SINHALA_LOCALE]:
            "පසුගිය වසර දෙක තුළ ඔබ මත්පැන් හෝ මත්ද්‍රව්‍ය (සිගරට්, මරිජුවානා, ඇම්ෆෙටමින්, බාබිටියුරේට්, කොකේන්, හෙරොයින් හෝ වෙනත් මත් ද්‍රව්‍ය වැනි) හෝ මනස වෙනස් කරන ශාක සහ ද්‍රව්‍ය (අයුවස්කා, පෙයෝට්, LSD, ආදිය) භාවිත කර ඇත්ද?",
        },
        isRequired,
        true,
      ),
      ...yesNoQuestionWithComment(
        "Stress",
        {
          [ENGLISH_LOCALE]:
            "Do you suffer from stress or other such mental problems?",
          [SINHALA_LOCALE]:
            "ඔබ ආතතියෙන් හෝ වෙනත් එවැනි මානසික ගැටලුවලින් පීඩා විඳිනවාද? ",
        },
        isRequired,
        true,
        {
          [ENGLISH_LOCALE]:
            "If you are being treated for such disorders, please provide your history and other relevant information about your condition.",
          [SINHALA_LOCALE]:
            "ඔබ එවැනි ආබාධ සඳහා ප්‍රතිකාර කරන්නේ නම්, කරුණාකර ඔබගේ රෝග ඉතිහාසය සහ ඔබගේ තත්වය පිළිබඳ අදාල වෙනත් තොරතුරු ලබා දෙන්න.",
        },
      ),
      ...yesNoQuestionWithComment(
        "HasLitigations",
        {
          [ENGLISH_LOCALE]:
            "Do you have serious legal litigations that are bothering you, or similar unsettled duties to family, government, or society.?",
          [SINHALA_LOCALE]:
            "නීතිමය වශයෙන් පැහැර නොහැරිය හැකි යම් දඬුවමකින්, වගකීමකින්, රාජකාරී කටයුත්තකින් ඔබගේ පවුලට, රජයට හෝ සමාජයීය වශයෙන් බැඳී සිටිනවා ද?",
        },
        isRequired,
        true,
      ),
      ...yesNoQuestionWithComment(
        "HasDiseases",
        {
          [ENGLISH_LOCALE]:
            "Do you have any signs of diseases like Asthma, Kushta, Vana, cists (Visha gedi), boils, or epilepsy?",
          [SINHALA_LOCALE]:
            "ඔබ ඇස්ම, කුෂ්ඨ, වණ, විෂ ගෙඩි, සුදු කබර, ඇස්ම , අපස්මාරය (epilepsy) ආදී රෝගාබාධ තත්වයන්ගෙන් යුතු ද?",
        },
        isRequired,
        true,
      ),
      ...yesNoQuestionWithComment(
        "HasDeformities",
        {
          [ENGLISH_LOCALE]:
            "Are there any deformities in the body (for example amputated hands, legs, ears, etc.)?",
          [SINHALA_LOCALE]:
            "ශරීරයේ කිසියම් විකෘතිතාවයක් තිබේද? (උදාහරණ ලෙස යම්කිසි හේතුවක් නිසා අත්, කකුල්, කන් ආදි අවයව හෝ කොටස් ඉවත් කර ඇති ද?)",
        },
        isRequired,
        true,
      ),
    ],
  };
};

export default readinessCheckPage;
