import { getSmsToken, sendSms } from "../../lib/sms";
const dhis2Endpoint = process.env.DHIS2_ENDPOINT;


// --- API Route Handler ---

export async function POST(request: Request) {
  try {
    let authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401 });
    }

    // do a dhis2 call to check if the user is authenticated

    try {
      const dhis2User = await fetch(new URL("me", dhis2Endpoint), {
        headers: {
          Authorization: authHeader,
        },
      });
      const dhis2UserJson = await dhis2User.json();

      if (!dhis2User.ok) {
        return new Response("Unauthorized", { status: 401 });
      }
      console.log("SMS request sent by", dhis2UserJson.username);
    } catch (e) {
      console.error("Error in dhis2 auth check:", e);
      return new Response("Unauthorized", { status: 401 });
    }
    // end of auth

    const { to, message }: { to: string[]; message: string } =
      await request.json();

    if (!to || !Array.isArray(to) || to.length === 0 || !message) {
      return new Response(
        "Request body must include 'to' (a non-empty array) and 'message'.",
        { status: 400 },
      );
    }

    const token = await getSmsToken();
    const smsResponse = await sendSms(to, message, token);

    if (!smsResponse.ok) {
      const errorBody = await smsResponse.text();
      console.error("Failed to send SMS:", errorBody);
      return new Response(
        `Failed to send SMS. Gateway response: ${errorBody}`,
        {
          status: 502, // Bad Gateway
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...(await smsResponse.json()).data,
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return new Response("An internal server error occurred.", { status: 500 });
  }
}
