import { ENGLISH_LOCALE } from "../locale/english";
import { SINHALA_LOCALE } from "../locale/sinhala";

const emergenecyContactPage = (isRequired = true) => {
  return {
    name: "EmergenecyContact",
    title: {
      [ENGLISH_LOCALE]: "🚑 Emergency Contact",
      [SINHALA_LOCALE]: "🚑 හදිසි අවස්ථාවකදී දැනුම් දිය යුතු අයගේ විස්තර",
    },
    elements: [
      {
        name: "EmergencyContactName",
        type: "text",
        title: {
          [ENGLISH_LOCALE]:
            "Name with initials of the person to be contacted in an emergency.",
          [SINHALA_LOCALE]:
            "හදිසි අවස්ථාවකදී සම්බන්ධ කර ගත යුතු අයකුගේ නම (මුලකුරු සමඟ).",
        },
        isRequired,
      },
      {
        name: "EmergencyContactRelationship",
        type: "text",
        title: {
          [ENGLISH_LOCALE]:
            "Applicant's relationship to emergency contact person.",
          [SINHALA_LOCALE]:
            "හදිසි අවස්ථාවකදී සම්බන්ධ කර ගත යුතු අය හා අයදුම්කරුගේ සම්බන්ධතාවය.",
        },
        isRequired,
      },
      {
        name: "EmergencyContactPhone",
        type: "text",
        title: {
          [ENGLISH_LOCALE]: "Phone number of the emergency contact.",
          [SINHALA_LOCALE]:
            "හදිසි අවස්ථාවකදී සම්බන්ධ කර ගත යුතු අයගේ දුරකථන අංකය.",
        },
        isRequired,
      },
    ],
  };
};

export default emergenecyContactPage;
