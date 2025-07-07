import CryptoJS from "crypto-js";

export async function POST(request: Request) {
  const body: {
    to: Array<string>;
    message: string;
  } = await request.json();

  try {
    let smsToken = await getSmsToken();
    return new Response(smsToken, {
      status: 200,
    });
  } catch (e) {
    console.log("Error in sending sms", e);
    return new Response(e, {
      status: 500,
    });
  }
}

const esmsEndpoint = process.env.ESMS_ENDPOINT;
const esmsTokenEncryptionKey = process.env.ESMS_TOKEN_ENCRYPTION_KEY;

const dhis2Endpoint = process.env.DHIS2_ENDPOINT;
const dhis2Token = "ApiToken " + process.env.DHIS2_TOKEN;

async function getSmsToken() {
  let dataStoreUrl = new URL(
    "dataStore/saddharmadhara/sms-token",
    dhis2Endpoint,
  );
  let tokenGetResponse = await fetch(dataStoreUrl, {
    headers: {
      Authorization: dhis2Token,
    },
  });

  if (tokenGetResponse.status === 404) {
    console.log("Token not found, getting new token");
    let tokenResponse = await getNewSmsToken();
    await saveTokenToDhis2(tokenResponse.token, tokenResponse.expiresAt);
    return tokenResponse.token;
  } else {
    let tokenResponse = await tokenGetResponse.json();
    if (tokenResponse.expiresAt < Date.now() - 10 * 60 * 1000) {
      console.log("Token expired or close to expiration, getting new token");
      let tokenResponse = await getNewSmsToken();
      await saveTokenToDhis2(tokenResponse.token, tokenResponse.expiresAt);
      return tokenResponse.token;
    }
    return CryptoJS.AES.decrypt(
      tokenResponse.token,
      esmsTokenEncryptionKey,
    ).toString(CryptoJS.enc.Utf8) as string;
  }
}

async function saveTokenToDhis2(token: string, expiresAt: number) {
  let dataStoreUrl = new URL(
    "dataStore/saddharmadhara/sms-token",
    dhis2Endpoint,
  );
  let encryptedToken = CryptoJS.AES.encrypt(
    token,
    esmsTokenEncryptionKey,
  ).toString();

  let tokenPostResponse = await fetch(dataStoreUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: dhis2Token,
    },
    body: JSON.stringify({ token: encryptedToken, expiresAt }),
  });

  if (tokenPostResponse.ok) {
    console.log("Token saved to DHIS2");
  } else {
    console.log(await tokenPostResponse.json());
    console.log("Failed to save token to DHIS2", tokenPostResponse.status);
  }
}

async function getNewSmsToken() {
  let response = await fetch(esmsEndpoint + "/user/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: process.env.ESMS_USERNAME,
      password: process.env.ESMS_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get sms token");
  }

  let responseJson = await response.json();
  const token = responseJson.token;
  const expiresIn = responseJson.expiration;
  const expiresAt = Date.now() + expiresIn * 1000;
  return { token, expiresAt };
}
