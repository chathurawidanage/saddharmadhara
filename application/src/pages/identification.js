import { ENGLISH_LOCALE } from "../locale/english";
import { SINHALA_LOCALE } from "../locale/sinhala";

const identificationPage = {
  name: "Identification",
  title: {
    [ENGLISH_LOCALE]: "🪪 Identification",
    [SINHALA_LOCALE]: "🪪 හදුනාගැනීම",
  },
  description: {
    [ENGLISH_LOCALE]: "If the ID number you provide during admission to the meditation program does not match this number, you may lose the opportunity to participate.",
    [SINHALA_LOCALE]:
      "භාවනා වැඩසටහනට සහභාගි වන අවස්ථාවේදී ඔබ ඉදිරිපත් කරන හැදුනුම්පතේ අංකය මෙම අංකය සමග නොගැලපේ නම් වැඩසටහනට සම්බන්ධ වීමට ඇති අවස්ථාව අහිමි වී යා හැකිය.",
  },
  elements: [
    {
      name: "IdentificationTypes",
      title: {
        [ENGLISH_LOCALE]: "Please select the documents you would like to use for identification purposes.",
        [SINHALA_LOCALE]: "හදුනා ගැනීම සදහා භාවිතා කිරීමට බලාපොරොත්තු වන ලේඛන තෝරන්න."
      },
      description: {
        [ENGLISH_LOCALE]: "Please select all that apply.",
        [SINHALA_LOCALE]: "කරුණාකර අදාළ සියල්ල තෝරන්න."
      },
      type: "tagbox",
      choices: [{
        value: "NIC",
        text: {
          [ENGLISH_LOCALE]: "National Identity Card(NIC)",
          [SINHALA_LOCALE]: "ජාතික හැදුනුම්පත"
        }
      }, {
        value: "Passport",
        text: {
          [ENGLISH_LOCALE]: "Passport",
          [SINHALA_LOCALE]: "ගමන් බලපත්‍රය"
        }
      }],
      isRequired: true
    },
    {
      name: "NIC",
      title: {
        [ENGLISH_LOCALE]: "National Identity Card No. (NIC)",
        [SINHALA_LOCALE]: "ජාතික හැදුනුම්පත් අංකය",
      },
      type: "text",
      isRequired: true,
      visibleIf: "{IdentificationTypes} contains 'NIC'",
      validators: [{
        type: "regex", regex: "^([0-9]{9}[x|X|v|V]|[0-9]{12})$", text: {
          [ENGLISH_LOCALE]: "Invalid Identity Card No.",
          [SINHALA_LOCALE]: "හැඳුනුම්පත් අංකය වලංගු නැත."
        }
      }],
    },
    {
      name: "Passport",
      title: {
        [ENGLISH_LOCALE]: "Passport Number",
        [SINHALA_LOCALE]: "ගමන් බලපත්‍ර අංක​ය",
      },
      type: "text",
      visibleIf: "{IdentificationTypes} contains 'Passport'",
      isRequired: true,
      validators: [{
        type: "regex", regex: "^[a-zA-Z0-9]{7,9}$", text: {
          [ENGLISH_LOCALE]: "Invalid Passport Number.",
          [SINHALA_LOCALE]: "ගමන් බලපත්‍ර අංක​ය වලංගු නැත."
        }
      }],
    },
  ],
};

export default identificationPage;
