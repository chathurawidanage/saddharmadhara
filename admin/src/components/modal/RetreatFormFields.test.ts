import { validateRetreatCode } from "./RetreatFormFields";

describe("validateRetreatCode", () => {
  it("should return undefined for valid codes (A-Z and 0-9)", () => {
    expect(validateRetreatCode("5GS1")).toBeUndefined();
    expect(validateRetreatCode("RETREAT123")).toBeUndefined();
    expect(validateRetreatCode("12345")).toBeUndefined();
    expect(validateRetreatCode("ABCDE")).toBeUndefined();
  });

  it("should return a presence error for empty/missing values", () => {
    expect(validateRetreatCode("")).toBeDefined();
    expect(validateRetreatCode(undefined)).toBeDefined();
    expect(validateRetreatCode(null)).toBeDefined();
  });

  it("should return an error for lowercase letters", () => {
    expect(validateRetreatCode("5gs1")).toBe("Code must contain only uppercase letters (A-Z) and numbers (0-9)");
    expect(validateRetreatCode("Retreat123")).toBe("Code must contain only uppercase letters (A-Z) and numbers (0-9)");
  });

  it("should return an error for spaces", () => {
    expect(validateRetreatCode("5GS 1")).toBe("Code must contain only uppercase letters (A-Z) and numbers (0-9)");
    expect(validateRetreatCode("5GS1 ")).toBe("Code must contain only uppercase letters (A-Z) and numbers (0-9)");
    expect(validateRetreatCode(" 5GS1")).toBe("Code must contain only uppercase letters (A-Z) and numbers (0-9)");
  });

  it("should return an error for special characters", () => {
    expect(validateRetreatCode("5GS-1")).toBe("Code must contain only uppercase letters (A-Z) and numbers (0-9)");
    expect(validateRetreatCode("5GS_1")).toBe("Code must contain only uppercase letters (A-Z) and numbers (0-9)");
    expect(validateRetreatCode("5GS1!")).toBe("Code must contain only uppercase letters (A-Z) and numbers (0-9)");
  });
});
