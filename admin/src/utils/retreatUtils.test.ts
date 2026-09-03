import {
  getRetreatEndDate,
  canFinalizeRetreat,
  isGeneralRetreat,
  isSilentRetreat,
  isDhammaSevaRetreat,
  getRetreatDisplayRange,
} from "./retreatUtils";

describe("retreatUtils", () => {
  describe("getRetreatEndDate", () => {
    test("calculates end date correctly", () => {
      const startDate = new Date("2024-01-01T00:00:00Z");
      const noOfDays = 10;
      const result = getRetreatEndDate(startDate, noOfDays);
      expect(result?.toISOString()).toBe("2024-01-11T00:00:00.000Z");
    });

    test("returns same date if noOfDays is missing", () => {
      const startDate = new Date("2024-01-01");
      expect(getRetreatEndDate(startDate, null)).toBe(startDate);
    });
  });

  describe("canFinalizeRetreat", () => {
    test("returns false if retreat is already finalized", () => {
      const retreat = { finalized: true } as any;
      expect(canFinalizeRetreat(retreat)).toBe(false);
    });

    test("returns false if retreat end date has not passed", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const retreat = {
        date: futureDate,
        noOfDays: 1,
        finalized: false,
      } as any;
      expect(canFinalizeRetreat(retreat)).toBe(false);
    });

    test("returns true if retreat end date has passed", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      const retreat = {
        date: pastDate,
        noOfDays: 1,
        finalized: false,
      } as any;
      expect(canFinalizeRetreat(retreat)).toBe(true);
    });
  });

  describe("isGeneralRetreat", () => {
    test("identifies general retreats", () => {
      expect(isGeneralRetreat({ retreatType: "general" })).toBe(true);
    });

    test("returns false for non-general retreats", () => {
      expect(isGeneralRetreat({ retreatType: "silent" })).toBe(false);
      expect(isGeneralRetreat({ retreatType: "dhamma-seva" })).toBe(false);
    });
  });

  describe("isSilentRetreat", () => {
    test("identifies silent retreats", () => {
      expect(isSilentRetreat({ retreatType: "silent" })).toBe(true);
    });

    test("returns false for non-silent retreats", () => {
      expect(isSilentRetreat({ retreatType: "general" })).toBe(false);
      expect(isSilentRetreat({ retreatType: "dhamma-seva" })).toBe(false);
    });
  });

  describe("isDhammaSevaRetreat", () => {
    test("identifies dhamma seva retreats", () => {
      expect(isDhammaSevaRetreat({ retreatType: "dhamma-seva" })).toBe(true);
      expect(isDhammaSevaRetreat({ retreatType: "dhamma seva" as any })).toBe(true);
      expect(isDhammaSevaRetreat({ retreatType: "Dhamma Seva" as any })).toBe(true);
    });

    test("returns false for non-dhamma-seva retreats", () => {
      expect(isDhammaSevaRetreat({ retreatType: "general" })).toBe(false);
      expect(isDhammaSevaRetreat({ retreatType: "silent" })).toBe(false);
    });
  });

  describe("getRetreatDisplayRange", () => {
    test("formats range correctly in en-LK", () => {
      const retreat = {
        date: new Date("2024-01-01"),
        noOfDays: "5",
      } as any;
      // Note: toLocaleDateString output can vary by environment, so we check for components
      const result = getRetreatDisplayRange(retreat, "en-LK");
      expect(result).toContain("Jan 1, 2024");
      expect(result).toContain("Jan 6, 2024");
    });
  });
});
