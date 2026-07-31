# Excel to PO Forge

Paste the following into Lovable:

Build a production-ready web application called “Excel to PO Converter”.

The application must convert an uploaded Excel file into a Paltrack-style fixed-width PO transmission file that can be opened in Notepad and downloaded with a .000 extension.

The application must prioritise backend functionality, validation, debugging, logging and maintainability over visual effects.

==================================================
1. ARCHITECTURE
==================================================

Use a cleanly separated frontend and backend architecture.

Project structure:

/frontend
/backend
/shared
/docs

Frontend:
- React
- TypeScript
- Vite
- Fluent UI or a custom Microsoft Dynamics 365 Business Central-inspired design system
- Axios or a typed API client
- No PO conversion logic in the frontend

Backend:
- Node.js
- TypeScript
- Express or Fastify
- All Excel parsing, field mapping, fixed-width formatting, validation and file generation must happen in the backend
- Use ExcelJS for reading Excel files
- Use Zod for request and mapping validation
- Use structured logging with Pino
- Use Jest or Vitest for unit tests
- Add Swagger/OpenAPI documentation
- Keep backend code modular and easy to debug

The frontend and backend must run independently.

Frontend environment variable:

VITE_API_BASE_URL=http://localhost:3001/api

Backend environment variables:

PORT=3001
LOG_LEVEL=debug
MAX_UPLOAD_SIZE_MB=20
OUTPUT_DIRECTORY=./output

Do not tightly couple the frontend to the backend.

==================================================
2. MAIN PURPOSE
==================================================

The user must be able to:

1. Upload an Excel file.
2. Preview the Excel data.
3. Map Excel columns to PO fields.
4. Validate the data.
5. Generate a correctly structured fixed-width PO file.
6. Preview the PO file as plain text.
7. Download the PO file with a .000 extension.
8. Download a validation report.
9. View detailed processing logs.
10. Identify exactly which row and field caused an error.

The generated file must open correctly in Windows Notepad.

Use Windows CRLF line endings.

Do not generate CSV output.

Do not separate fields with commas, tabs, semicolons or pipes.

The PO file is a fixed-width plain-text file.

==================================================
3. BUSINESS CENTRAL-STYLE UI
==================================================

Make the interface look similar to Microsoft Dynamics 365 Business Central.

Use:

- Segoe UI font
- White and very light grey backgrounds
- Dark blue page headings
- A left navigation rail
- A Business Central-style command bar
- Compact tables
- Subtle borders
- Flat buttons
- Minimal rounded corners
- Status indicators
- FactBox-style side panels
- Fast, professional and business-focused design
- No gradients
- No oversized cards
- No excessive animations
- No landing-page marketing design

Main navigation:

- Dashboard
- Convert Excel
- Mapping Profiles
- Conversion History
- Validation Errors
- System Logs
- Settings

The default page must be “Convert Excel”.

Page title:

Excel to PO Conversion

Command bar actions:

- Upload Excel
- Load Sample PO
- Validate
- Generate PO
- Download PO
- Download Validation Report
- Clear
- Refresh

Use Business Central-style status colours:

- Green: Valid
- Red: Error
- Orange: Warning
- Blue: Processing
- Grey: Not processed

==================================================
4. CONVERSION WORKFLOW
==================================================

Step 1: Upload Excel

Allow the user to drag and drop or browse for an .xlsx file.

Display:

- File name
- File size
- Sheet names
- Number of rows
- Number of columns
- Upload date and time

Step 2: Select worksheet

Allow the user to choose which worksheet contains the pallet data.

Step 3: Map columns

Display two columns:

Excel Column
PO Field

Automatically suggest mappings based on column names.

Allow the user to save a mapping profile.

Example mapping profiles:

- Paltrack PO
- Packhouse PO
- Cold Store PO
- Custom PO

Step 4: Enter header information

Create a Business Central-style FastTab called “PO Header”.

Fields:

- Source Address
- Destination Address
- Sequence Number
- Batch Number
- Load ID
- Load Reference
- Location Code
- Container Number
- Seal Number
- Consignment Number
- Organisation Code
- Country Code
- Channel
- Destination Type
- Destination Location
- Stuffing Date
- Transaction Date
- Transaction Time
- Provider
- Version
- File Name

Automatically generate the file name using:

PO + source address + sequence number + . + destination address

Example:

POEGJ465.000

Allow the user to override the generated file name.

Step 5: Validate

Run backend validation before generation.

Step 6: Generate

Generate the complete fixed-width PO file.

Step 7: Preview

Show the generated file in a monospaced text preview.

Use a fixed-width font such as Consolas.

Allow horizontal scrolling.

Display line numbers.

Step 8: Download

Download the generated file with:

- .000 extension
- plain-text content
- CRLF line endings
- no UTF-8 BOM unless specifically configured

==================================================
5. REQUIRED RECORD STRUCTURE
==================================================

The PO file must be generated in this nested sequence:

BH
OH
OL
OK
OC
OP
OP
OP
...
BT

Support multiple OL, OK, OC and OP records in the future, but the first version may generate:

- 1 BH
- 1 OH
- 1 OL
- 1 OK
- 1 OC
- multiple OP records
- 1 BT

Every line must begin with its two-character record type.

Record definitions:

BH = Batch Header
OH = Truck Header
OL = Transport Location
OK = Container Record
OC = Consignment Record
OP = Pallet Record
BT = Batch Trailer

The backend must not generate the file by manually concatenating random values.

Create reusable fixed-width record builders.

Example:

buildBHRecord()
buildOHRecord()
buildOLRecord()
buildOKRecord()
buildOCRecord()
buildOPRecord()
buildBTRecord()

Create a general helper:

setFixedWidthField(buffer, fromPosition, toPosition, value, options)

Positions are 1-based and inclusive.

The helper must:

- Convert values to strings
- Trim values
- Prevent values from overlapping other fields
- Truncate alpha values only when explicitly allowed
- Right-align numeric fields
- Left-align alpha fields
- Pad numeric fields with zeroes where required
- Pad alpha fields with spaces
- Validate field lengths
- Return descriptive errors
- Preserve exact character positions

==================================================
6. RECORD LENGTHS
==================================================

Use the configured Paltrack record layout.

Required default record lengths:

BH: 89 characters
OH: 309 characters
OL: 100 characters
OK: 370 characters
OC: 220 characters
OP: 1012 characters
BT: 60 characters

The backend must verify every generated record length before allowing download.

If a record is too short or too long, block generation and return:

- Record type
- Row number
- Expected length
- Actual length
- Field that caused the problem

==================================================
7. IMPORTANT OP FIELD POSITIONS
==================================================

Build the OP pallet record using exact fixed-width positions.

Important fields include:

- Record Type: 1–2
- Load ID: 3–12
- Pallet ID: 13–21
- Sequence Number: 22–26
- Unit Type: 27
- Destination Type: 42–43
- Destination Location: 44–50
- Consignment Number: 51–60
- Container Number: 61–71
- Container Split: 72
- Channel: 73
- Organisation: 74–75
- Country: 76–77
- Commodity Group: 78–79
- Commodity: 80–81
- Variety Group: 82–83
- Variety: 84–86
- Sub Variety: 87–89
- Actual Variety: 90–92
- Pack: 93–96
- Grade: 97–100
- Mark: 101–105
- Size Count: 106–110
- Farm: 117–123
- Target Market: 129–130
- Carton Quantity: 131–135
- Pallet Quantity: 136–144
- Mixed Indicator: 145
- Intake Date: 158–165
- Original Depot: 166–172
- Original Intake Date: 173–180
- Shift: 181
- Shift Date: 182–189
- Order Number: 190–195
- Location Code: 196–202
- Shipped Date: 207–219
- Transmit Flag: 220
- Revision: 221–225
- Message Number: 226–233
- Transaction User: 234–240
- Transaction Date: 241–248
- Transaction Time: 249–253
- Pallet Bin Type: 254
- Original Consignment: 255–264
- Ship Number: 265–270
- Temperature: 271–276
- SSCC: 316–333
- Nett Mass: 334–342
- Inspection Date: 397–404
- Batch Number: 407–426
- Waybill Number: 427–436
- GTIN: 437–450
- Packhouse Code: 451–457
- Inspector: 492–497
- Inspection Point: 498–503
- Orchard: 514–528
- Target Region: 529–533
- Target Country: 534–535
- Global GAP Number: 536–555
- Lot Number: 556–575
- Traceability Code: 576–595
- Season: 596–599
- Original Inspection Date: 600–607
- Inner Pack: 608–617
- Inner Cartons: 618–622
- Production ID: 623–642
- Protocol Exception Indicator: 643–644
- UPN: 645–669
- Pallet Treatment: 670–699
- Pallet Gross Mass: 700–709
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

Support both:

- 9-character pallet ID
- 18-character SSCC

If the Excel contains an 18-character SSCC:

- Place it in positions 316–333
- Leave pallet ID positions 13–21 blank unless specifically configured

If the Excel contains only a 9-character pallet ID:

- Place it in positions 13–21
- Do not invent an SSCC
- Show a warning that SSCC is blank

Validate that SSCC values:

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
- Example: 001409.000 when required by the target layout

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

Convert Excel page:

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
