import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  IdProfileInfo,
  PhoneProfileInfo,
  WhatsappProfileInfo,
  AgeProfileInfor,
} from "./ProfileInfo";

describe("ProfileInfo Components", () => {
  test("renders WhatsappProfileInfo when whatsapp number is provided", () => {
    const markup = renderToStaticMarkup(<WhatsappProfileInfo whatsapp="+94771234567" />);
    expect(markup).toContain("+94771234567");
    expect(markup).toContain("profile-info");
  });

  test("does not render WhatsappProfileInfo when whatsapp is undefined or empty", () => {
    const m1 = renderToStaticMarkup(<WhatsappProfileInfo whatsapp={undefined} />);
    expect(m1).toBe("");

    const m2 = renderToStaticMarkup(<WhatsappProfileInfo whatsapp="   " />);
    expect(m2).toBe("");
  });

  test("renders PhoneProfileInfo when mobile number is provided", () => {
    const markup = renderToStaticMarkup(<PhoneProfileInfo phonesArray={["+94712345678"]} />);
    expect(markup).toContain("+94712345678");
  });

  test("renders IdProfileInfo when nic/passport is provided", () => {
    const markup = renderToStaticMarkup(<IdProfileInfo idArray={["901234567V", undefined]} />);
    expect(markup).toContain("901234567V");
  });

  test("renders AgeProfileInfor when birthday is provided", () => {
    const markup = renderToStaticMarkup(<AgeProfileInfor birthday="1990-01-01" />);
    expect(markup).toContain("profile-info");
  });
});
