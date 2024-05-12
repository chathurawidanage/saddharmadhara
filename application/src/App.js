import "./App.css";
import "survey-core/defaultV2.min.css";
import { Survey } from "survey-react-ui";
import { Model, surveyLocalization } from "survey-core";
import { useEffect, useMemo } from "react";

// todo validate NIC, Passport
// todo add emojis to the heading

const sinhalaLocaleStrings = {
  pagePrevText: "පෙ​ර පිටුවට",
  pageNextText: "ඊළඟ පිටුවට",
  completeText: "අයදුම් කරන්න",
  requiredError: "මෙම දත්තය ඇතුලත් කිරීම අනිවාර්‍ය ​වේ.",
  exceedMaxSize: "ගොනු​වේ විශාලත්වය {0} නොඉක්මවිය යුතුය.",
  booleanCheckedLabel: "​ඔව්",
  booleanUncheckedLabel: "නැත",
  previewText: "අවසාන පිටුවට(පෙරදසුන)",
  editText: "වෙනස්කරන්න",
  placeholder: "තෝරන්න...",
  filePlaceholder:
    "ෆයිල් එ​ක මෙතැනට ඇද දමන්න, නැතහොත් අප්ලෝඩ් කිරීමට ෆයිල් එ​කක් තේරීමට පහත බට්න් එ​ක ක්ලික් කරන්න.",
  chooseFileCaption: "ෆයිල් එ​කක් තෝරන්න",
  savingDataError: "දෝෂයක් සිදු වූ අතර අපට දත්​ත සුරැකීමට නොහැකි විය.",
  saveAgainButton: "නැවත උත්සාහ කරන්න",
  savingData: "දත්​ත සුරකිමින් පවතී...",
  invalidEmail: "කරණාකර වලංගු විද්‍යුත් තැපැල් ලිපිනයක් ඇතුළු කරන්න.",
};

const englishLocaleStrings = {
  previewText: "Last Page(Preview)",
};

surveyLocalization.locales["si"] = sinhalaLocaleStrings;
surveyLocalization.locales["default"] = englishLocaleStrings;

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
          name: name + "Comment",
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

const agreeDisagreeQuestion = (name, english, sinhala, validators) => {
  return {
    name,
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
    validators,
  };
};

// Copy the response from /api/trackedEntityAttributes.json?fields=id,code&paging=false
const d2IdsMap = {};
JSON.parse(
  `{"trackedEntityAttributes":[{"code":"NoBadHabbits","id":"ThRvZed4wxU"},{"code":"ReadFourNobleTruths","id":"wbllYsatR5l"},{"code":"DoAshubaBhavana","id":"DZgJUDEYKvH"},{"code":"UnderstandTrividaRathna","id":"q6N0kD78IS9"},{"code":"DoMaithreeBhavana","id":"ZnRv3kNDmun"},{"code":"NoPhones","id":"EJaujr9wSTz"},{"code":"HasDeformities","id":"nwItPNW72se"},{"code":"HasDiseases","id":"iaW1GDx6k3P"},{"code":"HasDeformitiesComment","id":"aHZ7BJDzntQ"},{"code":"UnattendedDeformitiesComment","id":"HtW0OMmthFQ"},{"code":"HaveKidsComment","id":"i3RptmIeSwR"},{"code":"HasLitigationsComment","id":"GL9bAKX2wl3"},{"code":"HasDiseasesComment","id":"nOm8SVX2VbC"},{"code":"StressComment","id":"Mp6LLGv4WOT"},{"code":"HaveTakenDrugsComment","id":"la4960WBUC3"},{"code":"HasPermissionComment","id":"QOGamVcvLPz"},{"code":"MedicalTreatmentsComment","id":"nTi2kp2C0v8"},{"code":"DateOfBirth","id":"oZkvTN1dcPw"},{"code":"Email","id":"lByRbJqnG5q"},{"code":"EmergencyContactName","id":"NgHvHow9RZs"},{"code":"EmergencyContactPhone","id":"uYHVvgUT65S"},{"code":"EmergencyContactRelationship","id":"duD6vVqtSCq"},{"code":"UnattendedDeformities","id":"RpNKpAufHbn"},{"code":"FullName","id":"fvk2p04ylAA"},{"code":"Gender","id":"tuKFO1uF5x5"},{"code":"HasPermission","id":"QGXYhZMXfnc"},{"code":"HaveKids","id":"Bpce3m4do80"},{"code":"OrdinationIntended","id":"kT2ExGjYbPS"},{"code":"HasLitigations","id":"g1QmlpA14bX"},{"code":"HomePhone","id":"ZRXiTWo2Vbq"},{"id":"aTV4MgCAFAX"},{"code":"PastInvolvementComment","id":"rrXapwmqJ3D"},{"code":"MaritalStatus","id":"B08mfPKrUiM"},{"code":"MedicalConditionsComment","id":"F2b0gJpgjLp"},{"code":"MobilePhone","id":"lLXB9cYYgEP"},{"code":"NameWithInitials","id":"MMb2cXBOrSY"},{"code":"NIC","id":"W1fmUMMnQdu"},{"code":"Objective","id":"KxFKodUg1kx"},{"code":"OtherIssuesComment","id":"iGNQ7t4qvcM"},{"code":"Passport","id":"hv3aLM80Mrn"},{"code":"Address","id":"ywoMYb2bCz5"},{"code":"Photo","id":"zMtxZwR7Kw5"},{"code":"PriamaryId","id":"EDhjneO1ofm"},{"code":"Profession","id":"EDMGB8x9lc3"},{"code":"Stress","id":"dgky5acnvG3"},{"code":"HaveTakenDrugs","id":"fyV0EfY0dnR"},{"code":"Whatsapp","id":"CpF36JSasMJ"}]}`
).trackedEntityAttributes.forEach((att) => {
  d2IdsMap[att.code] = att.id;
});

const surveyJson = {
  title: {
    default: "🪷 Saddharmadhara Application",
    si: "🪷 සද්ධර්මධාරා අයදුම්පත්‍රය",
  },
  showProgressBar: "top",
  showPreviewBeforeComplete: "showAnsweredQuestions",
  checkErrorsMode: "onValueChanged",
  showTOC: true,
  completedHtml: {
    default: "<h4>Thank you for applying to Saddharmadhara!</h4>",
    si: "<h4>සද්ධර්මධාරා සඳහා අයදුම් කළ ඔ​බ​ට ස්තුතියි!</h4>",
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
          d2Id: "bla",
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
          requiredIf: "{Passport} empty",
        },
        {
          name: "Passport",
          title: {
            default: "Passport Number",
            si: "ගමන් බලපත්‍ර අංක​ය",
          },
          type: "text",
          requiredIf: "{NIC} empty",
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
              value: "male",
              text: {
                default: "Male",
                si: "පුරුෂ",
              },
            },
            {
              value: "female",
              text: {
                default: "Female",
                si: "ස්ත්‍රී",
              },
            },
          ],
          isRequired: isRequired,
          showCommentArea: true,
          comment: "BlaCOmment",
        },
        {
          name: "MaritalStatus",
          title: { default: "Marital Status", si: "විවාහක/අවිවාහක බව" },
          type: "dropdown",
          choices: [
            {
              value: "single",
              text: {
                default: "Single",
                si: "අවිවාහක",
              },
            },
            {
              value: "married",
              text: {
                default: "Married",
                si: "විවාහක",
              },
            },
            {
              value: "widowed",
              text: {
                default: "Widowed",
                si: "වැන්දඹු",
              },
            },
            {
              value: "divorced",
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
          name: "HomePhone",
          title: { default: "Home Phone", si: "ස්ථාවර දුරකථන අංකය" },
          type: "text",
          inputType: "tel",
          isRequired: isRequired,
        },
        {
          name: "Whatsapp",
          title: { default: "Whatsapp", si: "වට්ස්ඇප් අංකය" },
          type: "text",
          inputType: "tel",
          isRequired: isRequired,
        },
        {
          name: "Email",
          title: { default: "Email", si: "විද්‍යුත් තැපැල් ලිපිනය" },
          type: "text",
          inputType: "email",
        },
        {
          name: "Profession",
          title: { default: "Profession", si: "රැකියාව" },
          type: "text",
        },
        {
          name: "Photo",
          title: {
            default: "Photo",
            si: "ඡායා රූප​ය",
          },
          type: "file",
          maxSize: 1024000 * 5, // 5MB
          acceptedTypes: "image/*",
          storeDataAsText: false,
          waitForUpload: true,
          allowMultiple: false,
          allowImagesPreview: false,
        },
      ],
    },
    {
      title: {
        default: "🚑 Emergency Contact",
        si: "🚑 හදිසි අවස්ථාවකදී දැනුම් දිය යුතු අයගේ විස්තර",
      },
      elements: [
        {
          name: "EmergencyContactName",
          type: "text",
          title: {
            default:
              "Name with initials of the person to be contacted in an emergency.",
            si: "හදිසි අවස්ථාවකදී සම්බන්ධ කර ගත යුතු අයකුගේ නම (මුලකුරු සමග).",
          },
          isRequired: isRequired,
        },
        {
          name: "EmergencyContactRelationship",
          type: "text",
          title: {
            default: "Applicant's relationship to emergency contact person.",
            si: "හදිසි අවස්ථාවකදී සම්බන්ධ කර ගත යුතු අය හා අයදුම්කරුගේ සම්බන්ධතාවය.",
          },
          isRequired: isRequired,
        },
        {
          name: "EmergencyContactPhone",
          type: "text",
          title: {
            default: "Phone number of the emergency contact.",
            si: "හදිසි අවස්ථාවකදී සම්බන්ධ කර ගත යුතු අයගේ දුරකථන අංකය.",
          },
          isRequired: isRequired,
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
          name: "OrdinationIntended",
          type: "boolean",
          title: {
            default:
              "Do you have intention of committing to the spiritual life (Ordination)?",
            si: "ආධ්‍යාත්මික ජීවිතයට (පැවිදිවීම) කැපවීමට ඔබට කිසියම් අදහසක් තිබේද?",
          },
          isRequired: isRequired,
        },
        {
          name: "Objective",
          type: "comment",
          title: {
            default:
              "State your objectives for participating in a meditation program.",
            si: "භාවනා වැඩසටහනට සම්බන්ධ වීමේ අරමුණ කෙටියෙන් සඳහන් කරන්න.",
          },
          isRequired: isRequired,
        },
        {
          name: "PastInvolvementComment",
          type: "comment",
          title: {
            default:
              "Please state the nature and dates of involvement in the past with Most Ven. Gnanavimala Maha Thero and Most Ven. Bambalapitiye Gnanaloka Thero.",
            si: "අතිපූජනීය බම්බලපිටියේ ඤාණාලෝක ස්වාමීන්වහන්සේ ගේ හෝ ආචාර්ය ජර්මන් ජාතික අතිපූජනීය ඤාණවිමල ස්වාමීන් වහන්සේලා සමඟ ඔබ අතීතයේ දී කිනම් ආකාරයකට සම්බන්ධ වී ඇති ද? එසේනම් එයට අදාළ දින වකවානු සඳහන් කරන්න.",
          },
        },
        {
          name: "MedicalConditionsComment",
          type: "comment",
          title: {
            default:
              "Please share details regarding any existing medical conditions or disabilities, if applicable.",
            si: "ඔබ ගේ සෞඛ්‍ය තත්වයේ ගැටලු හා අපහසුතා ඇත්නම් ඒ පිළිබඳ තොරතුරු සඳහන් කරන්න.",
          },
        },
        {
          name: "MedicalTreatmentsComment",
          type: "comment",
          title: {
            default:
              "Please specify the treatments currently being administered for the mentioned ailments and disabilities.",
            si: "ඔබ දැනට යම් රෝගාබාධ තත්වයකට බෙහෙත් ඖෂධ/විශේෂ ප්‍රතිකාර ආදිය ලබා ගනියි නම් ඒ පිළිබඳ තොරතුරු සඳහන් කරන්න.",
          },
        },
        {
          name: "OtherIssuesComment",
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
          "Do you have full permission from your spouse/parents/guardian/employer or any such duty-bound relationships (for venerables, this could be the Monastery Head, Upajjhāya, or Ācariya) to attend the residential meditation program?",
          "ඔබට මෙම නේවාසික භාවනා වැඩසටහන හා සම්බන්ධ වීමට දෙමව්පියන්ගෙන්/භාරකරුගෙන්/රැකියා කරන ස්ථානයෙන් සහ වෙනත් එවැනි විශේෂ වගකිවයුතු සම්බන්ධතාවලින් සම්පූර්ණ අවසරය ලැබී තිබේ ද?",
          false
        ),
        ...yesNoQuestionWithComment(
          "HaveKids",
          "Do you have children under the age of 12?",
          "වයස අවුරුදු 12ට අඩු දරුවන් සිටී ද?",
          true,
          "Please provide the details about their age groups. Have formal measures been taken for their protection during the meditation program?",
          "ඔවුන්ගේ වයස් කාණ්ඩ පිළිබඳව විස්තර සදහන් කරන්න. භාවනා වැඩසටහන් කාලය තුළ ඔවුන්ගේ රැකවරණය සදහා විධිමත් ක්‍රියාමාර්ග ගෙන තිබේද?"
        ),
        ...yesNoQuestionWithComment(
          "UnattendedDeformities",
          "Are you free from illnesses or deformities from birth, or which have arisen in a later period in life, which have not been cured up till now or there has been no medication found so far?",
          "ඔබ උපතේ සිටම පවතින රෝගාබාධවලින් හෝ විකෘතිතාවලින් පෙළෙන්නේද, එසේත් නැතිනම් ජීවිතයේ පසු කාලයක ඇති වූ මෙතෙක් සුව නොවූ හෝ මෙතෙක් ඖෂධ සොයාගෙන නොමැති සංකූලතාවයන් ඇති වී තිබේද?",
          true
        ),
        ...yesNoQuestionWithComment(
          "HaveTakenDrugs",
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
          "HasLitigations",
          "Do you have serious legal litigations that are bothering you, or similar unsettled duties to family, government, or society.?",
          "නීතිමය වශයෙන් පැහැර නොහැරිය හැකි යම් දඬුවමකින්, වගකීමකින්, රාජකාරී කටයුත්තකින් ඔබගේ පවුලට, රජයට හෝ සමාජයීය වශයෙන් බැඳී සිටිනවා ද?",
          true
        ),
        ...yesNoQuestionWithComment(
          "HasDiseases",
          "Do you have any signs of diseases like Asthma, Kushta, Vana, cists (Visha gedi), boils, or epilepsy?",
          "ඔබ ඇස්ම, කුෂ්ඨ, වණ, විෂ ගෙඩි, සුදු කබර, ඇස්ම , අපස්මාරය (epilepsy) ආදී රෝගාබාධ තත්වයන්ගෙන් යුතු ද?",
          true
        ),
        ...yesNoQuestionWithComment(
          "HasDeformities",
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
        default:
          "If you intend to join the meditation program, indicate whether you are able to follow the following instructions prepared according to the instructions given by Most Reverend Bambalapitiya Gnanaloka Thero.",
        si: "භාවනා වැඩසටහන සඳහා සම්බන්වීමට අදහස් කරන ඔබ, අපගේ අතිපූජනීය බම්බලපිටියේ ඤාණාලෝක ස්වාමීන් වහන්සේගේ අනුශාසනා අනුව සකස් කරන ලද පහත සදහන් උපදෙස් සහ ඒවා පිළිපැදීමට ඔබට හැකියාවක් තිබේද යන්න සඳහන් කරන්න.",
      },
      elements: [
        agreeDisagreeQuestion(
          "NoPhones",
          "You should try to reduce the use of cell phones, the internet, and other sense-stimulating activities for some time (preferably two weeks, otherwise at least five days) prior to the retreat date.",
          "ඔබ භාවනා වැඩසටහන සහභාගී වීමට නියමිත දිනට පෙර යම් කාලයක් (වඩාත් සුදුසු සති දෙකක්, එසේ නොමැති නම් අවම වශයෙන් දින පහක්) ජංගම දුරකථන, අන්තර්ජාලය සහ අනෙකුත් සංවේදී ක්‍රියාකාරකම් භාවිතය අවම කිරීමට උත්සාහ කළ යුතුය."
        ),
        agreeDisagreeQuestion(
          "NoBadHabbits",
          "You should try to avoid bad habits like masturbation or any kind of sexual activity at a physical level for at least two weeks prior to the retreat.",
          "භාවනා වැඩසටහන පෙර අවම වශයෙන් සති දෙකකටවත් පෙර ශාරීරික මට්ටමේ ලිංගික ක්‍රියාකාරකම් වලින් වැළකී සිටීමට මෙන්ම ස්වයංවින්දනය වැනි නරක පුරුදුවලින් වැළකී සිටීමට හෝ ඔබ උත්සාහ කිරීම."
        ),
        agreeDisagreeQuestion(
          "DoAshubaBhavana",
          "Practice 'Ashuba Bhavana' (reflection on unattractiveness) at least two weeks prior to the retreat.",
          "භාවනා වැඩසටහන පෙර අවම වශයෙන් සති දෙකකට පෙර සිටම අසුබ භාවනාව පුහුණු කිරීම."
        ),
        agreeDisagreeQuestion(
          "DoMaithreeBhavana",
          "Practice compassion (Maithree Bhavana) at least two weeks prior to the retreat.",
          "භාවනා වැඩසටහන පෙර අවම වශයෙන් සති දෙකකට පෙර සිටම මෛත්‍රීය භාවනාව පුහුණු කිරීම."
        ),
        agreeDisagreeQuestion(
          "UnderstandTrividaRathna",
          "With the understanding of the virtues of 'Trivida Rathna', cultivate pure and honest faith and practice Buddhanussathi, Dhammanussathi, Sanghanussathi at least two weeks prior to the retreat in advance.",
          "'ත්‍රිවිධ රත්නයේ' ගුණ අවබෝධ කරගෙන පිරිසුදු අවංක ශ්‍රද්ධාව වඩවාගෙන බුද්ධානුස්සති, ධම්මානුස්සති, සංඝානුස්සති යන පිළිවෙත් පුරුදු පුහුණු වීම."
        ),
        agreeDisagreeQuestion(
          "ReadFourNobleTruths",
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
          "FinalAgreement",
          "I hereby affirm the accuracy of the information provided above, to the best of my knowledge. I know that providing false information would reject my application. I willingly confirm my readiness to participate in the residential meditation program without any interruptions and with full commitment for the specified duration.",
          "ඉහතින් සපයා ඇති තොරතුරුවල නිරවද්‍යතාවය මම මෙයින් තහවුරු කරමි. අසත්‍ය තොරතුරු ඉදිරිපත් කිරීම භාවනා වැඩසටහන් සදහා තෝරා ගැනීමට නුසුදුසුකමක් වන අතර, නැවත භාවනා වැඩසටහනකට අයදුම් කිර්‍රමට ඇති අවස්ථාවද මග හැරෙන බව දනිමි. කිසිදු බාධාවකින් තොරව සහ නියමිත කාලසීමාව සඳහා පූර්ණ කැපවීමෙන් නේවාසික භාවනා වැඩසටහනට සහභාගී වීමට මගේ සූදානම මම කැමැත්තෙන් තහවුරු කරමි.",
          [
            {
              type: "expression",
              expression: "{FinalAgreement}",
              text: {
                default:
                  "Sorry. You can't submit the application without agreeing to these terms.",
                si: "සමාවන්න. මෙම නියමයන්ට එකඟ නොවී ඔබට අයදුම්පත ඉදිරිපත් කළ නොහැක.",
              },
            },
          ]
        ),
      ],
    },
  ],
};

function App() {
  const survey = useMemo(() => new Model(surveyJson));

  useEffect(() => {
    survey.locale = "si";
    survey.onValueChanged.add((sender, options) => {
      if (sender.data && sender.data.Language) {
        if (sender.data.Language === "English") {
          survey.locale = "default";
        } else {
          survey.locale = "si";
        }
      }
    });
  }, []);

  survey.onUploadFiles.add((_, options) => {
    console.log(_, options);
    const formData = new FormData();
    for (let file of options.files) {
      formData.append("file", file);
      if (file?.type?.indexOf("image/") < 0) {
        options.callback(
          [],
          ["Unsupported file type. Only images are supported."]
        );
        return;
      }
    }

    fetch("http://localhost:8080/api/fileResources", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: "Basic YWRtaW46ZGlzdHJpY3Q=",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("File data", data);
        options.callback(
          options.files.map((file) => {
            return {
              file: file,
              content: data?.response?.fileResource?.id,
            };
          })
        );
      })
      .catch((error) => {
        console.error("File upload Error: ", error);
        options.callback([], ["An error occurred during file upload."]);
      });
  });

  survey.onComplete.add((sender, options) => {
    options.showSaveInProgress();

    let Photo = sender.data.Photo?.find((el) => el !== undefined)?.content;

    let attributes = {
      ...sender.data,
      PriamaryId: [sender.data.NIC, sender.data.Passport].find(
        (el) => el !== undefined
      ),
      Photo,
    };

    console.log(attributes);

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
            attributes: Object.entries(attributes)
              .filter((entry) => d2IdsMap[entry[0]])
              .map((entry) => {
                return {
                  attribute: d2IdsMap[entry[0]],
                  value: entry[1],
                };
              }),
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
  });
  return (
    <div className="App">
      <Survey model={survey} />
    </div>
  );
}

export default App;
