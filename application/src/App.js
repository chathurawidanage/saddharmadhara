import "./App.css";
import "survey-core/defaultV2.min.css";
import { Survey } from "survey-react-ui";
import { Model, surveyLocalization } from "survey-core";
import { useEffect } from "react";

// todo validate NIC, Passport

const customLocaleStrings = {
  pagePrevText: "පෙ​ර පිටුවට",
  pageNextText: "ඊළඟ පිටුවට",
  completeText: "අයදුම් කරන්න",
  requiredError: "මෙම දත්තය ඇතුලත් කිරීම අනිවාර්‍ය ​වේ.",
  exceedMaxSize: "ගොනු​වේ විශාලත්වය {0} නොඉක්මවිය යුතුය.",
  booleanCheckedLabel: "​ඔව්",
  booleanUncheckedLabel: "නැත",
};

surveyLocalization.locales["si"] = customLocaleStrings;

const isRequired = false;

const surveyJson = {
  title: {
    default: "Saddharma Dhara Application",
    si: "සද්ධර්මධාරා අයදුම්පත්‍රය",
  },
  showProgressBar: "top",
  checkErrorsMode: "onValueChanged",
  showTOC: true,
  pages: [
    {
      title: {
        default: "Language",
        si: "භාෂාව",
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
        default: "Instructions",
        si: "උපදෙස්",
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
        default: "Identification",
        si: "හදුනාගැනීම",
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
        default: "Personal Details",
        si: "පුද්ගලික විස්තර",
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
        default: "Nature of the Spiritual Pursuits",
        si: "අධ්‍යාත්මික කටයුතු වල ස්වභාවය",
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
        default: "Heading needed",
      },
      description: {
        default:
          "Record you truthful and honest response to the following questions.",
        si: "පහත සඳහන් ප්‍රශ්නවලට ඔබගේ අවංක සත්‍යවාදී ප්‍රතිචාරය අදාළ කොටුව තුළ සටහන් කරන්න.",
      },
      elements: [
        {
          name: "HasPermission",
          type: "boolean",
          title: {
            default:
              "Do you have full permission from your spouse/parents/guardian /employer or any such duty-bound relationships (for venerables, this could be the Monastery Head, Upajjhāya, or Ācariya) to attend the residential meditation program?",
            si: "ඔබට මෙම නේවාසික භාවනා වැඩසටහන හා සම්බන්ධ වීමට දෙමව්පියන්ගෙන්/භාරකරුගෙන්/රැකියා කරන ස්ථානයෙන් සහ වෙනත් එවැනි විශේෂ වගකිවයුතු සම්බන්ධතාවලින් සම්පූර්ණ අවසරය ලැබී තිබේ ද?",
          },
          isRequired: isRequired,
        },
        {
          type: "comment",
          title: {
            default:
              "If your response is 'NO' or if you have additional information to provide, please elaborate further.",
            si: "ඔබේ පිළිතුර නැත හෝ වෙනත් විස්තර තිබේ නම්, කරුණාකර එම විස්තර සපයන්න.",
          },
          requiredIf:"{HasPermission} = false",
          visibleIf:"{HasPermission} = false",
        },
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
        if (sender.data.Language === "English") {
          survey.locale = "default";
        } else {
          survey.locale = "si";
        }
      }
    });
  }, []);

  survey.onComplete.add((sender, options) => {
    console.log(JSON.stringify(sender.data, null, 3));
  });
  return (
    <div className="App">
      <Survey model={survey} />
    </div>
  );
}

export default App;
