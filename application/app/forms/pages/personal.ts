import { PHONE_NUMBER_QUESTION_TYPE } from "../components/PhoneNumberTextBox";
import { ENGLISH_LOCALE } from "../locale/english";
import { SINHALA_LOCALE } from "../locale/sinhala";

const personalPage = (isRequired) => {
  return {
    name: "PersonalDetails",
    title: {
      [ENGLISH_LOCALE]: "🔖 Personal Details",
      [SINHALA_LOCALE]: "🔖 පුද්ගලික විස්තර",
    },
    elements: [
      {
        name: "FullName",
        title: {
          [ENGLISH_LOCALE]: "Full Name",
          [SINHALA_LOCALE]: "සම්පූර්ණ නම",
        },
        type: "text",
        isRequired,
      },
      {
        name: "NameWithInitials",
        title: {
          [ENGLISH_LOCALE]: "Name with Initials",
          [SINHALA_LOCALE]: "මුලකුරු සමඟ නම",
        },
        type: "text",
        isRequired,
      },
      {
        name: "DateOfBirth",
        title: {
          [ENGLISH_LOCALE]: "Date of Birth",
          [SINHALA_LOCALE]: "උපන්දිනය",
        },
        type: "text",
        inputType: "date",
        isRequired,
      },
      {
        name: "Gender",
        title: {
          [ENGLISH_LOCALE]: "Gender",
          [SINHALA_LOCALE]: "ස්ත්‍රී/පුරුෂ භාවය",
        },
        type: "radiogroup",
        choices: [
          {
            value: "male",
            text: {
              [ENGLISH_LOCALE]: "Male",
              [SINHALA_LOCALE]: "පුරුෂ",
            },
          },
          {
            value: "female",
            text: {
              [ENGLISH_LOCALE]: "Female",
              [SINHALA_LOCALE]: "ස්ත්‍රී",
            },
          },
        ],
        isRequired,
      },
      {
        name: "MaritalStatus",
        title: {
          [ENGLISH_LOCALE]: "Marital Status",
          [SINHALA_LOCALE]: "විවාහක/අවිවාහක බව",
        },
        type: "dropdown",
        choices: [
          {
            value: "reverend",
            text: {
              [ENGLISH_LOCALE]: "Reverend",
              [SINHALA_LOCALE]: "පූජ්‍ය",
            },
          },
          {
            value: "single",
            text: {
              [ENGLISH_LOCALE]: "Single",
              [SINHALA_LOCALE]: "අවිවාහක",
            },
          },
          {
            value: "married",
            text: {
              [ENGLISH_LOCALE]: "Married",
              [SINHALA_LOCALE]: "විවාහක",
            },
          },
          {
            value: "widowed",
            text: {
              [ENGLISH_LOCALE]: "Widowed",
              [SINHALA_LOCALE]: "වැන්දඹු",
            },
          },
          {
            value: "divorced",
            text: {
              [ENGLISH_LOCALE]: "Divorced",
              [SINHALA_LOCALE]: "දික්කසාද",
            },
          },
        ],
        isRequired,
      },
      {
        name: "VirtueObserved",
        type: "dropdown",
        title: {
          [ENGLISH_LOCALE]: "State which virtue is being observed",
          [SINHALA_LOCALE]: "සමාදන් වී ඇති ශීලය කුමක්ද යන්න සදහන් කරන්න"
        },
        isRequired,
        visibleIf: "({MaritalStatus} = 'reverend')",
        choices: [
          {
            value: "Samanera",
            text: {
              [ENGLISH_LOCALE]: "Samanera",
              [SINHALA_LOCALE]: "සාමනේර"
            }
          },
          {
            value: "Upasampada",
            text: {
              [ENGLISH_LOCALE]: "Upasampada",
              [SINHALA_LOCALE]: "උපසම්පදා"
            }
          }
        ]
      },
      {
        name: "YearOfFullOrdination",
        type: "text",
        title: {
          [ENGLISH_LOCALE]: "Year of Full Ordination(Upasampadā)",
          [SINHALA_LOCALE]: "උපසම්පදා වූ වර්ෂය",
        },
        inputType: "number",
        isRequired,
        visibleIf: "({MaritalStatus} = 'reverend' and {VirtueObserved} = 'Upasampada')",
        validators: [
          { type: "numeric", minValue: 1900 }
        ]
      },
      {
        name: "NumberOfVassa",
        type: "text",
        title: {
          [ENGLISH_LOCALE]: "Number of Vassa (rain retreats) observed",
          [SINHALA_LOCALE]: "සම්පුර්ණ කළ වස් ප්‍රමාණය",
        },
        inputType: "number",
        isRequired,
        visibleIf: "({MaritalStatus} = 'reverend' and {VirtueObserved} = 'Upasampada')",
        validators: [
          { type: "numeric", minValue: 0, maxValue: 100 }
        ]
      },
      {
        name: "Address",
        title: {
          [ENGLISH_LOCALE]: "Permanent Address",
          [SINHALA_LOCALE]: "ස්ථිර පදිංචි ලිපිනය",
        },
        type: "comment",
        isRequired,
      },
      {
        name: "Whatsapp",
        title: {
          [ENGLISH_LOCALE]: "Whatsapp",
          [SINHALA_LOCALE]: "වට්ස්ඇප් අංකය",
        },
        type: PHONE_NUMBER_QUESTION_TYPE,
        isRequired,
      },
      {
        name: "MobilePhone",
        title: {
          [ENGLISH_LOCALE]: "Mobile Phone",
          [SINHALA_LOCALE]: "ජංගම දුරකථන අංකය",
        },
        type: PHONE_NUMBER_QUESTION_TYPE,
        isRequired,
      },
      {
        name: "HomePhone",
        title: {
          [ENGLISH_LOCALE]: "Home Phone",
          [SINHALA_LOCALE]: "ස්ථාවර දුරකථන අංකය",
        },
        type: PHONE_NUMBER_QUESTION_TYPE
      },
      {
        name: "Email",
        title: {
          [ENGLISH_LOCALE]: "Email",
          [SINHALA_LOCALE]: "විද්‍යුත් තැපැල් ලිපිනය",
        },
        type: "text",
        inputType: "email",
      },
      {
        name: "Profession",
        title: { [ENGLISH_LOCALE]: "Profession", [SINHALA_LOCALE]: "රැකියාව" },
        type: "text",
        visibleIf: "({MaritalStatus} <> 'reverend')",
      },
      {
        name: "Photo",
        title: {
          [ENGLISH_LOCALE]: "Photo",
          [SINHALA_LOCALE]: "ඡායාරූපය",
        },
        visibleIf: "({MaritalStatus} <> 'reverend')",
        type: "file",
        maxSize: 1024000 * 5, // 5MB
        acceptedTypes: "image/*",
        storeDataAsText: false,
        waitForUpload: true,
        allowMultiple: false,
        allowImagesPreview: false,
      },
    ],
  };
};

export default personalPage;
