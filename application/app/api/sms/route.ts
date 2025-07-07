import CryptoJS from "crypto-js";

// --- Environment Variable Checks ---
const esmsEndpoint = process.env.ESMS_ENDPOINT;
const esmsTokenEncryptionKey = process.env.ESMS_TOKEN_ENCRYPTION_KEY;
const dhis2Endpoint = process.env.DHIS2_ENDPOINT;
const dhis2Token = process.env.DHIS2_TOKEN;
const esmsUsername = process.env.ESMS_USERNAME;
const esmsPassword = process.env.ESMS_PASSWORD;

if (
  !esmsEndpoint ||
  !esmsTokenEncryptionKey ||
  !dhis2Endpoint ||
  !dhis2Token ||
  !esmsUsername ||
  !esmsPassword
) {
  throw new Error("One or more required environment variables are not set.");
}

const dhis2AuthHeader = `ApiToken ${dhis2Token}`;
const smsTokenStoreUrl = new URL(
  "dataStore/saddharmadhara/sms-token",
  dhis2Endpoint,
);

// --- Core Functions ---

async function getNewSmsToken() {
  const response = await fetch(`${esmsEndpoint}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: esmsUsername,
      password: esmsPassword,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to get new SMS token:", errorText);
    throw new Error(`Failed to get new SMS token: ${errorText}`);
  }

  const { token, expiration } = await response.json();
  const expiresAt = Date.now() + expiration * 1000;
  return { token, expiresAt };
}

async function saveTokenToDhis2(token: string, expiresAt: number) {
  const encryptedToken = CryptoJS.AES.encrypt(
    token,
    esmsTokenEncryptionKey,
  ).toString();

  const response = await fetch(smsTokenStoreUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: dhis2AuthHeader,
    },
    body: JSON.stringify({ token: encryptedToken, expiresAt }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to save token to DHIS2:", errorText);
    throw new Error(`Failed to save token to DHIS2: ${errorText}`);
  }
}

async function getSmsToken(): Promise<string> {
  const tokenGetResponse = await fetch(smsTokenStoreUrl, {
    headers: {
      Authorization: dhis2AuthHeader,
    },
  });

  if (tokenGetResponse.ok) {
    const tokenData = await tokenGetResponse.json();
    if (tokenData.expiresAt > Date.now() + 10 * 60 * 1000) {
      try {
        return CryptoJS.AES.decrypt(
          tokenData.token,
          esmsTokenEncryptionKey,
        ).toString(CryptoJS.enc.Utf8);
      } catch (e) {
        // possible the encryption key has changed
        console.error("Error decrypting token:", e);
        // fall back to requesting a new token
      }
    }
  }

  console.log("Existing token is invalid or missing. Fetching a new one.");
  const { token, expiresAt } = await getNewSmsToken();
  await saveTokenToDhis2(token, expiresAt);
  return token;
}

async function sendSms(
  to: string[],
  message: string,
  token: string,
): Promise<Response> {
  return await fetch(`${esmsEndpoint}/sms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      msisdn: to.map((mobile) => {
        return { mobile };
      }),
      message,
      transaction_id: Date.now(),
    }),
  });
}

// --- API Route Handler ---

function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader) return null;

  const match = authHeader.match(/^Bearer (.+)$/i);
  return match ? match[1] : null;
}

export async function POST(request: Request) {
  try {
    let authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401 });
    }

    // token = dhis2UserName+":"+userGeneratedRandomString
    // check in dataStore if the token is valid
    // remove Bearer
    const userAuthToken = extractBearerToken(authHeader);
    if (!userAuthToken) {
      return new Response("Unauthorized", { status: 401 });
    }
    const [dhis2UserName, userGeneratedRandomString] = userAuthToken.split(":");
    const authTokenStoreUrl = new URL(
      "dataStore/saddharmadhara/sms-auth-" + dhis2UserName,
      dhis2Endpoint,
    );
    const tokenGetResponse = await fetch(authTokenStoreUrl, {
      headers: {
        Authorization: dhis2AuthHeader,
      },
    });

    if (!tokenGetResponse.ok) {
      return new Response("Unauthorized", { status: 401 });
    }

    const tokenData = await tokenGetResponse.json();
    if (tokenData.token !== userGeneratedRandomString) {
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

    return new Response("SMS sent successfully.", { status: 200 });
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return new Response("An internal server error occurred.", { status: 500 });
  }
}
