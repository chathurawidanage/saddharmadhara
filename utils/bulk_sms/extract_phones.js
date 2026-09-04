const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

/**
 * Normalizes phone number to 07xxxxxxxx format, matching admin/src/services/invitationService.ts
 * @param {string} phone
 * @returns {string}
 */
const normalizePhoneNumber = (phone) => {
  if (!phone) return "";
  return phone.replace(/^\+94/, "0");
};

/**
 * Expands scientific notation (e.g. 7.14449283E8 -> "714449283")
 * @param {string|number} str
 * @returns {string}
 */
const parseScientificNotation = (str) => {
  const num = Number(str);
  if (!isNaN(num)) {
    return num.toLocaleString("fullwide", { useGrouping: false });
  }
  return String(str);
};

/**
 * Cleans string of non-breaking spaces and whitespace
 * @param {any} str
 * @returns {string}
 */
const cleanString = (str) => {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/[\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/g, " ")
    .trim();
};

/**
 * Validates whether a phone number matches Sri Lankan mobile format (07xxxxxxxx)
 * @param {string} phone
 * @returns {boolean}
 */
const isValidSriLankanMobile = (phone) => {
  return /^07\d{8}$/.test(phone);
};

/**
 * Parses a single token/substring into a normalized phone candidate
 * @param {string} token
 * @returns {string|null}
 */
const parseTokenToPhone = (token) => {
  if (!token) return null;
  let s = token.trim();

  // Strip common label prefixes like 'Whats:', 'Mobile:', 'WhatsApp no.', etc.
  s = s.replace(
    /^(?:mobile|whatsapp|what'?s|phone|tel|contact|normal|no)\s*[:\.\-]?\s*/i,
    "",
  );
  s = s.replace(/^no\.\s*/i, "");

  // Expand scientific notation if present
  if (/^[+-]?\d+(?:\.\d+)?[eE][+-]?\d+$/.test(s)) {
    s = parseScientificNotation(s);
  }

  // Replace leading letter 'O' or 'o' with '0' (e.g. O77 -> 077)
  s = s.replace(/^[Oo](\d+)/, "0$1");

  // Preserve leading '+' for international numbers, strip all other non-digits
  const hasPlus = s.startsWith("+");
  let cleaned = s.replace(/[^\d]/g, "");
  if (hasPlus) cleaned = "+" + cleaned;

  if (!cleaned || cleaned === "+") return null;

  // Skip NIC numbers (e.g. 9 digits followed by V/X)
  if (/^\d{9}[vVxX]$/i.test(s.trim())) return null;

  // Skip birth dates entered in phone field (e.g. 1965 11 07)
  if (/^(?:19|20)\d{6}$/.test(cleaned) && s.includes(" ")) return null;

  // Apply normalization matching admin invitationService
  let formatted = cleaned;
  if (formatted.startsWith("+94")) {
    formatted = normalizePhoneNumber(formatted);
  } else if (formatted.startsWith("0094")) {
    formatted = "0" + formatted.slice(4);
  } else if (/^94\d{9}$/.test(formatted)) {
    formatted = "0" + formatted.slice(2);
  } else if (/^7\d{8}$/.test(formatted)) {
    // 9 digits starting with 7 (lost leading 0 from Excel number conversion)
    formatted = "0" + formatted;
  } else if (/^07\d{8}[vV]$/i.test(s.trim())) {
    // Accidentally appended 'V' after mobile number
    formatted = formatted.slice(0, 10);
  }

  return formatted;
};

/**
 * Extracts and formats phone number from a raw cell value.
 * If multiple numbers exist, uses the first valid phone number.
 * @param {any} raw
 * @returns {string} Formatted phone number or empty string
 */
const extractPhoneNumber = (raw) => {
  if (raw === undefined || raw === null) return "";
  const str = cleanString(raw);
  if (!str) return "";

  const candidates = [];

  // Split by pipe '|', which commonly separates alternative/duplicate versions
  const pipeParts = str
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const part of pipeParts) {
    // Split sub-parts by slashes, newlines, commas before numbers, or keywords
    const subParts = part
      .split(
        /[\/\r\n]+|,\s*(?=[+0-9Oo])|\b(?:whatsapp|what'?s|mobile|normal)\b/i,
      )
      .map((s) => s.trim())
      .filter(Boolean);

    for (const sub of subParts) {
      const p = parseTokenToPhone(sub);
      if (p) {
        candidates.push(p);
      }
    }
  }

  // Fallback regex search if delimiters didn't produce candidates
  if (candidates.length === 0) {
    const matches = str.matchAll(/(?:\+94|0094|0)?[7]\d(?:[\s\-]?\d){7}/g);
    for (const m of matches) {
      const p = parseTokenToPhone(m[0]);
      if (p) candidates.push(p);
    }
  }

  if (candidates.length === 0) return "";

  // "If a person has multiple numbers, use only the first one."
  // If the first candidate is already a valid Sri Lankan mobile, return it immediately
  if (isValidSriLankanMobile(candidates[0])) {
    return candidates[0];
  }

  // If first candidate is malformed or invalid length (e.g. typo) but another candidate
  // in the same cell is a valid 07xxxxxxxx mobile number, prefer the valid one
  const validMobile = candidates.find((c) => isValidSriLankanMobile(c));
  if (validMobile) {
    return validMobile;
  }

  // Otherwise return the first candidate (e.g. landline or international)
  return candidates[0];
};

/**
 * Main execution function
 */
const run = () => {
  const inputArg = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
  const inputPath =
    inputArg || process.env.FILE || path.resolve(__dirname, "Caller-List.xlsx");

  const phonesOnly = process.argv.includes("--phones-only");
  const printAll = process.argv.includes("--print-all");

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: File not found at ${inputPath}`);
    process.exit(1);
  }

  const workbook = xlsx.readFile(inputPath);
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

  const results = [];
  let validMobileCount = 0;
  let otherCount = 0;
  let emptyCount = 0;

  rawRows.forEach((row, index) => {
    // Dynamically find name column
    const nameKey = Object.keys(row).find((k) =>
      /^(full\s*name|name)$/i.test(k.trim()),
    );
    // Dynamically find phone column
    const phoneKey = Object.keys(row).find((k) =>
      /^(phone|phone\s*number|mobile|phone\s*\/\s*whatsapp|contact)$/i.test(
        k.trim(),
      ),
    );

    const fullName = cleanString(nameKey ? row[nameKey] : row["Full Name"]);
    const rawPhone = phoneKey
      ? row[phoneKey]
      : row["Phone / WhatsApp"] || row["phone number"];

    // Skip section header / category rows where both name and phone are empty
    if (!fullName && (!rawPhone || String(rawPhone).trim() === "")) {
      return;
    }

    const formattedPhone = extractPhoneNumber(rawPhone);

    let status = "INVALID_OR_EMPTY";
    if (isValidSriLankanMobile(formattedPhone)) {
      status = "VALID_MOBILE";
      validMobileCount++;
    } else if (formattedPhone) {
      status = "OTHER_PHONE";
      otherCount++;
    } else {
      emptyCount++;
    }

    results.push({
      rowIndex: index + 2,
      fullName,
      rawPhone: String(rawPhone || ""),
      formattedPhone,
      status,
    });
  });

  const validResults = results.filter((r) => r.status === "VALID_MOBILE");
  const invalidResults = results.filter((r) => r.status !== "VALID_MOBILE");
  const uniqueValidPhones = new Set(validResults.map((r) => r.formattedPhone));

  // If user requested only phone numbers output (e.g. for piping)
  if (phonesOnly) {
    validResults.forEach((r) => {
      console.log(r.formattedPhone);
    });
    return;
  }

  // Print all records if requested
  if (printAll) {
    console.log("--- Extracted Phone Numbers ---");
    results.forEach((r) => {
      console.log(
        `Row ${r.rowIndex}: [${r.fullName}] => ${r.formattedPhone || "(none)"} (${r.status})`,
      );
    });
    console.log("-------------------------------\n");
  }

  // Always output summary statistics
  console.log(`Successfully processed: ${inputPath}`);
  console.log(`Sheet name: ${firstSheetName}`);
  console.log(`Total people rows: ${results.length}`);
  console.log(
    `Valid Sri Lankan mobile numbers (07xxxxxxxx): ${validResults.length} (${uniqueValidPhones.size} unique)`,
  );
  console.log(`Other phone numbers (landline / international): ${otherCount}`);
  console.log(`Empty or unresolvable numbers: ${emptyCount}`);

  if (invalidResults.length > 0) {
    console.log("\n--- Ignored Invalid / Non-mobile Records ---");
    invalidResults.forEach((r) => {
      let reason = "Empty phone field";
      if (r.rawPhone && r.rawPhone.includes("1965")) {
        reason = "Entered birth date instead of phone";
      } else if (r.formattedPhone.startsWith("+375")) {
        reason = "International number (Belarus)";
      } else if (r.formattedPhone.startsWith("61")) {
        reason = "International number (Australia)";
      } else if (r.formattedPhone.startsWith("647")) {
        reason = "International number (Canada)";
      } else if (
        r.formattedPhone.startsWith("011") ||
        r.formattedPhone.startsWith("11") ||
        r.formattedPhone.startsWith("25") ||
        r.formattedPhone.startsWith("34") ||
        r.formattedPhone.startsWith("38")
      ) {
        reason = `Landline number (cannot receive SMS): ${r.formattedPhone}`;
      } else if (r.formattedPhone.length > 0 && r.formattedPhone.length < 10) {
        reason = `Incomplete number (${r.formattedPhone.length} digits: ${r.formattedPhone})`;
      }
      console.log(
        `Row ${r.rowIndex}: [${r.fullName}] Raw: "${r.rawPhone}" => Reason: ${reason}`,
      );
    });
  }

  // Determine output filenames based on input file name
  const inputBase = path
    .basename(inputPath, path.extname(inputPath))
    .replace(/\s+/g, "-");
  const outCsvPath = path.resolve(__dirname, `${inputBase}-Formatted.csv`);
  const outXlsxPath = path.resolve(__dirname, `${inputBase}-Formatted.xlsx`);

  // Save outputs to CSV and XLSX (only valid numbers)
  const csvHeaders = ["Name", "Phone"];
  const csvRows = [
    csvHeaders.join(","),
    ...validResults.map((r) =>
      [`"${r.fullName.replace(/"/g, '""')}"`, `"${r.formattedPhone}"`].join(
        ",",
      ),
    ),
  ];
  fs.writeFileSync(outCsvPath, "\uFEFF" + csvRows.join("\n") + "\n", "utf8");
  console.log(`\nSaved CSV (valid numbers only) to: ${outCsvPath}`);

  const exportData = validResults.map((r) => ({
    Name: r.fullName,
    Phone: r.formattedPhone,
  }));
  const outWorksheet = xlsx.utils.json_to_sheet(exportData);
  const outWorkbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(
    outWorkbook,
    outWorksheet,
    `${inputBase} Formatted`.slice(0, 31),
  );
  xlsx.writeFile(outWorkbook, outXlsxPath);
  console.log(`Saved Excel (valid numbers only) to: ${outXlsxPath}`);
};

if (require.main === module) {
  run();
}

module.exports = {
  normalizePhoneNumber,
  extractPhoneNumber,
  isValidSriLankanMobile,
  parseScientificNotation,
};
