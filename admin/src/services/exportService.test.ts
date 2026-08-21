import { buildYogiExport, formatSpreadsheetTextCell } from "./exportService";
import {
  DHIS2_TEI_ATTRIBUTE_FULL_NAME,
  DHIS2_TEI_ATTRIBUTE_GENDER,
  DHIS2_TEI_ATTRIBUTE_MOBILE,
  DHIS2_TEI_ATTRIBUTE_WHATSAPP,
} from "../dhis2";

describe("exportService", () => {
  const retreat = { code: "R1" } as any;
  const yogiObj = [
    {
      attributes: {
        [DHIS2_TEI_ATTRIBUTE_FULL_NAME]: "John Doe",
        [DHIS2_TEI_ATTRIBUTE_GENDER]: "male",
        [DHIS2_TEI_ATTRIBUTE_MOBILE]: "0771234567",
        [DHIS2_TEI_ATTRIBUTE_WHATSAPP]: "+94771234567",
      },
      expressionOfInterests: {
        R1: { state: "selected" },
      },
      participation: {
        R1: { room: "Room 101" },
      },
    } as any,
  ];

  test("formatSpreadsheetTextCell formats numbers as text formulas for spreadsheets", () => {
    expect(formatSpreadsheetTextCell("0771234567")).toBe('="0771234567"');
    expect(formatSpreadsheetTextCell("+94771234567")).toBe('="+94771234567"');
    expect(formatSpreadsheetTextCell("")).toBe("");
    expect(formatSpreadsheetTextCell(undefined)).toBe("");
    expect(formatSpreadsheetTextCell("   ")).toBe("");
  });

  test("buildYogiExport formats as text correctly", () => {
    const result = buildYogiExport(
      yogiObj,
      "R1",
      "male",
      "selected",
      "txt",
      retreat,
    );
    expect(result).toBe("01 John Doe");
  });

  test("buildYogiExport formats as csv correctly with phone and whatsapp as text", () => {
    const result = buildYogiExport(
      yogiObj,
      "R1",
      "male",
      "selected",
      "csv",
      retreat,
    );
    const lines = result.split("\n");
    expect(lines[0]).toBe(",Name,NIC,Passport,Phone,WhatsApp,Room");
    expect(lines[1]).toBe('01,John Doe,,,="0771234567",="+94771234567",Room 101');
  });

  test("buildYogiExport filters by gender and state", () => {
    const result = buildYogiExport(
      yogiObj,
      "R1",
      "female", // mismatched gender
      "selected",
      "txt",
      retreat,
    );
    expect(result).toBe("");
  });
});
