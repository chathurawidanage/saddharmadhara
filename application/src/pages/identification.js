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
      name: "NIC",
      title: {
        [ENGLISH_LOCALE]: "National Identity Card No. (NIC)",
        [SINHALA_LOCALE]: "ජාතික හැදුනුම්පත් අංකය",
      },
      type: "text",
      requiredIf: "{Passport} empty",
      validators: [{ type: "regex", regex: "^([0-9]{9}[x|X|v|V]|[0-9]{12})$" }],
    },
    {
      name: "Passport",
      title: {
        [ENGLISH_LOCALE]: "Passport Number",
        [SINHALA_LOCALE]: "ගමන් බලපත්‍ර අංක​ය",
      },
      type: "text",
      requiredIf: "{NIC} empty",
      validators: [{ type: "text", minLength: 7, maxLength: 9 }],
    },
  ],
};

export default identificationPage;
