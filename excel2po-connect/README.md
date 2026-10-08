# Excel2PO

Excel2PO is a browser-based tool for converting spreadsheet data into fixed-width PO transmission files used in a Business Central-style workflow.

It lets you upload an Excel workbook, map the columns to PO fields, validate the generated payload, and export the final text output for downstream transmission.

## Features

- Upload `.xlsx` files and inspect worksheet data
- Map source columns to PO field definitions
- Save and reuse mapping profiles
- Validate generated PO data before export
- Generate fixed-width output with CRLF formatting
- Preview and download the final file
- Track conversion history, validation issues, logs, and settings
- Optional persistence with Supabase

## Tech stack

- React + TypeScript
- Vite + TanStack Router + TanStack Start
- Tailwind styling with BC-inspired UI components
- `xlsx` for workbook parsing
- `zod` for validation
- Vitest for tests
- Optional Supabase storage

## Quick start

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

### Production build

```bash
npm run build
```

### Run tests

```bash
npm test
```

### Lint

```bash
npm run lint
```

## Environment variables

The app works without Supabase for local conversion tasks, but if you want to enable saved profiles/history/settings, add a `.env` file in the project root:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

If these values are not configured, the app still runs in local mode and skips persistence features.

## Project structure

- `src/routes/` — application screens and routing
- `src/lib/po/` — conversion, validation, and PO generation logic
- `src/components/bc/` — reusable BC-inspired UI shell components
- `src/tests/` — regression tests for the PO conversion flow
- `supabase/migrations/` — database schema used for optional persistence
- `README_SUPABASE.md` — Supabase-specific setup notes

## Typical workflow

1. Upload an Excel workbook
2. Select the sheet to convert
3. Map columns to the required PO fields
4. Review the generated header defaults
5. Validate the output
6. Generate and preview the final PO text
7. Download the file

## Output behavior

The converter builds a Paltrack-style fixed-width PO message with standard record blocks such as header, order, and trailer sections. Validation checks include record length consistency, totals, and known PO field constraints before the output is treated as valid.

## Optional Supabase setup

The project includes the migration file:

- `supabase/migrations/001_create_po_tables.sql`

To enable persistence:

1. Create a Supabase project
2. Open the SQL editor
3. Run the migration
4. Add the environment variables above

For more detail, see [README_SUPABASE.md](README_SUPABASE.md).

## Notes

- The main conversion flow is designed for `.xlsx` files.
- Uploads are limited to the app's configured size threshold.
- The generated output is plain text fixed-width PO data intended for downstream transmission workflows.
- The app keeps a BC-style interface pattern while remaining browser-based and lightweight.
- SAMSA Accreditation: 710–719
- Weighing Location: 720–726
- Weighing Date Time: 727–739
- Main Area: 740–741
- Production Area: 742–757
- Phyto Data: 758–767
- Customer Order: 768–807
- Re-inspection Document: 808–817
- Old eLot Key: 818–827
- Agreement Code: 828–837
- Post Treatment: 838–977
- Reference Number: 978–997
- eLot Key: 998–1012

Do not place descriptive text such as “Orleans”, “Generic” or “Group 2” into short coded fields unless a mapping exists.

Create code translation tables for descriptive Excel values.

Example:

“South Africa” → “ZA”
“Export” → “E”
“Pallet” → “P”
“No” → “N”
“Yes” → “Y”
“Generic” → “G”

Unknown descriptions must generate a warning or error instead of silently truncating the value.

==================================================
8. SSCC AND PALLET ID RULES
==================================================

Support a single 18-character barcode/SSCC value:

- The barcode field and SSCC field are treated as the same identifier
- An 18-digit barcode is valid as the SSCC

If the Excel contains an 18-character barcode/SSCC:

- Place it in positions 316–333
- Leave pallet ID positions 13–21 blank unless specifically configured

If the Excel contains a 9-character value instead:

- Reject it as invalid for SSCC/barcode
- Do not invent an SSCC
- Show a warning that the barcode/SSCC is blank or invalid

Validate that SSCC/barcode values:

- Contain exactly 18 digits
- Preserve leading zeroes
- Are loaded from Excel as text
- Are not converted to scientific notation

==================================================
9. NUMERIC FORMATTING
==================================================

Preserve exact fixed-width numeric formatting.

Examples:

Carton quantity:
- Width 5
- Integer
- Example: 00040

Pallet quantity:
- Width 9
- Support the configured decimal layout

Nett mass:
- Width 9
- Numeric format compatible with the Paltrack specification

Pallet gross mass:
- Width 10
- Numeric format with three decimal positions
- Example: 1409.00 when required by the target layout

Do not use locale-specific commas.

Always use a period as the decimal separator.

Validate negative values.

Preserve leading zeroes.

==================================================
10. DATE AND TIME FORMATTING
==================================================

Support Excel date values, ISO strings and text dates.

Output formats:

Date:
yyyymmdd

Time:
hh:mm

Date and time:
yyyymmddhh:mm

Create reusable backend functions:

parseExcelDate()
formatPODate()
formatPOTime()
formatPODateTime()

Return a clear validation error for invalid dates.

Do not silently use today’s date when an input date is invalid.

==================================================
11. BATCH TRAILER CALCULATIONS
==================================================

The BT record must be calculated by the backend.

Fields:

- Record count
- OH count
- OL count
- OC count
- OK count
- OP count
- Total carton count
- Total pallet count

Record count must include BH and BT.

For example, with:

- 1 BH
- 1 OH
- 1 OL
- 1 OK
- 1 OC
- 22 OP
- 1 BT

The total record count must be 28.

Do not hardcode these totals.

Calculate totals from generated records.

Compare:

- OP carton totals
- OK carton totals
- OC carton totals
- OH carton totals
- BT carton totals

Display an error when totals do not agree.

==================================================
12. BACKEND MODULES
==================================================

Create the following backend modules:

src/
  api/
    upload.routes.ts
    conversion.routes.ts
    validation.routes.ts
    mapping.routes.ts
    history.routes.ts
    health.routes.ts

  controllers/
    upload.controller.ts
    conversion.controller.ts
    validation.controller.ts

  services/
    excel-reader.service.ts
    mapping.service.ts
    po-generator.service.ts
    validation.service.ts
    file-storage.service.ts
    conversion-history.service.ts

  records/
    bh.builder.ts
    oh.builder.ts
    ol.builder.ts
    ok.builder.ts
    oc.builder.ts
    op.builder.ts
    bt.builder.ts

  utils/
    fixed-width.ts
    date-format.ts
    numeric-format.ts
    text-format.ts
    line-endings.ts

  schemas/
    conversion.schema.ts
    mapping.schema.ts
    header.schema.ts
    pallet.schema.ts

  models/
    conversion-job.model.ts
    validation-error.model.ts
    mapping-profile.model.ts

  middleware/
    error-handler.ts
    upload-limit.ts
    request-logger.ts

  tests/
    fixed-width.test.ts
    op-builder.test.ts
    po-generator.test.ts
    validation.test.ts

==================================================
13. API ENDPOINTS
==================================================

Create these backend endpoints:

GET /api/health

Return backend status and version.

POST /api/uploads/excel

Upload and inspect an Excel file.

Return:

- uploadId
- fileName
- worksheets
- headers
- rowCount
- previewRows

POST /api/conversions/validate

Validate the selected worksheet, header values and mapping.

POST /api/conversions/generate

Generate the PO file.

Return:

- conversionId
- status
- fileName
- recordCount
- palletCount
- cartonCount
- warnings
- validationSummary

GET /api/conversions/:id

Return conversion details.

GET /api/conversions/:id/preview

Return the generated PO text.

GET /api/conversions/:id/download

Download the .000 file.

GET /api/conversions/:id/report

Download the validation report.

GET /api/conversions

Return conversion history.

POST /api/mappings

Save a mapping profile.

GET /api/mappings

Return mapping profiles.

DELETE /api/mappings/:id

Delete a mapping profile.

==================================================
14. DEBUGGING AND LOGGING
==================================================

Debugging must be a major feature.

Every conversion must have a unique conversion ID.

Log each processing stage:

- File received
- Excel opened
- Worksheet selected
- Headers detected
- Mapping applied
- Rows parsed
- Validation started
- Validation completed
- Record generation started
- BH generated
- OH generated
- OL generated
- OK generated
- OC generated
- OP records generated
- BT generated
- Record lengths validated
- Totals validated
- Output file created
- Download requested

Each log entry must contain:

- Timestamp
- Log level
- Conversion ID
- Module
- Action
- Row number where applicable
- Field name where applicable
- Error message
- Stack trace for unexpected backend errors

Add a System Logs page in the frontend.

Allow filtering by:

- Conversion ID
- Log level
- Date
- Module
- Message

Never expose sensitive server paths or stack traces to normal users.

Allow stack traces only in development mode.

==================================================
15. VALIDATION ERROR FORMAT
==================================================

Return errors in this structure:

{
  "code": "INVALID_FIELD_LENGTH",
  "message": "Container number must be exactly 11 characters.",
  "recordType": "OP",
  "excelRow": 7,
  "field": "container",
  "fromPosition": 61,
  "toPosition": 71,
  "expectedLength": 11,
  "actualLength": 12,
  "value": "MSDU97214770"
}

Display errors in a Business Central-style list page.

Columns:

- Severity
- Excel Row
- Record Type
- Field
- Error Code
- Message
- Current Value
- Expected Format

Clicking an error must open a FactBox showing the complete details.

==================================================
16. MAPPING SCREEN
==================================================

Create a mapping grid.

Columns:

- Excel Header
- Sample Value
- PO Field
- Record Type
- Start Position
- End Position
- Data Type
- Required
- Transformation
- Status

Allow transformations:

- None
- Trim
- Uppercase
- Lowercase
- Text to code
- Date formatting
- Numeric formatting
- Zero padding
- Left padding
- Right padding
- Default value
- Lookup mapping

Allow the user to save mappings as reusable profiles.

Store mappings independently from conversion jobs.

==================================================
17. DATABASE
==================================================

Use PostgreSQL.

Use Prisma ORM.

Tables:

conversion_jobs
uploaded_files
mapping_profiles
mapping_fields
validation_errors
generated_files
system_logs

conversion_jobs fields:

- id
- status
- source_file_name
- output_file_name
- selected_sheet
- mapping_profile_id
- total_rows
- valid_rows
- invalid_rows
- warning_count
- record_count
- pallet_count
- carton_count
- started_at
- completed_at
- created_at
- updated_at

Statuses:

- Uploaded
- Mapping Required
- Validating
- Validation Failed
- Ready
- Generating
- Completed
- Failed

Do not store large generated file contents directly in database fields.

Store file metadata in the database and file content in backend storage.

==================================================
18. SECURITY
==================================================

Validate file extensions and MIME types.

Only allow:

.xlsx

Reject:

.xls
.csv
.exe
.zip
.js
.html

Limit upload size.

Generate safe server-side file names.

Prevent path traversal.

Do not execute formulas or macros from Excel.

Do not trust workbook file names.

Do not expose internal storage paths.

Delete temporary files after the configured retention period.

==================================================
19. TESTING
==================================================

Backend tests are mandatory.

Create unit tests for:

- Fixed-width insertion
- Numeric padding
- Alpha padding
- Field overflow
- Date conversion
- Excel serial dates
- Leading zero preservation
- SSCC validation
- OP length equals 1012
- BT count calculations
- CRLF line endings
- Invalid container numbers
- Invalid record lengths
- Unknown code descriptions
- Totals not balancing

Create an integration test that:

1. Loads a test Excel file.
2. Maps the columns.
3. Generates the complete PO file.
4. Verifies the record sequence.
5. Verifies every record length.
6. Verifies the BT counts.
7. Verifies that the file can be read as plain text.

Add a backend command:

npm run test

Add a development command:

npm run dev

Add a build command:

npm run build

==================================================
20. FRONTEND PAGES
==================================================

Dashboard:

Show:

- Conversions today
- Successful conversions
- Failed conversions
- Files awaiting validation
- Total pallet records generated
- Recent conversions
- Recent errors

File Converter page:

Use Business Central FastTabs:

- General
- File Information
- PO Header
- Column Mapping
- Excel Preview
- Validation
- Generated PO Preview
- Processing Log

Mapping Profiles page:

Display saved mapping profiles in a compact BC-style list.

Conversion History page:

Columns:

- Conversion ID
- Source File
- Output File
- Status
- Pallets
- Cartons
- Errors
- Created Date
- Completed Date

Validation Errors page:

Display all validation failures.

System Logs page:

Display structured backend logs.

Settings page:

Allow configuration of:

- Default source address
- Default destination address
- Provider
- Version
- Default organisation
- Default country
- Default channel
- Output encoding
- CRLF enforcement
- Allow alpha truncation
- Treat warnings as errors
- File retention period

==================================================
21. BACKEND-FIRST PRIORITY
==================================================

Spend approximately:

- 75% of implementation effort on backend logic
- 25% on frontend presentation

Build and test the backend conversion engine before creating advanced UI features.

The frontend may initially be simple, but the backend must be reliable and modular.

Do not put core conversion code inside React components.

Do not generate the PO file in the browser.

Do not rely on frontend validation alone.

All critical validation must run again on the backend.

==================================================
22. DEVELOPER DOCUMENTATION
==================================================

Create:

README.md
docs/architecture.md
docs/api.md
docs/po-record-layout.md
docs/debugging.md
docs/mapping-guide.md

The README must contain:

- Project overview
- Architecture
- Folder structure
- Installation
- Environment variables
- Database setup
- How to run frontend
- How to run backend
- How to run tests
- How to debug a conversion
- How to add a new PO field
- How to add a new record type
- How to add a mapping transformation

==================================================
23. INITIAL DELIVERY
==================================================

For the initial version, build:

1. Separate frontend and backend folders.
2. Excel upload.
3. Worksheet selection.
4. Excel preview.
5. Header form.
6. Column mapping.
7. Backend validation.
8. Fixed-width PO generation.
9. PO text preview.
10. .000 download.
11. Validation report.
12. Structured processing logs.
13. Conversion history.
14. Unit tests.
15. Swagger API documentation.

Use mock data only where unavoidable.

Do not create a marketing homepage.

Open the application directly on the Excel to PO Conversion page.

The finished application must feel like an internal Microsoft Business Central utility used by operations and technical support teams.


Also add this as a second instruction after Lovable creates the first version:

Review the entire generated application and refactor it to enforce strict frontend/backend separation.

Move every Excel parsing, PO mapping, fixed-width formatting, validation, total calculation and file generation function into the backend.

The frontend must only:

- Upload files
- Collect user input
- Display previews
- Call API endpoints
- Display results and validation errors
- Download generated files

Add detailed backend unit tests before improving visual styling.

Confirm that:

- OP records are exactly 1012 characters.
- BT records are exactly 60 characters.
- Every PO line uses CRLF line endings.
- Leading zeroes are preserved.
- Excel numbers are not converted to scientific notation.
- All record totals are calculated dynamically.
- Backend errors include the Excel row, PO record type, field name and character positions.
- The generated file downloads with a .000 extension.
- The UI resembles Microsoft Dynamics 365 Business Central and not a marketing website.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://excel2po-connect.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1ac2a44e-d75f-4c21-bc6c-5e2834e72f55).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
