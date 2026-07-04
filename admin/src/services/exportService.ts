import {
  DHIS2_TEI_ATTRIBUTE_FULL_NAME,
  DHIS2_TEI_ATTRIBUTE_GENDER,
  DHIS2_TEI_ATTRIBUTE_MOBILE,
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
    yogiNames.push(["", "Name", "NIC", "Passport", "Phone", "Room"].join(","));
  }

  let index = 0;
  for (const yogi of yogiObj) {
    if (
      yogi.attributes[DHIS2_TEI_ATTRIBUTE_GENDER] === gender &&
      yogi.expressionOfInterests[retreatCode]?.state === selectionState
    ) {
      if (format === "csv") {
        const room = (retreat && retreat.code && yogi.participation[retreat.code]?.room) || "N/A";
        yogiNames.push(
          [
            (++index).toString().padStart(2, "0"),
            yogi.attributes[DHIS2_TEI_ATTRIBUTE_FULL_NAME]?.trim() || "N/A",
            yogi.attributes[DHIS2_TEI_ATTRIBUTE_NIC]?.trim() || "",
            yogi.attributes[DHIS2_TEI_ATTRIBUTE_PASSPORT]?.trim() || "",
            yogi.attributes[DHIS2_TEI_ATTRIBUTE_MOBILE]?.trim() || "",
            room,
          ].join(","),
        );
      } else {
        yogiNames.push(
          `${(++index).toString().padStart(2, "0")} ${yogi.attributes[DHIS2_TEI_ATTRIBUTE_FULL_NAME]?.trim() || "N/A"}`,
        );
      }
    }
  }
  return yogiNames.join("\n");
};
