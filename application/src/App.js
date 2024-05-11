import "./App.css";
import "survey-core/defaultV2.min.css";
import { Survey } from "survey-react-ui";
import { Model, surveyLocalization } from "survey-core";
import { useEffect } from "react";

// todo validate NIC, Passport
// todo add emojis to the heading

const customLocaleStrings = {
  pagePrevText: "පෙ​ර පිටුවට",
  pageNextText: "ඊළඟ පිටුවට",
  completeText: "අයදුම් කරන්න",
  requiredError: "මෙම දත්තය ඇතුලත් කිරීම අනිවාර්‍ය ​වේ.",
  exceedMaxSize: "ගොනු​වේ විශාලත්වය {0} නොඉක්මවිය යුතුය.",
  booleanCheckedLabel: "​ඔව්",
  booleanUncheckedLabel: "නැත",
  previewText: "පෙරදසුන",
  editText: "වෙනස්කරන්න",
  placeholder: "තෝරන්න...",
  filePlaceholder:
    "ෆයිල් එ​ක මෙතැනට ඇද දමන්න, නැතහොත් අප්ලෝඩ් කිරීමට ෆයිල් එ​කක් තේරීමට පහත බොත්තම ක්ලික් කරන්න.",
  chooseFileCaption: "ෆයිල් එ​කක් තෝරන්න",
  savingDataError: "දෝෂයක් සිදු වූ අතර අපට දත්​ත සුරැකීමට නොහැකි විය.",
  saveAgainButton: "නැවත උත්සාහ කරන්න",
  savingData: "දත්​ත සුරකිමින් පවතී...",
};

surveyLocalization.locales["si"] = customLocaleStrings;

const isRequired = false; // set required fields on or off for testing purposes

const yesNoQuestionWithComment = (
  name,
  english,
  sinhala,
  moreOnYes = true,
  englishMorePrompt = null,
  sinhalaMorePrompt = null
) => {
  englishMorePrompt =
    englishMorePrompt == null
      ? `If your response is ${
          moreOnYes ? "Yes" : "No"
        } or if you have additional information to provide, please elaborate further.`
      : englishMorePrompt;
  sinhalaMorePrompt =
    sinhalaMorePrompt == null
      ? `ඔබේ පිළිතුර ${
          moreOnYes ? "ඔව්" : "නැ​ත"
        } හෝ වෙනත් විස්තර තිබේ නම්, කරුණාකර එම විස්තර සපයන්න.`
      : sinhalaMorePrompt;
  return [
    {
      name: name,
      type: "boolean",
      title: {
        default: english,
        si: sinhala,
      },
      isRequired: isRequired,
      elements: [
        {
          type: "comment",
          title: {
            default: englishMorePrompt,
            si: sinhalaMorePrompt,
          },
          visibleIf: `{${name}} = ${moreOnYes.toString()}`,
        },
      ],
    },
    {
      type: "comment",
      title: {
        default: englishMorePrompt,
        si: sinhalaMorePrompt,
      },
      visibleIf: `{${name}} = ${moreOnYes}`,
    },
  ];
};

const agreeDisagreeQuestion = (english, sinhala) => {
  return {
    type: "boolean",
    title: {
      default: english,
      si: sinhala,
    },
    isRequired: isRequired,
    labelTrue: {
      default: "I Agree",
      si: "එකඟ වෙමි",
    },
    labelFalse: {
      default: "I Disagree",
      si: "එකඟ නොවෙමි",
    },
  };
};

const surveyJson = {
  title: {
    default: "🪷 Saddharma Dhara Application",
    si: "🪷 සද්ධර්මධාරා අයදුම්පත්‍රය",
  },
  showProgressBar: "top",
  showPreviewBeforeComplete: "showAllQuestions",
  checkErrorsMode: "onValueChanged",
  showTOC: true,
  completedHtml: {
    default: "<h4>Thank you for applying to Saddharmadhara!</h4>",
    si: "<h4>සද්ධර්මධාරා සඳහා අයදුම් කළ ඔඹ​ට ස්තුතියි!</h4>",
  },
  pages: [
    {
      title: {
        default: "🌐 Language",
        si: "🌐 භාෂාව",
      },
      elements: [
        {
          name: "Language",
          title: {
            default: "Select a language for filling the application.",
            si: "අයදුම්පත සමුපූර්ණ කිරීමට භාෂාවක් තෝරාගන්න.",
          },
          colCount: 2,
          type: "radiogroup",
          choices: ["සිංහල", "English"],
          defaultValue: "සිංහල",
          isRequired: isRequired,
        },
      ],
    },
    {
      title: {
        default: "✍🏼 Instructions",
        si: "✍🏼 උපදෙස්",
      },
      elements: [
        {
          type: "html",
          html: {
            default: `
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
            si: `
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
    },
    {
      title: {
        default: "🪪 Identification",
        si: "🪪 හදුනාගැනීම",
      },
      description: {
        default: "<MISSING ENGLISH>",
        si: "භාවනා වැඩසටහනට සහභාගි වන අවස්ථාවේදී ඔබ ඉදිරිපත් කරන හැදුනුම්පතේ අංකය මෙම අංකය සමග නොගැලපේ නම් වැඩසටහනට සම්බන්ධ වීමට ඇති අවස්ථාව අහිමි වී යා හැකිය",
      },
      elements: [
        {
          name: "NIC",
          title: {
            default: "National Identity Card No. (NIC)",
            si: "ජාතික හැදුනුම්පත් අංකය",
          },
          type: "text",
          // requiredIf: "{Passport} empty",
        },
        {
          name: "Passport",
          title: {
            default: "Passport Number",
            si: "ගමන් බලපත්‍ර අංක​ය",
          },
          type: "text",
          // requiredIf: "{NIC} empty",
        },
      ],
    },
    {
      title: {
        default: "🔖 Personal Details",
        si: "🔖 පුද්ගලික විස්තර",
      },
      elements: [
        {
          name: "FullName",
          title: { default: "Full Name", si: "සම්පූර්ණ නම" },
          type: "text",
          isRequired: isRequired,
        },
        {
          name: "NameWithInitials",
          title: { default: "Name with Initials", si: "මුලකුරු සමග නම" },
          type: "text",
          isRequired: isRequired,
        },
        {
          name: "DateOfBirth",
          title: { default: "Date of Birth", si: "උපන්දිනය" },
          type: "text",
          inputType: "date",
          isRequired: isRequired,
        },
        {
          name: "Gender",
          title: { default: "Gender", si: "ස්ත්‍රී/පුරුෂ භාවය" },
          type: "radiogroup",
          choices: [
            {
              value: "Male",
              text: {
                default: "Male",
                si: "පුරුෂ",
              },
            },
            {
              value: "Female",
              text: {
                default: "Female",
                si: "ස්ත්‍රී",
              },
            },
          ],
          isRequired: isRequired,
        },
        {
          name: "MaritalStatus",
          title: { default: "Marital Status", si: "විවාහක/අවිවාහක බව" },
          type: "dropdown",
          choices: [
            {
              value: "Single",
              text: {
                default: "Single",
                si: "අවිවාහක",
              },
            },
            {
              value: "Married",
              text: {
                default: "Married",
                si: "විවාහක",
              },
            },
            {
              value: "Widowed",
              text: {
                default: "Widowed",
                si: "වැන්දඹු",
              },
            },
            {
              value: "Divorced",
              text: {
                default: "Divorced",
                si: "දික්කසා​ද",
              },
            },
          ],
          isRequired: isRequired,
        },
        {
          name: "Address",
          title: { default: "Permenant Address", si: "ස්ථිර පදිංචි ලිපිනය" },
          type: "comment",
          isRequired: isRequired,
        },
        {
          name: "MobilePhone",
          title: { default: "Mobile Phone", si: "ජංගම දුරකථන අංකය" },
          type: "text",
          inputType: "tel",
          isRequired: isRequired,
        },
        {
          name: "Photo",
          title: {
            default: "Photo",
            si: "ඡායා රූප​ය",
          },
          type: "file",
          maxSize: 102400,
        },
      ],
    },
    {
      title: {
        default: "🧘 Nature of the Spiritual Pursuits",
        si: "🧘 අධ්‍යාත්මික කටයුතු වල ස්වභාවය",
      },
      elements: [
        {
          type: "boolean",
          title: {
            default:
              "Do you have intention of committing to the spiritual life (Ordination)?",
            si: "ආධ්‍යාත්මික ජීවිතයට (පැවිදිවීම) කැපවීමට ඔබට කිසියම් අදහසක් තිබේද?",
          },
          isRequired: isRequired,
        },
        {
          type: "comment",
          title: {
            default:
              "State your objectives for participating in a meditation program.",
            si: "භාවනා වැඩසටහනට සම්බන්ධ වීමේ අරමුණ කෙටියෙන් සඳහන් කරන්න.",
          },
          isRequired: isRequired,
        },
        {
          type: "comment",
          title: {
            default:
              "Please state the nature and dates of involvement in the past with Most Ven. Gnanavimala Maha Thero and Most Ven. Bambalapitiye Gnanaloka Thero.",
            si: "අතිපූජනීය බම්බලපිටියේ ඤාණාලෝක ස්වාමීන්වහන්සේ ගේ හෝ ආචාර්ය ජර්මන් ජාතික අතිපූජනීය ඤාණවිමල ස්වාමීන් වහන්සේලා සමඟ ඔබ අතීතයේ දී කිනම් ආකාරයකට සම්බන්ධ වී ඇති ද? එසේනම් එයට අදාළ දින වකවානු සඳහන් කරන්න.",
          },
        },
        {
          type: "comment",
          title: {
            default:
              "Please share details regarding any existing medical conditions or disabilities, if applicable.",
            si: "ඔබ ගේ සෞඛ්‍ය තත්වයේ ගැටලු හා අපහසුතා ඇත්නම් ඒ පිළිබඳ තොරතුරු සඳහන් කරන්න.",
          },
        },
        {
          type: "comment",
          title: {
            default:
              "Please specify the treatments currently being administered for the mentioned ailments and disabilities.",
            si: "ඔබ දැනට යම් රෝගාබාධ තත්වයකට බෙහෙත් ඖෂධ/විශේෂ ප්‍රතිකාර ආදිය ලබා ගනියි නම් ඒ පිළිබඳ තොරතුරු සඳහන් කරන්න.",
          },
        },
        {
          type: "comment",
          title: {
            default:
              "Are there any other issues or challenges you are currently facing that we should be aware of?",
            si: "අප දැනුවත් විය යුතු වෙනත් ඔබගේ යම් විශේෂ ගැටලු ඇති නම් ඒ පිළිබඳ තොරතුරු සඳහන් කරන්න.",
          },
          description: {
            default:
              "These could include personal, financial, social, legal, or any other relevant concerns.",
            si: "පෞද්ගලික/ ආර්ථික/ සමාජයීය/නීතිමය ආදී ඕනෑම කාරණයකට අදාළ විය හැක.",
          },
        },
      ],
    },
    {
      title: {
        default: "❓ Heading needed",
      },
      description: {
        default:
          "Record you truthful and honest response to the following questions.",
        si: "පහත සඳහන් ප්‍රශ්නවලට ඔබගේ අවංක සත්‍යවාදී ප්‍රතිචාරය අදාළ කොටුව තුළ සටහන් කරන්න.",
      },
      elements: [
        ...yesNoQuestionWithComment(
          "HasPermission",
          "Do you have full permission from your spouse/parents/guardian /employer or any such duty-bound relationships (for venerables, this could be the Monastery Head, Upajjhāya, or Ācariya) to attend the residential meditation program?",
          "ඔබට මෙම නේවාසික භාවනා වැඩසටහන හා සම්බන්ධ වීමට දෙමව්පියන්ගෙන්/භාරකරුගෙන්/රැකියා කරන ස්ථානයෙන් සහ වෙනත් එවැනි විශේෂ වගකිවයුතු සම්බන්ධතාවලින් සම්පූර්ණ අවසරය ලැබී තිබේ ද?",
          false
        ),
        ...yesNoQuestionWithComment(
          "Kids",
          "Do you have children under the age of 12?",
          "වයස අවුරුදු 12ට අඩු දරුවන් සිටී ද?",
          true,
          "Please provide the details about their age groups. Have formal measures been taken for their protection during the meditation program?",
          "ඔවුන්ගේ වයස් කාණ්ඩ පිළිබඳව විස්තර සදහන් කරන්න. භාවනා වැඩසටහන් කාලය තුළ ඔවුන්ගේ රැකවරණය සදහා විධිමත් ක්‍රියාමාර්ග ගෙන තිබේද?"
        ),
        ...yesNoQuestionWithComment(
          "BirthDefects",
          "Are you free from illnesses or deformities from birth, or which have arisen in a later period in life, which have not been cured up till now or there has been no medication found so far?",
          "ඔබ උපතේ සිටම පවතින රෝගාබාධවලින් හෝ විකෘතිතාවලින් පෙළෙන්නේද, එසේත් නැතිනම් ජීවිතයේ පසු කාලයක ඇති වූ මෙතෙක් සුව නොවූ හෝ මෙතෙක් ඖෂධ සොයාගෙන නොමැති සංකූලතාවයන් ඇති වී තිබේද?",
          true
        ),
        ...yesNoQuestionWithComment(
          "Drugs",
          "Are you now taking, or have you taken within the past two years, any alcohol or drugs (such as cigarettes, marijuana, amphetamines, barbiturates, cocaine, heroin, or other intoxicants) or mind-altering plants and substances (such as ayahuasca, peyote, LSD, etc.)?",
          "පසුගිය වසර දෙක තුළ ඔබ මත්පැන් හෝ මත්ද්‍රව්‍ය (සිගරට්, මරිජුවානා, ඇම්ෆෙටමින්, බාබිටියුරේට්, කොකේන්, හෙරොයින් හෝ වෙනත් මත් ද්‍රව්‍ය වැනි) හෝ මනස වෙනස් කරන ශාක සහ ද්‍රව්‍ය (අයුවස්කා, පෙයෝට්, LSD, ආදිය) භාවිත කර ඇත්ද?",
          true
        ),
        ...yesNoQuestionWithComment(
          "Stress",
          "Do you suffer from stress or other such mental problems?",
          "ඔබ ආතතියෙන් හෝ වෙනත් එවැනි මානසික ගැටලුවලින් පීඩා විඳිනවාද? ",
          true,
          "If you are being treated for such disorders, please provide your history and other relevant information about your condition.",
          "ඔබ එවැනි ආබාධ සඳහා ප්‍රතිකාර කරන්නේ නම්, කරුණාකර ඔබගේ රෝග ඉතිහාසය සහ ඔබගේ තත්වය පිළිබඳ අදාල වෙනත් තොරතුරු ලබා දෙන්න."
        ),
        ...yesNoQuestionWithComment(
          "Legal",
          "Do you have serious legal litigations that are bothering you, or similar unsettled duties to family, government, or society.?",
          "නීතිමය වශයෙන් පැහැර නොහැරිය හැකි යම් දඬුවමකින්, වගකීමකින්, රාජකාරී කටයුත්තකින් ඔබගේ පවුලට, රජයට හෝ සමාජයීය වශයෙන් බැඳී සිටිනවා ද?",
          true
        ),
        ...yesNoQuestionWithComment(
          "Diseases",
          "Do you have any signs of diseases like Asthma, Kushta, Vana, cists (Visha gedi), boils, or epilepsy?",
          "ඔබ ඇස්ම, කුෂ්ඨ, වණ, විෂ ගෙඩි, සුදු කබර, ඇස්ම , අපස්මාරය (epilepsy) ආදී රෝගාබාධ තත්වයන්ගෙන් යුතු ද?",
          true
        ),
        ...yesNoQuestionWithComment(
          "Deformities",
          "Are there any deformities in the body (for example amputated hands, legs, ears, etc.)?",
          "ශරීරයේ කිසියම් විකෘතිතාවයක් තිබේද (උදාහරණ ලෙස යම්කිසි හේතුවක් නිසා අත්, කකුල්, කන් ආදි අවයව හෝ කොටස් ඉවත් කර ඇති ද?",
          true
        ),
      ],
    },
    {
      title: {
        default: "☑️ Heading needed",
      },
      description: {
        default: "",
        si: "භාවනා වැඩසටහන සඳහා සම්බන්වීමට අදහස් කරන ඔබ, අපගේ අතිපූජනීය බම්බලපිටියේ ඤාණාලෝක ස්වාමීන් වහන්සේගේ අනුශාසනා අනුව සකස් කරන ලද පහත සදහන් උපදෙස් සහ ඒවා පිළිපැදීමට ඔබට හැකියාවක් තිබේද යන්න සඳහන් කරන්න.",
      },
      elements: [
        agreeDisagreeQuestion(
          "You should try to reduce the use of cell phones, the internet, and other sense-stimulating activities for some time (preferably two weeks, otherwise at least five days) prior to the retreat date.",
          "ඔබ භාවනා වැඩසටහන සහභාගී වීමට නියමිත දිනට පෙර යම් කාලයක් (වඩාත් සුදුසු සති දෙකක්, එසේ නොමැති නම් අවම වශයෙන් දින පහක්) ජංගම දුරකථන, අන්තර්ජාලය සහ අනෙකුත් සංවේදී ක්‍රියාකාරකම් භාවිතය අවම කිරීමට උත්සාහ කළ යුතුය."
        ),
        agreeDisagreeQuestion(
          "You should try to avoid bad habits like masturbation or any kind of sexual activity at a physical level for at least two weeks prior to the retreat.",
          "භාවනා වැඩසටහන පෙර අවම වශයෙන් සති දෙකකටවත් පෙර ශාරීරික මට්ටමේ ලිංගික ක්‍රියාකාරකම් වලින් වැළකී සිටීමට මෙන්ම ස්වයංවින්දනය වැනි නරක පුරුදුවලින් වැළකී සිටීමට හෝ ඔබ උත්සාහ කිරීම."
        ),
        agreeDisagreeQuestion(
          "Practice 'Ashuba Bhavana' (reflection on unattractiveness) at least two weeks prior to the retreat.",
          "භාවනා වැඩසටහන පෙර අවම වශයෙන් සති දෙකකට පෙර සිටම අසුබ භාවනාව පුහුණු කිරීම."
        ),
        agreeDisagreeQuestion(
          "Practice compassion (Maithree Bhavana) at least two weeks prior to the retreat.",
          "භාවනා වැඩසටහන පෙර අවම වශයෙන් සති දෙකකට පෙර සිටම මෛත්‍රීය භාවනාව පුහුණු කිරීම."
        ),
        agreeDisagreeQuestion(
          "With the understanding of the virtues of 'Trivida Rathna', cultivate pure and honest faith and practice Buddhanussathi, Dhammanussathi, Sanghanussathi at least two weeks prior to the retreat in advance.",
          "'ත්‍රිවිධ රත්නයේ' ගුණ අවබෝධ කරගෙන පිරිසුදු අවංක ශ්‍රද්ධාව වඩවාගෙන බුද්ධානුස්සති, ධම්මානුස්සති, සංඝානුස්සති යන පිළිවෙත් පුරුදු පුහුණු වීම."
        ),
        agreeDisagreeQuestion(
          "Have some Dhamma knowledge about the basic facts (four noble truths) of Buddhism - (Peruse the book 'The Word of the Buddha' written by the German monk Most Venerable Gnayanathiloka Thero)",
          "බුදුදහමේ මූලික කරුණු (උතුම් චතුරාර්ය සත්‍යය) පිළිබඳව යම් දහම් දැනුමක් ලබා ගැනීම - (ඒ සඳහා ඔබට ගෞරවනීය ස්වාමීන්වහන්සේ විසින් අනුදැන වදාළ පරිදි ජර්මානු ජාතික අතිපූජනීය ඤාණතිලෝක ස්වාමීන් වහන්සේ විසින් ලියන ලද ‘බුද්ධ වචනය’ ග්‍රන්ථය පරිශීලනය කළ හැකිය)"
        ),
      ],
    },
    {
      title: {
        default: "💬 Special Comments",
        si: "💬 වෙනත් තොරතුරු",
      },
      elements: [
        {
          type: "comment",
          title: {
            default:
              "Please state if you have any special comments regarding the applicant.",
            si: "අයදුම්කරු පිළිබඳ විශේෂයෙන් දැනුවත් කිරීමට යමක් ඇති නම් ඒ පිළිබඳ තොරතුරු.",
          },
        },
      ],
    },
    {
      title: {
        default: "🤝 Agreement",
        si: "🤝 එකගතාව​ය",
      },
      elements: [
        agreeDisagreeQuestion(
          "I hereby affirm the accuracy of the information provided above, to the best of my knowledge. I know that providing false information would reject my application. I willingly confirm my readiness to participate in the residential meditation program without any interruptions and with full commitment for the specified duration.",
          "ඉහතින් සපයා ඇති තොරතුරුවල නිරවද්‍යතාවය මම මෙයින් තහවුරු කරමි. අසත්‍ය තොරතුරු ඉදිරිපත් කිරීම භාවනා වැඩසටහන් සදහා තෝරා ගැනීමට නුසුදුසුකමක් වන අතර, නැවත භාවනා වැඩසටහනකට අයදුම් කිර්‍රමට ඇති අවස්ථාවද මග හැරෙන බව දනිමි. කිසිදු බාධාවකින් තොරව සහ නියමිත කාලසීමාව සඳහා පූර්ණ කැපවීමෙන් නේවාසික භාවනා වැඩසටහනට සහභාගී වීමට මගේ සූදානම මම කැමැත්තෙන් තහවුරු කරමි."
        ),
      ],
    },
  ],
};

function App() {
  const survey = new Model(surveyJson);

  useEffect(() => {
    survey.locale = "si";
    survey.onValueChanged.add((sender, options) => {
      if (sender.data && sender.data.Language) {
        console.log(options.question.jsonObj);
        if (sender.data.Language === "English") {
          survey.locale = "default";
        } else {
          survey.locale = "si";
        }
      }
    });
  }, []);

  survey.onComplete.add((sender, options) => {
    options.showSaveInProgress();
    fetch("http://localhost/api/submitForm/", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        trackedEntities: [
          {
            trackedEntityType: "j5l8gwYkmvg",
            orgUnit: "GRcUwrSIcZv",
            enrollments: [
              {
                orgUnit: "GRcUwrSIcZv",
                program: "KdYt2OP9VjD",
                enrolledAt: Date.now(),
                occurredAt: Date.now(),
              },
            ],
          },
        ],
      }),
    }).then((response) => {
      if (response.status != 200) {
        options.showSaveError();
      } else {
        options.showSaveSuccess();
      }
      console.log(response);
    });
    console.log(options);
    console.log(JSON.stringify(sender.data, null, 3));
  });
  return (
    <div className="App">
      <Survey model={survey} />
    </div>
  );
}

export default App;
