# Bulk SMS & Phone Utility Tools

This folder contains utility scripts for extracting valid Sri Lankan phone numbers and sending bulk SMS messages via the Dialog eSMS API.

## Directory Contents

- **`sample_recipients.csv`**: A reference format showing the required `Name,Phone` columns with valid `07xxxxxxxx` numbers.
- **`extract_phones.js`**: Parses Excel (`.xlsx`) or CSV files, cleans names, filters and normalizes phone numbers to standard `07xxxxxxxx` format, and outputs `<name>-Formatted.csv` and `.xlsx`.
- **`send_bulk_sms.js`**: Sends SMS via Dialog eSMS v2 API in batches (default: 50 recipients per request), respecting delivery deduplication through `sent_sms.json`.
- **`export_dhis2_tracked_entities.js`**: Fetches all tracked entities from DHIS2, normalizes phone numbers, and exports formatted CSV/XLSX lists.

---

## Usage Guide

### 1. Extract & Format Numbers from an Excel / CSV File
```bash
node utils/bulk_sms/extract_phones.js <path-to-excel-or-csv-file>
```
Outputs:
- `<filename>-Formatted.csv`
- `<filename>-Formatted.xlsx`

### 2. Preview SMS Send (Dry-run)
```bash
node utils/bulk_sms/send_bulk_sms.js <path-to-formatted-csv> --dry-run
```

### 3. Send Bulk SMS
```bash
node utils/bulk_sms/send_bulk_sms.js <path-to-formatted-csv>
```

Options:
- `--message="Your message"`: Custom message text (defaults to the template in the script or `SMS_MESSAGE` in `.env`).
- `--batch-size=50`: Number of recipients per API request (default: 50).
- `--delay=500`: Milliseconds delay between batches (default: 500).
- `--dry-run`: Validate credentials and show recipients/batches without sending.

### 4. Fetch Tracked Entities from DHIS2
```bash
node utils/bulk_sms/export_dhis2_tracked_entities.js
```
