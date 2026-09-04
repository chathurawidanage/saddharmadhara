const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

/**
 * ============================================================================
 * ENVIRONMENT VARIABLE LOADER (.env)
 * ============================================================================
 */

/**
 * Loads environment variables from .env located right next to this script.
 */
const loadEnv = () => {
  const envPath = path.resolve(__dirname, ".env");

  if (!fs.existsSync(envPath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(envPath, "utf8");
    const lines = content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
    return [envPath];
  } catch (e) {
    console.warn(`Warning: Could not read ${envPath}:`, e.message);
    return [];
  }
};

// Immediately load .env files before evaluating configuration constants
const loadedEnvFiles = loadEnv();

/**
 * ============================================================================
 * CONFIGURATION & PLACEHOLDERS
 * ============================================================================
 */

// Placeholder for your SMS message text.
// Can be customized here or provided via SMS_MESSAGE in .env
const DEFAULT_MESSAGE = `Heta (5th Sept) udasana 3:20ta pawathwena Vishwa Maithree Dhara samaga sambandha weemata pahatha link eka bawitha karanna. 

https://youtu.be/Bz0w1nIUIj8`;

// Dialog eSMS API Endpoints (Direct Dialog API)
const DIALOG_ESMS_BASE_URL =
  process.env.ESMS_ENDPOINT || "https://e-sms.dialog.lk/api/";
const DIALOG_LOGIN_URL = new URL("v2/user/login", DIALOG_ESMS_BASE_URL).href;
const DIALOG_SMS_URL = new URL("v2/sms", DIALOG_ESMS_BASE_URL).href;

// Sender Mask (Approved sender ID on Dialog portal)
const SOURCE_ADDRESS =
  process.env.ESMS_SOURCE_ADDRESS ||
  process.env.DIALOG_SOURCE_ADDRESS ||
  "SADDHARMA";

// Default sent log path
const SENT_LOG_PATH =
  process.env.SENT_LOG || path.resolve(__dirname, "sent_sms.json");

// Default batch size (Dialog API supports up to 1000 per request)
const DEFAULT_BATCH_SIZE = 50;

// Delay in milliseconds between consecutive batch sends
const DEFAULT_DELAY_MS = 500;

/**
 * Normalizes phone number to 07xxxxxxxx format
 * @param {string} phone
 * @returns {string}
 */
const normalizePhoneNumber = (phone) => {
  if (!phone) return "";
  return phone.replace(/^\+94/, "0");
};

/**
 * Sleep helper
 * @param {number} ms
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Logs in to Dialog eSMS API and returns a Bearer token
 * @param {string} username
 * @param {string} password
 * @returns {Promise<string>}
 */
const loginToDialog = async (username, password) => {
  const response = await fetch(DIALOG_LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  if (!response.ok || data.status !== "success" || !data.token) {
    const errorMsg =
      data.comment || `HTTP ${response.status}: ${JSON.stringify(data)}`;
    throw new Error(`Dialog login failed: ${errorMsg}`);
  }

  return data.token;
};

/**
 * Sends SMS to multiple recipients in a single batch request via Dialog eSMS API v2
 * @param {string} token Bearer token from Dialog
 * @param {string[]} mobiles Array of 07xxxxxxxx mobile numbers
 * @param {string} message Text message to send
 * @returns {Promise<{ ok: boolean, campaignId?: number, comment?: string, error?: string }>}
 */
const sendDialogSmsBatch = async (token, mobiles, message) => {
  const msisdn = mobiles.map((mobile) => ({
    mobile: normalizePhoneNumber(mobile),
  }));
  const transactionId = Date.now() + Math.floor(Math.random() * 1000);

  const response = await fetch(DIALOG_SMS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      msisdn,
      message,
      sourceAddress: SOURCE_ADDRESS,
      transaction_id: transactionId,
      payment_method: 0, // 0 = wallet, 4 = package
    }),
  });

  let json = null;
  try {
    json = await response.json();
  } catch (_) {}

  if (response.ok && json?.status === "success") {
    return {
      ok: true,
      campaignId: json.data?.campaignId,
      comment: json.comment,
    };
  } else {
    const errorReason =
      json?.comment || `HTTP ${response.status}: ${JSON.stringify(json || {})}`;
    return {
      ok: false,
      error: errorReason,
    };
  }
};

/**
 * Loads previously sent records from disk
 * @param {string} filePath
 * @returns {Record<string, { name: string, phone: string, sentAt: string, campaignId?: any }>}
 */
const loadSentLog = (filePath) => {
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      return JSON.parse(content);
    } catch (e) {
      console.warn(
        `Warning: Failed to parse existing sent log at ${filePath}:`,
        e.message,
      );
    }
  }
  return {};
};

/**
 * Saves sent records to disk
 * @param {string} filePath
 * @param {object} data
 */
const saveSentLog = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
};

/**
 * Main execution function
 */
const run = async () => {
  // Caller list file must be passed as program argument
  const inputArg = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
  if (!inputArg) {
    console.error(
      "Error: No caller list file specified.\n\n" +
        "Usage: node utils/send_bulk_sms.js <caller-list.csv> [--dry-run] [--limit=N] [--delay=MS]\n" +
        "Example: node utils/send_bulk_sms.js utils/Caller-List-Formatted.csv\n",
    );
    process.exit(1);
  }

  let inputPath = path.resolve(process.cwd(), inputArg);
  if (
    !fs.existsSync(inputPath) &&
    fs.existsSync(path.resolve(__dirname, inputArg))
  ) {
    inputPath = path.resolve(__dirname, inputArg);
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Caller list file not found at: ${inputPath}`);
    process.exit(1);
  }

  const isDryRun = process.argv.includes("--dry-run");
  const delayArg = process.argv.find((a) => a.startsWith("--delay="));
  const delayMs = delayArg
    ? parseInt(delayArg.split("=")[1], 10)
    : DEFAULT_DELAY_MS;

  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limitCount = limitArg ? parseInt(limitArg.split("=")[1], 10) : Infinity;

  const messageTemplate = process.env.SMS_MESSAGE || DEFAULT_MESSAGE;

  console.log("=== Saddharmadhara Bulk SMS Sender (Direct Dialog API) ===");
  if (loadedEnvFiles.length > 0) {
    console.log(`Config loaded from: ${loadedEnvFiles.join(", ")}`);
  }
  if (isDryRun) {
    console.log("DRY RUN MODE: No SMS messages will be sent.\n");
  }

  // Validate message placeholder
  if (
    !messageTemplate ||
    messageTemplate === "YOUR_SMS_MESSAGE_HERE" ||
    messageTemplate.trim() === ""
  ) {
    if (!isDryRun) {
      console.error(
        "Error: Please set your SMS message text in the script (DEFAULT_MESSAGE) or via SMS_MESSAGE in your .env file.",
      );
      process.exit(1);
    } else {
      console.log(
        'Note: Using default placeholder message text ("YOUR_SMS_MESSAGE_HERE") for dry run.\n',
      );
    }
  }

  // Obtain Dialog Bearer Token
  let dialogToken =
    process.env.DIALOG_TOKEN ||
    process.env.ESMS_TOKEN ||
    process.env.DIALOG_ESMS_TOKEN;

  if (!dialogToken && !isDryRun) {
    const username = process.env.ESMS_USERNAME || process.env.DIALOG_USERNAME;
    const password = process.env.ESMS_PASSWORD || process.env.DIALOG_PASSWORD;

    if (!username || !password) {
      console.error(
        "Error: Dialog credentials not found.\n" +
          "Please add them to utils/.env:\n\n" +
          "  ESMS_USERNAME=your_username\n" +
          "  ESMS_PASSWORD=your_password\n\n" +
          "  (or DIALOG_TOKEN=your_bearer_token)\n",
      );
      process.exit(1);
    }

    console.log(`Authenticating with Dialog as ${username}...`);
    try {
      dialogToken = await loginToDialog(username, password);
      console.log("Successfully authenticated with Dialog eSMS API.\n");
    } catch (err) {
      console.error("Error during Dialog login:", err.message);
      process.exit(1);
    }
  }

  // Read input list
  const csvRaw = fs.readFileSync(inputPath, "utf8");
  const recipients = parse(csvRaw, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  });

  console.log(`Loaded ${recipients.length} recipients from ${inputPath}`);

  // Load sent log
  const sentMap = loadSentLog(SENT_LOG_PATH);
  const alreadySentPhones = new Set(Object.keys(sentMap));
  console.log(
    `Previously sent log: ${alreadySentPhones.size} numbers already recorded in ${SENT_LOG_PATH}\n`,
  );

  // Filter out already sent numbers
  const pendingRecipients = recipients.filter((r) => {
    const phone = normalizePhoneNumber(r.Phone ? r.Phone.trim() : "");
    return phone && !alreadySentPhones.has(phone);
  });

  console.log(`Recipients to process in this run: ${pendingRecipients.length}`);
  if (limitCount < pendingRecipients.length) {
    console.log(`(Limiting to first ${limitCount} recipients as requested)`);
  }
  console.log("--------------------------------------------------");

  const batchSizeArg = process.argv.find((a) => a.startsWith("--batch-size="));
  const batchSize = batchSizeArg
    ? parseInt(batchSizeArg.split("=")[1], 10)
    : DEFAULT_BATCH_SIZE;

  let successCount = 0;
  let failCount = 0;
  let skippedCount = recipients.length - pendingRecipients.length;

  const toProcess = pendingRecipients.slice(0, limitCount);

  // Group into batches of batchSize (default: 50)
  const batches = [];
  for (let i = 0; i < toProcess.length; i += batchSize) {
    batches.push(toProcess.slice(i, i + batchSize));
  }

  console.log(
    `Queue: ${toProcess.length} recipients to send across ${batches.length} batch(es) (batch size: ${batchSize}).\n`,
  );

  for (let bIndex = 0; bIndex < batches.length; bIndex++) {
    const currentBatch = batches[bIndex];
    const phones = currentBatch.map((r) => (r.Phone ? r.Phone.trim() : ""));
    const preview = `${currentBatch[0].Name} (${phones[0]})${currentBatch.length > 1 ? ` ... ${currentBatch[currentBatch.length - 1].Name} (${phones[phones.length - 1]})` : ""}`;

    process.stdout.write(
      `[Batch ${bIndex + 1}/${batches.length}] Sending to ${currentBatch.length} recipients [${preview}]... `,
    );

    if (isDryRun) {
      console.log("[DRY RUN OK]");
      successCount += currentBatch.length;
      continue;
    }

    try {
      const result = await sendDialogSmsBatch(
        dialogToken,
        phones,
        messageTemplate,
      );

      if (result.ok) {
        console.log(
          `SENT${result.campaignId ? ` (Campaign ID: ${result.campaignId})` : ""}`,
        );
        successCount += currentBatch.length;

        // Record all recipients in this batch into sent log
        const sentAt = new Date().toISOString();
        for (const r of currentBatch) {
          const phone = normalizePhoneNumber(r.Phone ? r.Phone.trim() : "");
          sentMap[phone] = {
            name: r.Name,
            phone,
            sentAt,
            campaignId: result.campaignId || null,
          };
        }
        saveSentLog(SENT_LOG_PATH, sentMap);
      } else {
        console.log(`FAILED (${result.error})`);
        failCount += currentBatch.length;
      }
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      failCount += currentBatch.length;
    }

    // Delay between batches
    if (bIndex < batches.length - 1 && delayMs > 0) {
      await sleep(delayMs);
    }
  }

  console.log("\n==================================================");
  console.log("Summary:");
  console.log(`  Total in CSV:        ${recipients.length}`);
  console.log(`  Already sent (skip): ${skippedCount}`);
  console.log(`  Sent successfully:   ${successCount}`);
  console.log(`  Failed:              ${failCount}`);
  console.log(
    `  Remaining unsent:    ${pendingRecipients.length - successCount}`,
  );
  console.log(`Sent log updated at:   ${SENT_LOG_PATH}`);
  console.log("==================================================");
};

if (require.main === module) {
  run().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}

module.exports = {
  loginToDialog,
  sendDialogSmsBatch,
  normalizePhoneNumber,
  loadSentLog,
  saveSentLog,
  loadEnv,
};
