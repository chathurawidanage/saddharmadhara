import { buildYogiExport } from "./exportService";
import {
  DHIS2_TEI_ATTRIBUTE_FULL_NAME,
  DHIS2_TEI_ATTRIBUTE_GENDER,
} from "../dhis2";

describe("exportService", () => {
  const retreat = { code: "R1" } as any;
  const yogiObj = [
    {
      attributes: {
        [DHIS2_TEI_ATTRIBUTE_FULL_NAME]: "John Doe",
        [DHIS2_TEI_ATTRIBUTE_GENDER]: "male",
      },
      expressionOfInterests: {
        R1: { state: "selected" },
      },
      participation: {
        R1: { room: "Room 101" },
      },
    } as any,
  ];

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

  test("buildYogiExport formats as csv correctly", () => {
    const result = buildYogiExport(
      yogiObj,
      "R1",
      "male",
      "selected",
      "csv",
      retreat,
    );
    const lines = result.split("\n");
    expect(lines[0]).toBe(",Name,NIC,Passport,Phone,Room");
    expect(lines[1]).toContain("01,John Doe");
    expect(lines[1]).toContain("Room 101");
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
