import {
  normalizePhoneNumber,
  formatSinhalaDate,
  getInvitationMessage,
  sendRetreatInvitations,
} from "./invitationService";

describe("invitationService", () => {
  describe("normalizePhoneNumber", () => {
    test("replaces +94 with 0", () => {
      expect(normalizePhoneNumber("+94771234567")).toBe("0771234567");
    });

    test("leaves already normalized number as is", () => {
      expect(normalizePhoneNumber("0771234567")).toBe("0771234567");
    });
  });

  describe("formatSinhalaDate", () => {
    test("formats Gregorian date into modern Sinhala date correctly", () => {
      expect(formatSinhalaDate("2026-05-15")).toBe("2026 මැයි 15");
      expect(formatSinhalaDate("2026-06-01")).toBe("2026 ජූනි 1");
      expect(formatSinhalaDate("2026-07-25")).toBe("2026 ජූලි 25");
      expect(formatSinhalaDate(new Date(2024, 0, 10))).toBe("2024 ජනවාරි 10");
    });

    test("returns empty string for invalid dates", () => {
      expect(formatSinhalaDate("invalid-date")).toBe("");
    });
  });

  describe("getInvitationMessage", () => {
    test("generates correct message structure with modern Sinhala month names", () => {
      const message = getInvitationMessage(
        "y1",
        "John Doe",
        "RC1",
        new Date("2024-01-01"),
        new Date("2024-01-05"),
        "2023-12-25",
        "silent",
      );

      expect(message).toContain("John Doe");
      expect(message).toContain("RC1");
      expect(message).toContain("2024 ජනවාරි 1 සිට 2024 ජනවාරි 6"); // plusDateTo = 01-05 + 1 day = 01-06
      expect(message).toContain("2023 දෙසැම්බර් 25 දිනට පෙර");
      expect(message).toContain("ස්වයං"); // silent retreat prefix
      expect(message).toContain("https://application.srisambuddhamission.org/confirm/RC1/y1");
    });
  });

  describe("sendRetreatInvitations", () => {
    test("creates a token, sends SMS, records campaign, and deletes the token", async () => {
      const originalFetch = (global as any).fetch;
      const mutate = jest
        .fn()
        .mockResolvedValueOnce({
          response: { key: "token-1", uid: "token-id-1" },
        })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({});
      const engine = { mutate } as any;
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ campaignId: "campaign-1" }),
      });
      (global as any).fetch = fetchMock;

      const onProgress = jest.fn();
      const onResult = jest.fn();

      try {
        await sendRetreatInvitations({
          engine,
          retreat: {
            retreatCode: "RC1",
            retreatType: "silent",
            date: new Date("2024-01-01"),
            endDate: new Date("2024-01-05"),
          } as any,
          confirmationDeadline: "2024-01-10",
          yogis: [
            {
              id: "y1",
              eventId: "event-1",
              attributes: {
                fullName: "John Doe",
                mobile: "+94771234567",
              },
            } as any,
          ],
          onProgress,
          onResult,
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(mutate).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({
            type: "create",
            resource: "apiToken",
          }),
        );
        expect(mutate).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining({
            type: "create",
            resource: "dataStore/invitation-sms/campaign-1",
            data: { eventId: "event-1" },
          }),
        );
        expect(mutate).toHaveBeenNthCalledWith(
          3,
          expect.objectContaining({
            type: "delete",
            resource: "apiToken",
            id: "token-id-1",
          }),
        );
        expect(onResult).toHaveBeenCalledWith({ yogiId: "y1", sent: true });
        expect(onProgress).toHaveBeenCalledWith({ completed: 1, total: 1 });
      } finally {
        (global as any).fetch = originalFetch;
      }
    });
  });
});
