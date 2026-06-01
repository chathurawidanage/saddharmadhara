import { validateOptionSet } from "./schemaValidation";

enum TestEnum {
  VAL1 = "val1",
  VAL2 = "val2",
}

describe("schemaValidation", () => {
  test("returns no mismatches when server options match client enum perfectly", () => {
    const serverOptions = [{ code: "val1" }, { code: "VAL2" }];
    const mismatches = validateOptionSet("optSetId", "Test Options", serverOptions, TestEnum as any);
    expect(mismatches).toHaveLength(0);
  });

  test("returns MISSING_IN_ENUM mismatch when server has option not in client enum", () => {
    const serverOptions = [{ code: "val1" }, { code: "val2" }, { code: "val3" }];
    const mismatches = validateOptionSet("optSetId", "Test Options", serverOptions, TestEnum as any);
    expect(mismatches).toHaveLength(1);
    expect(mismatches[0]).toEqual({
      type: "MISSING_IN_ENUM",
      optionSetId: "optSetId",
      optionSetName: "Test Options",
      code: "val3",
    });
  });

  test("returns MISSING_ON_SERVER mismatch when client enum has value not on server", () => {
    const serverOptions = [{ code: "val1" }];
    const mismatches = validateOptionSet("optSetId", "Test Options", serverOptions, TestEnum as any);
    expect(mismatches).toHaveLength(1);
    expect(mismatches[0]).toEqual({
      type: "MISSING_ON_SERVER",
      optionSetId: "optSetId",
      optionSetName: "Test Options",
      code: "val2",
    });
  });
});
