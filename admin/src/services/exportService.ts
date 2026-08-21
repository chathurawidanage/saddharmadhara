import {
  DHIS2_TEI_ATTRIBUTE_FULL_NAME,
  DHIS2_TEI_ATTRIBUTE_GENDER,
  DHIS2_TEI_ATTRIBUTE_MOBILE,
  DHIS2_TEI_ATTRIBUTE_WHATSAPP,
  DHIS2_TEI_ATTRIBUTE_NIC,
  DHIS2_TEI_ATTRIBUTE_PASSPORT,
} from "../dhis2";
import { Yogi, Retreat } from "../types/domain";

export const YOGI_EXPORT_GENDERS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

export const YOGI_EXPORT_FORMATS = [
  { label: "Name List (Text)", format: "txt" },
  { label: "Name with details (Excel)", format: "csv" },
];

export const YOGI_EXPORT_DEFINITIONS = [
  { label: "Applied", selectionState: "applied" },
  { label: "Pending Confirmation", selectionState: "pending" },
  { label: "Selected", selectionState: "selected" },
];

/**
 * Formats a value as text for spreadsheet software (CSV export)
 * to prevent scientific notation and preserve leading zeroes / special characters.
 * @param {string} [value]
 * @returns {string}
 */
export const formatSpreadsheetTextCell = (value?: string): string => {
  const trimmed = value?.trim();
  if (!trimmed) return "";
  return `="${trimmed.replace(/"/g, '""')}"`;
};

/**
 * Downloads a text file to the browser
 * @param {string} text
 * @param {string} fileName
 * @param {string} extension
 */
export const downloadTextFile = (text: string, fileName: string, extension = "txt"): void => {
  const BOM = "\uFEFF"; // UTF-8 BOM
  const blob = new Blob([BOM + text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}.${extension}`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Builds a yogi export string in text or CSV format
 * @param {Yogi[]} yogiObj
 * @param {string} retreatCode
 * @param {string} gender
 * @param {string} selectionState
 * @param {string} format
 * @param {Retreat} retreat
 * @returns {string}
 */
export const buildYogiExport = (
  yogiObj: Yogi[],
  retreatCode: string,
  gender: string,
  selectionState: string,
  format: string,
  retreat: Retreat,
): string => {
  const yogiNames: string[] = [];

  if (format === "csv") {
    yogiNames.push(["", "Name", "NIC", "Passport", "Phone", "WhatsApp", "Room"].join(","));
  }

  let index = 0;
  for (const yogi of yogiObj) {
    const genderAttr = yogi.attributes[DHIS2_TEI_ATTRIBUTE_GENDER] || yogi.attributes.gender;
    if (
      genderAttr === gender &&
      yogi.expressionOfInterests[retreatCode]?.state === selectionState
    ) {
      if (format === "csv") {
        const room = (retreat && retreat.code && yogi.participation[retreat.code]?.room) || "N/A";
        const fullName =
          (yogi.attributes[DHIS2_TEI_ATTRIBUTE_FULL_NAME] || yogi.attributes.fullName)?.trim() ||
          "N/A";
        const nic = (yogi.attributes[DHIS2_TEI_ATTRIBUTE_NIC] || yogi.attributes.nic)?.trim() || "";
        const passport =
          (yogi.attributes[DHIS2_TEI_ATTRIBUTE_PASSPORT] || yogi.attributes.passport)?.trim() || "";
        const mobile =
          yogi.attributes[DHIS2_TEI_ATTRIBUTE_MOBILE] || yogi.attributes.mobile || "";
        const whatsapp =
          yogi.attributes[DHIS2_TEI_ATTRIBUTE_WHATSAPP] || yogi.attributes.whatsapp || "";

        yogiNames.push(
          [
            (++index).toString().padStart(2, "0"),
            fullName,
            nic,
            passport,
            formatSpreadsheetTextCell(mobile),
            formatSpreadsheetTextCell(whatsapp),
            room,
          ].join(","),
        );
      } else {
        const fullName =
          (yogi.attributes[DHIS2_TEI_ATTRIBUTE_FULL_NAME] || yogi.attributes.fullName)?.trim() ||
          "N/A";
        yogiNames.push(
          `${(++index).toString().padStart(2, "0")} ${fullName}`,
        );
      }
    }
  }
  return yogiNames.join("\n");
};
